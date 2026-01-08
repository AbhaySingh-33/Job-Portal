import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sql } from "../utils/db.js";

dotenv.config();

interface User {
    user_id: number;
    name: string;
    email: string;
    phone_number: string;
    role: "jobseeker" | "recruiter";
    bio: string | null;
    resume: string | null;
    resume_public_id: string | null;
    profile_pic: string | null;
    profile_pic_public_id: string | null;
    skills: string[];
    subscription: string | null;
}

export interface AuthenticatedRequest extends Request {
    user?: User;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("Auth middleware - Headers:", req.headers.authorization);
        
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("Auth failed: Missing or invalid authorization header");
            res.status(401).json({
                message: "Authorization header is missing or invalid",
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        console.log("Token extracted:", token ? "Present" : "Missing");

        const decodedPayload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;

        if (!decodedPayload || !decodedPayload.id) {
            console.log("Auth failed: Invalid token payload");
            res.status(401).json({
                message: "Invalid or expired token",
            });
            return;
        }

        console.log("Token decoded, user ID:", decodedPayload.id);

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
            WHERE u.user_id = ${decodedPayload.id}
            GROUP BY u.user_id;
        `;

        if (users.length === 0) {
            console.log("Auth failed: User not found in database");
            res.status(401).json({
                message: "User not found",
            });
            return;
        }

        const user = users[0] as User;
        user.skills = user.skills || [];
        req.user = user;
        
        console.log("Auth successful for user:", user.name);
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            message: "Authentication failed. Please Login again",
        });
    }
};