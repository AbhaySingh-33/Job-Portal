import { Request, Response, NextFunction } from "express";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate, getVerifyEmailHtml, getOtpHtml } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";
import crypto from "crypto";

export const registerUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phoneNumber, role, bio } = req.body;

    if (!name || !email || !password || !phoneNumber || !role) {
      throw new ErrorHandler("Please fill all details", 400);
    }

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

    if (await redisClient.get(rateLimitKey)) {
      throw new ErrorHandler(
        "Too many registration attempts. Please try again later.",
        429
      );
    }

    const existingUsers =
      await sql`SELECT user_id FROM users WHERE email = ${email}`;

    if (existingUsers.length > 0) {
      throw new ErrorHandler("User with this email already exists", 409);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyKey = `verify:${verifyToken}`;
    
    let dataToStore: any = {
      name,
      email,
      password: hashPassword,
      phoneNumber,
      role,
      bio
    };

    // Handle file upload for jobseekers
    if (role === "jobseeker") {
      const file = req.file;
      const fileBuffer = getBuffer(file);

      if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler("Resume is required for jobseekers", 400);
      }

      const { data } = await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        { buffer: fileBuffer.content }
      );

      dataToStore.resume = data.url;
      dataToStore.resume_public_id = data.public_id;
    }

    await redisClient.set(verifyKey, JSON.stringify(dataToStore), { ex: 3600 }); // 1 hour expiration

    const message = {
      to: email,
      subject: "VERIFY YOUR EMAIL - HIRE HEAVEN",
      html: getVerifyEmailHtml(email, verifyToken),
    };

    //publish message to kafka topic
    publishToTopic("send-mail", message);
    
    await redisClient.set(rateLimitKey, "1", { ex: 60 }); // 1 minute rate limit

    res.json({
      message: "Verification email sent. Please check your inbox.",
    });
  }
);

//------------------- Verify Email ------------------//

export const verifyEmail = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    if (!token) {
      throw new ErrorHandler("Verification token is required", 400);
    }

    const verifyKey = `verify:${token}`;
    const storedData = await redisClient.get(verifyKey);

    if (!storedData) {
      throw new ErrorHandler("Invalid or expired verification token", 400);
    }

    const userData = typeof storedData === 'string' ? JSON.parse(storedData) : storedData;
    const { name, email, password, phoneNumber, role, bio, resume, resume_public_id } = userData;

    let registeredUser;

    if (role === "recruiter") {
      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role)
        VALUES (${name}, ${email}, ${password}, ${phoneNumber}, ${role})
        RETURNING user_id, name, email, phone_number, role, created_at;`;
      registeredUser = user;
    } else if (role === "jobseeker") {
      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) 
      VALUES(${name}, ${email}, ${password}, ${phoneNumber}, ${role}, ${bio}, ${resume}, ${resume_public_id}) 
      RETURNING user_id, name, email, phone_number, role, bio, resume, created_at`;
      registeredUser = user;
    }

    // Clean up verification token
    await redisClient.del(verifyKey);

    const authToken = jwt.sign(
      { id: registeredUser?.user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "10d" }
    );

    res.json({
      message: "Email verified and user registered successfully",
      user: registeredUser,
      token: authToken,
    });
  }
);

//------------------- Login User (Step 1: Verify credentials and send OTP) ------------------//

export const loginUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ErrorHandler("Please fill all details", 400);
    }

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;
    const attemptCount = await redisClient.get(rateLimitKey);
    
    if (attemptCount && parseInt(attemptCount as string) >= 5) {
      throw new ErrorHandler("Too many login attempts. Please try again later.", 429);
    }

    const user = await sql`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.password,
          u.phone_number,
          u.role,
          u.bio,
          u.resume,
          u.profile_pic,
          u.subscription,
          ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id
        WHERE u.email = ${email}
        GROUP BY u.user_id;
      `;

    if (user.length === 0) {
      await redisClient.incr(rateLimitKey);
      await redisClient.expire(rateLimitKey, 900); // 15 minutes
      throw new ErrorHandler("Invalid credentials", 400);
    }

    const userObject = user[0];
    const matchPassword = await bcrypt.compare(password, userObject.password);

    if (!matchPassword) {
      await redisClient.incr(rateLimitKey);
      await redisClient.expire(rateLimitKey, 900);
      throw new ErrorHandler("Invalid credentials", 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    
    await redisClient.set(otpKey, otp, { ex: 300 }); // 5 minutes expiration

    const message = {
      to: email,
      subject: "LOGIN VERIFICATION - HIRE HEAVEN",
      html: getOtpHtml(otp),
    };

    publishToTopic("send-mail", message);

    res.json({
      message: "OTP sent to your email. Please verify to complete login.",
      requiresOTP: true
    });
  }
);

//------------------- Verify OTP and Complete Login ------------------//

export const verifyOTPAndLogin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ErrorHandler("Email and OTP are required", 400);
    }

    const otpRateLimitKey = `otp-rate-limit:${req.ip}:${email}`;
    const otpCount = await redisClient.get(otpRateLimitKey);
    
    if (otpCount && parseInt(otpCount as string) >= 3) {
      throw new ErrorHandler("Too many OTP attempts. Please request a new OTP.", 429);
    }

    const otpKey = `otp:${email}`;
    const storedOTP = await redisClient.get(otpKey);

    console.log('OTP Debug:', { email, receivedOTP: otp, storedOTP, otpKey });

    if (!storedOTP) {
      throw new ErrorHandler("OTP expired or invalid", 400);
    }

    // Trim whitespace and ensure string comparison
    const cleanOTP = otp.toString().trim();
    const cleanStoredOTP = storedOTP.toString().trim();

    if (cleanStoredOTP !== cleanOTP) {
      await redisClient.incr(otpRateLimitKey);
      await redisClient.expire(otpRateLimitKey, 300); // 5 minutes
      throw new ErrorHandler("Invalid OTP", 400);
    }

    // OTP verified, get user data and complete login
    const user = await sql`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.phone_number,
          u.role,
          u.bio,
          u.resume,
          u.profile_pic,
          u.subscription,
          ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id
        WHERE u.email = ${email}
        GROUP BY u.user_id;
      `;

    const userObject = user[0];
    userObject.skills = userObject.skills || [];

    const token = jwt.sign(
      { id: userObject?.user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "10d" }
    );

    // Clean up OTP and rate limit keys
    await redisClient.del(otpKey);
    await redisClient.del(otpRateLimitKey);
    await redisClient.del(`login-rate-limit:${req.ip}:${email}`);

    res.json({
      message: "User logged in successfully",
      user: userObject,
      token,
    });
  }
);

//------------------- Forgot Password ------------------//

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ErrorHandler("email is required", 400);
  }

  const users =
    await sql`SELECT user_id, email FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    return res.json({
      message: "If that email exists, we have sent a reset link",
    });
  }
  const user = users[0];

  const resetToken = jwt.sign(
    {
      email: user.email,
      type: "reset",
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`;

  const message = {
    to: email,
    subject: "RESET YOUR PASSWORD - HIRE HEAVEN",
    html: forgotPasswordTemplate(resetLink),
  };

  await redisClient.set(`forget :${email}`, resetToken, { ex: 900 }); // 15 minutes expiration

  //publish message to kafka topic
      publishToTopic("send-mail", message);
  res.json({
    message: "If that email exists, we have sent a reset link",
  });
});

//------------------- Reset Password ------------------//

export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new ErrorHandler("Invalid or expired token", 400);
  }

  if (decoded.type !== "reset") {
    throw new ErrorHandler("Invalid or expired token", 400);
  }
  const email = decoded.email;

  const redisToken = await redisClient.get(`forget :${email}`);

  if (!redisToken || redisToken !== token) {
    throw new ErrorHandler("Invalid or expired token", 400);
  }

  await redisClient.del(`forget :${email}`);
  const hashPassword = await bcrypt.hash(password, 10);

  await sql`UPDATE users SET password = ${hashPassword} WHERE email = ${email}`;

  res.json({
    message: "Password reset successfully",
  });
});
