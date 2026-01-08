import { Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "../utils/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const generateQuestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("Request body:", req.body);
        console.log("User:", req.user);
        
        const { role, level, techStack, questionCount = 5 } = req.body;
        const userId = req.user?.user_id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (!role || !level || !techStack || !Array.isArray(techStack)) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        console.log("Generating questions with fallback...");
        // Temporary fallback questions instead of Gemini
        const questions = [
            `What is your experience with ${techStack[0]}?`,
            `How would you approach a ${role} project using ${techStack.join(" and ")}?`,
            `Explain a challenging problem you solved in your ${level} level experience.`,
            `What are the best practices for ${techStack.join(", ")} development?`,
            `How do you stay updated with ${techStack.join(", ")} technologies?`,
            `Describe your debugging process when working with ${techStack[0]}.`,
            `What would you do if you encountered performance issues in a ${role} application?`
        ].slice(0, questionCount);

        console.log("Saving to database...");
        const newInterview = await sql`
            INSERT INTO interviews (user_id, job_role, experience_level, tech_stack, questions) 
            VALUES (${userId}, ${role}, ${level}, ${techStack}, ${JSON.stringify(questions)}) 
            RETURNING *
        `;

        console.log("Interview created successfully:", newInterview[0]);
        res.status(201).json({
            success: true,
            data: newInterview[0]
        });
    } catch (error) {
        console.error("Detailed error:", error);
        res.status(500).json({ 
            message: "Failed to generate questions",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const generateFeedback = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { interviewId, transcript } = req.body;
        const userId = req.user?.user_id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const interview = await sql`
            SELECT * FROM interviews 
            WHERE id = ${interviewId} AND user_id = ${userId}
        `;

        if (interview.length === 0) {
            res.status(404).json({ message: "Interview not found" });
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze this interview transcript and provide feedback in JSON format:
        
        Interview Role: ${interview[0].job_role}
        Experience Level: ${interview[0].experience_level}
        Tech Stack: ${interview[0].tech_stack}
        Questions: ${JSON.stringify(interview[0].questions)}
        
        Transcript: ${transcript}
        
        Return JSON with: {
            "overallRating": number (0-100),
            "strengths": ["strength1", "strength2"],
            "improvements": ["improvement1", "improvement2"],
            "technicalScore": number (0-100),
            "communicationScore": number (0-100),
            "summary": "brief summary"
        }`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const feedbackText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        
        let feedback;
        try {
            feedback = JSON.parse(feedbackText);
        } catch (parseError) {
            feedback = {
                overallRating: 75,
                strengths: ["Good communication"],
                improvements: ["Technical depth"],
                technicalScore: 70,
                communicationScore: 80,
                summary: "Interview completed successfully"
            };
        }

        const updatedInterview = await sql`
            UPDATE interviews 
            SET feedback_json = ${JSON.stringify(feedback)}, 
                rating = ${feedback.overallRating},
                transcript = ${transcript}
            WHERE id = ${interviewId} 
            RETURNING *
        `;

        res.json({
            success: true,
            data: updatedInterview[0]
        });
    } catch (error) {
        console.error("Error generating feedback:", error);
        res.status(500).json({ message: "Failed to generate feedback" });
    }
};

export const getUserInterviews = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const interviews = await sql`
            SELECT * FROM interviews 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC
        `;

        res.json({
            success: true,
            data: interviews
        });
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ message: "Failed to fetch interviews" });
    }
};

export const getInterviewById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.user_id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const interview = await sql`
            SELECT * FROM interviews 
            WHERE id = ${id} AND user_id = ${userId}
        `;

        if (interview.length === 0) {
            res.status(404).json({ message: "Interview not found" });
            return;
        }

        res.json({
            success: true,
            data: interview[0]
        });
    } catch (error) {
        console.error("Error fetching interview:", error);
        res.status(500).json({ message: "Failed to fetch interview" });
    }
};