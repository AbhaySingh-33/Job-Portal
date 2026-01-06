import express from 'express';
import { isAuth } from '../middleware/auth.js';
import { getUserProfile, myProfile, updateProfilePic, updateUserProfile,updateResume, addSkillToUser, deleteSkilFromUser, applyForJob, getAllApplications, getApplicationStatusHistory } from '../controllers/user.js';
import uploadFile from '../middleware/multer.js';

const router=express.Router();

router.get("/me",isAuth,myProfile);
router.get("/:userId",getUserProfile);
router.put("/update/profile", isAuth, updateUserProfile);
router.put("/update/profile-pic", isAuth, uploadFile, updateProfilePic);
router.put("/update/resume", isAuth, uploadFile, updateResume);
router.post("/add/skills", isAuth,addSkillToUser);
router.put("/delete/skills", isAuth, deleteSkilFromUser);
router.post("/apply/job", isAuth, applyForJob);
router.get("/application/all", isAuth,getAllApplications);
router.get("/application/history/:applicationId", isAuth, getApplicationStatusHistory);

export default router;