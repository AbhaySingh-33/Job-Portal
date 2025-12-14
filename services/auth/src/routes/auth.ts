import express from "express";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;