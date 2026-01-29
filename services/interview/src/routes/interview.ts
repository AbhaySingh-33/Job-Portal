import express from "express";
import { isAuth } from "../middleware/auth.js";
import {
    generateQuestions,
    generateFeedback,
    getUserInterviews,
    getInterviewById,
    deleteInterview
} from "../controllers/interview.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Interview service is working!" });
});

// Test endpoint without auth
router.post("/test-generate", (req, res) => {
    console.log("Test generate endpoint hit");
    console.log("Body:", req.body);
    res.json({ 
        success: true, 
        message: "Test endpoint working",
        body: req.body 
    });
});

router.post("/generate", isAuth, generateQuestions);
router.post("/feedback", isAuth, generateFeedback);
router.get("/my-interviews", isAuth, getUserInterviews);
router.get("/:id", isAuth, getInterviewById);
router.delete("/:id", isAuth, deleteInterview);

export default router;