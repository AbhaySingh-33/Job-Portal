import { Request, Response, NextFunction } from "express";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import  ErrorHandler  from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../template.js";
import { publishToTOpic } from "../producer.js";
import { redisClient } from "../index.js";

export const registerUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, phoneNumber, role, bio } = req.body;

    if (!name || !email || !password || !phoneNumber || !role) {
      throw new ErrorHandler("Please fill all details",400);
    }

    const existingUsers =
      await sql`SELECT user_id FROM users WHERE email = ${email}`;

    if (existingUsers.length > 0) {
      throw new ErrorHandler("User with this email already exists",409);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let registeredUser;

    if (role === "recruiter") {
      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role)
                  VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role})
                  RETURNING user_id, name, email, phone_number, role, created_at;`;
      registeredUser = user;

    } else if (role === "jobseeker") {
      const file = req.file;

      const fileBuffer= getBuffer(file);

      if(!fileBuffer || !fileBuffer.content){
        throw new ErrorHandler("Failed to Generate Buffer",500);
      }

      const {data}=await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        {buffer: fileBuffer.content}
      );


      const [user] =   
      await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) 
      VALUES(${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) 
      RETURNING user_id, name, email, phone_number, role, bio, resume, created_at`;

      registeredUser = user;
    }

    const token = jwt.sign(
      { id: registeredUser?.user_id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: "10d" });

    res.json({
      message: "User registered successfully",
      registeredUser,
      token
    });
  }
);

//------------------- Login User ------------------//

export const loginUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ErrorHandler("Please fill all details",400);
    }

    const user =
      await sql`
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
      throw new ErrorHandler("Invalid credentials",400);
    }

    const userObject = user[0];

    const matchPassword = await bcrypt.compare(password, userObject.password);

    if (!matchPassword) {
      throw new ErrorHandler("Invalid credentials",400);
    }

    userObject.skills= userObject.skills || [];

    // remove password before sending response
    delete userObject.password;

    const token = jwt.sign(
      { id: userObject?.user_id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: "10d" });

    res.json({
      message: "User logged in successfully",
      user: userObject,
      token
    });
  }
);

//------------------- Forgot Password ------------------//

export const forgotPassword = TryCatch(async(req,res,next)=>{
  const {email} = req.body;

  if(!email){
    throw new ErrorHandler("email is required",400);
  }

  const users= 
    await sql`SELECT user_id, email FROM users WHERE email = ${email}`;
  
  if(users.length===0){
    return res.json({
      message: "If that email exists, we have sent a reset link",
    });
  }
  const user = users[0];

  const resetToken= jwt.sign(
    {
      email: user.email,type:"reset"
    },
    process.env.JWT_SECRET as string,
    {expiresIn:"15m"}
  );

  const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`

  const message = {
    to: email,
    subject: "RESET YOUR PASSWORD - HIRE HEAVEN",
    html: forgotPasswordTemplate(resetLink)
  }

  await redisClient.set(`forget :${email}`,resetToken,{ex:900}); // 15 minutes expiration

  //publish message to kafka topic
  publishToTOpic("send-mail", message);
  res.json({
    message: "If that email exists, we have sent a reset link",
  });

})

//------------------- Reset Password ------------------//

export const resetPassword = TryCatch(async(req,res,next)=>{
  const {token} = req.params;
  const {password} = req.body;

  let decoded: any;
  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch(error){
    throw new ErrorHandler("Invalid or expired token",400);
  }

  if(decoded.type !== "reset"){
    throw new ErrorHandler("Invalid or expired token",400);
  }
  const email = decoded.email;

  const redisToken = await redisClient.get(`forget :${email}`);

  if( !redisToken || redisToken !== token){
    throw new ErrorHandler("Invalid or expired token",400);
  }
  
  await redisClient.del(`forget :${email}`);
  const hashPassword = await bcrypt.hash(password,10);

  await sql`UPDATE users SET password = ${hashPassword} WHERE email = ${email}`;

  res.json({
    message: "Password reset successfully",
  });
});