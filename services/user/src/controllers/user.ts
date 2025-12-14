import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { TryCatch } from "../utils/TryCatch.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    res.json(user);
  }
);

export const getUserProfile = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  const users = await sql`
        SELECT 
            u.user_id,
            u.name,
            u.email,
            u.phone_number,
            u.role,
            u.bio,
            u.resume,
            u.resume_public_id,
            u.profile_pic,
            u.profile_pic_public_id,
            u.subscription,
            ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id
        WHERE u.user_id = ${userId}
        GROUP BY u.user_id;
    `;

  if (users.length === 0) {
    throw new ErrorHandler("User not found", 404);
  }

  const user = users[0];
  user.skills = user.skills || [];

  res.json(user);
});

export const updateUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    const { name, phone_number, bio } = req.body;

    const newName = name || user?.name;
    const newPhoneNumber = phone_number || user?.phone_number;
    const newBio = bio || user?.bio;

    const [updatedUser] = await sql`
      UPDATE users
      SET 
        name = ${newName},
        phone_number = ${newPhoneNumber},
        bio = ${newBio}
      WHERE user_id = ${user?.user_id}
      RETURNING user_id, name, email, phone_number, role, bio
    `;

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  }
);

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler("No image file provided", 400);
    }

    const oldPublicId = user.profile_pic_public_id;

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("Failed to generate file buffer", 500);
    }

    const { data: uploadResult } = await axios.post<{
      url: string;
      public_id: string;
    }>(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    });

    const [updatedUser] = await sql`
      UPDATE users
      SET 
        profile_pic = ${uploadResult.url},
        profile_pic_public_id = ${uploadResult.public_id}
      WHERE user_id = ${user.user_id}
      RETURNING user_id, name, email, phone_number, role, bio, profile_pic, profile_pic_public_id
    `;

    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  }
);

export const updateResume = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler("No pdf file provided", 400);
    }

    const oldPublicId = user.resume_public_id;

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("Failed to generate file buffer", 500);
    }

    const { data: uploadResult } = await axios.post<{
      url: string;
      public_id: string;
    }>(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    });

    const [updatedUser] = await sql`
      UPDATE users
      SET 
        resume = ${uploadResult.url},
        resume_public_id = ${uploadResult.public_id}
      WHERE user_id = ${user.user_id}
      RETURNING user_id, name, email, phone_number, role, bio, resume, resume_public_id
    `;
    res.json({
      message: "Resume updated successfully",
      user: updatedUser,
    });
  }
);

export const addSkillToUser = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;
    const { skillName } = req.body;

    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler("Please provide a skill name", 400);
    }

    let wasSkillAdded = false;

    try {
      await sql`BEGIN`;

      const users =
        await sql`SELECT user_id FROM users WHERE user_id =${userId}`;

      if (users.length === 0) {
        throw new ErrorHandler("User not found", 404);
      }

      const [skill] = await sql`
            INSERT INTO skills (name)
            VALUES (${skillName.trim()})
            ON CONFLICT (name) DO UPDATE
              SET name = EXCLUDED.name
            RETURNING skill_id;
          `;

      const skillId = skill.skill_id;

      const insertionResult = await sql`
            INSERT INTO user_skills (user_id, skill_id)
            VALUES (${userId}, ${skillId})
            ON CONFLICT (user_id, skill_id) DO NOTHING
            RETURNING user_id;
          `;

      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

    if (!wasSkillAdded) {
      return res.json({ message: "Skill already exists for the user" });
    }
    res.json({ message: `Skill ${skillName.trim()} added successfully` });
  }
);

export const deleteSkilFromUser = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    const { skillName } = req.body;

    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler("Pleas provide askill name", 400);
    }

    const result = await sql`
    DELETE FROM user_skills
    WHERE user_id=${user.user_id}
    AND skill_id=(SELECT skill_id FROM skills
    WHERE name=${skillName.trim()})
    RETURNING user_id;`;

    if (result.length === 0) {
      throw new ErrorHandler(
        `Skill ${skillName.trim()} not found for the user`,
        404
      );
    }

    res.json({ message: `Skill ${skillName.trim()} deleted successfully` });
  }
);

export const applyForJob = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Reqired", 401);
    }

    if (user.role !== "jobseeker") {
      throw new ErrorHandler(
        "Forbidden you are not allowed to apply for Job",
        400
      );
    }

    const applicant_id = user.user_id;

    const resume = user.resume;

    if (!resume) {
      throw new ErrorHandler(
        "You need to add resume to apply for this Job", 400);
    }

    const { job_id } = req.body;

    if (!job_id) {
      throw new ErrorHandler("Job id is required", 400);
    }

    const [job] =
      await sql`SELECT is_active FROM jobs WHERE job_id = ${job_id}`;

    if (!job) {
      throw new ErrorHandler("Job not found", 404);
    }

    if (!job.is_active) {
      throw new ErrorHandler("Job is not active", 400);
    }

    const now = Date.now();

    const subTime = req.user?.subscription
      ? new Date(req.user.subscription).getTime()
      : 0;

    const isSubscribed = subTime > now;

    let newApplication;

    try {
      const [application] = await sql`
        INSERT INTO applications (job_id, applicant_id, applicant_email, resume, subscribed)
        VALUES (${job_id}, ${applicant_id}, ${user?.email}, ${resume}, ${isSubscribed})
        RETURNING *;
      `;
      newApplication = application;
    } catch (error: any) {
      if (error.code === "23505") {
        throw new ErrorHandler("You have already applied to this job.", 409);
      }
      throw error;
    }

    res.json({
      message: "Job application successful",
      application: newApplication,
    });
  }
);

export const getAllApplications = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const applications =
      await sql`
        SELECT 
          a.*,
          j.title  AS job_title,
          j.salary AS job_salary,
          j.location AS job_location
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE a.applicant_id = ${req.user?.user_id};
      `;

    res.json(applications);
  }
);
 