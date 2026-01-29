import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import axios from "axios";

const PREFERRED_ML_URL = process.env.ML_SERVICE_URL;
const ML_CANDIDATES = [
  PREFERRED_ML_URL,
  "https://job-portal-ml-recommendation.onrender.com", // Production ML service
  "http://ml-recommendation:8000", // Docker compose
  "http://localhost:8000",
  "http://127.0.0.1:8000",
].filter(Boolean) as string[];

export const recommendJobs = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    if (user.role !== "jobseeker") {
      throw new ErrorHandler(
        "Only job seekers can get job recommendations",
        403
      );
    }

    // Get user skills
    const userSkills = user.skills || [];

    if (userSkills.length === 0) {
      throw new ErrorHandler(
        "Please add skills to your profile to get recommendations",
        400
      );
    }

    try {
      // Call ML service for recommendations; try multiple candidates (env, docker name, localhost)
      let data: any | undefined;
      let lastErr: any;
      for (const base of ML_CANDIDATES) {
        try {
          const resp = await axios.post(`${base}/recommend`, {
            skills: userSkills,
            num_recommendations: 10,
            threshold: 0.3
          }, { timeout: 10000 });
          data = resp.data;
          break;
        } catch (e: any) {
          lastErr = e;
        }
      }
      if (!data) {
        const msg = lastErr?.response?.data?.error || lastErr?.message || "unknown error";
        console.error("ML Service unreachable via:", ML_CANDIDATES.join(", "), "reason:", msg);
        throw new ErrorHandler("ML service is unavailable", 503);
      }

      // Support both expected shape { job_ids, scores } and
      // fallback shape { recommendedJobs: [{ jobId, ... }] }
      let jobIds: number[] | undefined = Array.isArray((data as any)?.job_ids)
        ? (data as any).job_ids
        : undefined;
      let matchScores: number[] | undefined = Array.isArray((data as any)?.scores)
        ? (data as any).scores
        : undefined;

      if (!jobIds && Array.isArray((data as any)?.recommendedJobs)) {
        const recs = (data as any).recommendedJobs;
        jobIds = recs
          .map((j: any) => j?.jobId ?? j?.job_id)
          .filter((v: any) => Number.isInteger(v))
          .map((v: number) => v);
        // If scores aren't provided, generate a simple descending score by rank
        matchScores = recs.map((_: any, i: number) => Math.max(0.0, 1 - i * 0.05));
      }

      if (!jobIds || jobIds.length === 0) {
        return res.json({
          message: "No recommendations found",
          jobs: [],
          match_scores: matchScores ?? [],
        });
      }

      // Fetch job details from database
      const jobs = await sql`
        SELECT 
          j.job_id,
          j.title,
          j.description,
          j.salary,
          j.location,
          j.job_type,
          j.openings,
          j.role,
          j.work_location,
          j.created_at,
          j.is_active,
          c.name AS company_name,
          c.logo AS company_logo,
          c.company_id AS company_id
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.company_id
        WHERE j.job_id = ANY(${jobIds}::int[])
        AND j.is_active = true
        ORDER BY array_position(${jobIds}::int[], j.job_id)
      `;

      res.json({
        message: "Recommendations fetched successfully",
        jobs: jobs,
        match_scores: matchScores ?? (Array.isArray((data as any)?.scores) ? (data as any).scores : []),
      });
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }

      const reason =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error";

      console.error("Recommendation Error:", reason);
      throw new ErrorHandler(
        "Failed to get recommendations. Please try again later.",
        500
      );
    }
  }
);

// Sync jobs to ML service whenever jobs are created/updated
export const syncJobsToML = async () => {
  try {
    // Fetch all active jobs with required skills
    const jobs = await sql`
      SELECT 
        j.job_id,
        j.title,
        j.description,
        j.role,
        STRING_TO_ARRAY(j.description, ' ') AS required_skills
      FROM jobs j
      WHERE j.is_active = true
    `;

    // Send to ML service
    await axios.post(`${PREFERRED_ML_URL}/update-jobs`, jobs);
    console.log(`Synced ${jobs.length} jobs to ML service`);
  } catch (error: any) {
    console.error("Failed to sync jobs to ML service:", error.message);
  }
};

// Add a single job to ML service (Call this after creating a job)
export const addJobToML = async (jobId: number) => {
  try {
    const [job] = await sql`
      SELECT 
        j.job_id,
        j.title,
        j.description,
        j.role,
        STRING_TO_ARRAY(j.description, ' ') AS required_skills
      FROM jobs j
      WHERE j.job_id = ${jobId}
    `;

    if (job && PREFERRED_ML_URL) {
      await axios.post(`${PREFERRED_ML_URL}/add-job`, job);
      console.log(`Synced job ${jobId} to ML service`);
    }
  } catch (error: any) {
    console.error("Failed to sync job to ML service:", error.message);
  }
};