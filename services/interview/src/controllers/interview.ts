import { Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "../utils/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// Helper function to determine question count based on experience level
const getQuestionCountByLevel = (level: string): number => {
    const normalizedLevel = level.toLowerCase().trim();
    
    if (normalizedLevel.includes('entry') || normalizedLevel.includes('junior') || normalizedLevel === 'fresher') {
        return 5; // Entry-level: 5 questions
    } else if (normalizedLevel.includes('mid') || normalizedLevel.includes('intermediate')) {
        return 7; // Mid-level: 7 questions
    } else if (normalizedLevel.includes('senior') || normalizedLevel.includes('expert') || normalizedLevel.includes('lead')) {
        return 10; // Senior: 10 questions
    }
    
    return 7; // Default: 7 questions
};

export const generateQuestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("Request body:", req.body);
        console.log("User:", req.user);
        
        const { role, level, techStack, questionCount } = req.body;
        const userId = req.user?.user_id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (!role || !level || !techStack || !Array.isArray(techStack)) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        // Determine question count based on level (can be overridden by request)
        const finalQuestionCount = questionCount || getQuestionCountByLevel(level);
        console.log(`Generating ${finalQuestionCount} questions for ${level} level...`);
        
        // Temporary fallback questions instead of Gemini
        const questionPool = [
            `What is your experience with ${techStack[0]}?`,
            `How would you approach a ${role} project using ${techStack.join(" and ")}?`,
            `Explain a challenging problem you solved in your ${level} level experience.`,
            `What are the best practices for ${techStack.join(", ")} development?`,
            `How do you stay updated with ${techStack.join(", ")} technologies?`,
            `Describe your debugging process when working with ${techStack[0]}.`,
            `What would you do if you encountered performance issues in a ${role} application?`,
            `Tell me about a time you had to work under tight deadlines.`,
            `How do you handle code reviews and feedback?`,
            `What's your approach to testing and quality assurance?`
        ];
        
        const questions = questionPool.slice(0, finalQuestionCount);

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

        console.log("📥 Feedback request received:", { interviewId, transcriptLength: transcript?.length, userId });

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (!transcript || transcript.trim().length === 0) {
            res.status(400).json({ message: "Transcript is required and cannot be empty" });
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

        console.log("🔍 Found interview:", interview[0].id, "- Generating feedback...");

        let feedback;
        
        // Try to generate feedback with Gemini, with fallback
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const prompt = `Analyze this interview transcript and provide feedback in JSON format:
            
            Interview Role: ${interview[0].job_role}
            Experience Level: ${interview[0].experience_level}
            Tech Stack: ${interview[0].tech_stack}
            Questions: ${JSON.stringify(interview[0].questions)}
            
            Transcript: ${transcript}
            
            Return ONLY valid JSON (no markdown, no code blocks) with this exact structure: {
                "overallRating": number (0-100),
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2", "improvement3"],
            "technicalScore": number (0-100),
            "communicationScore": number (0-100),
            "summary": "brief summary of performance"
        }`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const feedbackText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            
            console.log("🤖 Gemini response:", feedbackText.substring(0, 200));
            
            try {
                feedback = JSON.parse(feedbackText);
                console.log("✅ Feedback parsed successfully from Gemini");
            } catch (parseError) {
                console.error("❌ Failed to parse Gemini response, using fallback");
                throw parseError; // Trigger outer catch for fallback
            }
        } catch (aiError) {
            console.error("❌ AI feedback generation failed, using intelligent fallback:", aiError instanceof Error ? aiError.message : aiError);
            
            // Provide more detailed fallback based on transcript analysis
            const transcriptWords = transcript.split(/\s+/).length;
            const transcriptLength = transcript.length;
            
            // Analyze transcript for technical terms
            const hasTechnicalTerms = /\b(code|project|development|programming|database|api|framework|testing|debug|deploy)\b/i.test(transcript);
            const hasExamples = /\b(example|experience|project|built|created|worked)\b/i.test(transcript);
            
            const baseScore = transcriptWords > 150 ? 75 : transcriptWords > 80 ? 65 : 55;
            const technicalBonus = hasTechnicalTerms ? 10 : 0;
            const exampleBonus = hasExamples ? 5 : 0;
            
            feedback = {
                overallRating: Math.min(baseScore + technicalBonus + exampleBonus, 85),
                strengths: [
                    "Completed the interview successfully",
                    hasTechnicalTerms ? "Demonstrated technical knowledge" : "Engaged with technical questions",
                    hasExamples ? "Provided relevant examples" : "Maintained good communication throughout"
                ],
                improvements: [
                    "Provide more detailed technical explanations",
                    "Include specific examples from past experience",
                    "Elaborate more on problem-solving approaches"
                ],
                technicalScore: Math.min(baseScore + technicalBonus, 80),
                communicationScore: Math.min(baseScore + 10, 85),
                summary: `Interview completed with ${transcriptWords} words across ${transcriptLength} characters. ${hasTechnicalTerms ? 'Good technical vocabulary demonstrated.' : 'Consider using more technical terminology.'} ${hasExamples ? 'Examples provided were helpful.' : 'Try to include more specific examples in future interviews.'} Continue practicing to improve depth and clarity.`
            };
            
            console.log("📊 Generated fallback feedback with scores:", {
                overall: feedback.overallRating,
                technical: feedback.technicalScore,
                communication: feedback.communicationScore
            });
        }

        console.log("💾 Saving feedback to database...");

        const updatedInterview = await sql`
            UPDATE interviews 
            SET feedback_json = ${JSON.stringify(feedback)}, 
                rating = ${feedback.overallRating},
                transcript = ${transcript}
            WHERE id = ${interviewId} 
            RETURNING *
        `;

        console.log("✅ Feedback saved successfully for interview:", interviewId);

        res.json({
            success: true,
            data: updatedInterview[0]
        });
    } catch (error) {
        console.error("❌ Error generating feedback:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        res.status(500).json({ 
            message: "Failed to generate feedback",
            error: error instanceof Error ? error.message : "Unknown error"
        });
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