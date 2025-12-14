import express from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, deleteCompany , createJob, updateJob ,getALLCompany,getCompanyDetails, getAllActiveJobs, getSingleJob, getAllApplicationsForJob, updateApplicationStatus} from "../controllers/job.js";

const router = express.Router();

router.post("/company/create",isAuth,uploadFile,createCompany);
router.delete("/company/delete/:companyId",isAuth,deleteCompany);
router.post("/create",isAuth,createJob);
router.put("/update/:jobId",isAuth,updateJob);
router.get("/company/all",isAuth,getALLCompany);
router.get("/company/:id",getCompanyDetails);
router.get("/all",getAllActiveJobs);
router.get("/:jobId",getSingleJob);
router.get("/applications/:jobId",isAuth,getAllApplicationsForJob);
router.put("/application/status/:id",isAuth,updateApplicationStatus);

export default router;