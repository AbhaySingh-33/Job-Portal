import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import { applicationStatusUpdateTemplate } from "../templates.js";
import { publishToTopic } from "../producer.js";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        "Forbidden: only recrutier can create company",
        403
      );
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler("All feilds are required", 400);
    }

    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name = ${name}`;

    if (existingCompanies.length > 0) {
      throw new ErrorHandler(
        `A company with same name ${name} already exisit`,
        409
      );
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler("Company Logo file required", 400);
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("Failed to create file buffer", 500);
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content }
    );

    const [newCompany] = await sql`INSERT INTO companies
        (name,description,website,logo,
        logo_public_id,recruiter_id) VALUES
        (${name},${description},${website},${data.url},
        ${data.public_id},${req.user?.user_id})
        RETURNING *`;

    res.json({
      message: "Company created sucessfully",
      company: newCompany,
    });
  }
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        "Forbidden: only recrutier can delete company",
        403
      );
    }
    const { companyId } = req.params;

    const [company] =
      await sql`SELECT * FROM companies WHERE company_id=${companyId} AND recruiter_id=${user.user_id}`;

    if (!company) {
      throw new ErrorHandler(
        "Company not found or not authorized to delete",
        404
      );
    }

    await sql`DELETE FROM companies WHERE company_id=${companyId}`;

    res.json({
      message: "Company deleted successfully",
    });
  }
);

export const createJob = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }
    if (user.role !== "recruiter") {
      throw new ErrorHandler("Forbidden: only recrutier can create job", 403);
    }
    const {
      title,
      description,
      salary,
      location,
      job_type,
      openings,
      role,
      work_location,
      company_id,
    } = req.body;

    if (!title || !description || !openings || !role || !salary || !location) {
      throw new ErrorHandler("Required fields are missing", 400);
    }
    const [company] =
      await sql`SELECT * FROM companies WHERE company_id=${company_id} AND recruiter_id=${user.user_id}`;

    if (!company) {
      throw new ErrorHandler(
        "Company not found or not authorized to add job",
        404
      );
    }
    const [newJob] = await sql`INSERT INTO jobs
        (title,description,salary,location,
            job_type,openings,role,work_location,company_id,posted_by_recruiter_id) VALUES
        (${title},${description},${salary},${location},
            ${job_type},${openings},${role},${work_location},${company_id},${user.user_id})
        RETURNING *`;

    res.json({
      message: "Job created sucessfully",
      job: newJob,
    });
  }
);

export const updateJob = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication Required", 401);
    }
    if (user.role !== "recruiter") {
      throw new ErrorHandler("Forbidden: only recrutier can create job", 403);
    }
    const {
      title,
      description,
      salary,
      location,
      job_type,
      openings,
      role,
      work_location,
      company_id,
      is_active,
    } = req.body;

    // ye aesi koi job find karne ki koshish kar raha hai jo recruiter ne post ki ho
    const [existingJob] =
      await sql`SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${req.params.jobId};`;

    if (!existingJob) {
      throw new ErrorHandler("Job not found", 404);
    }

    if (existingJob.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler("Forbidden: You are not allowed", 403);
    }

    const [updatedJob] = await sql`UPDATE jobs SET title = ${title},
            description = ${description},
            salary = ${salary},
            location = ${location},
            job_type = ${job_type},
            openings = ${openings},
            role = ${role},
            work_location = ${work_location},
            company_id = ${company_id},
            is_active = ${is_active}
            WHERE job_id = ${req.params.jobId}
            RETURNING *;
            `;

    res.json({
      message: "Job updated sucessfully",
      job: updatedJob,
    });
  }
);

export const getALLCompany = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const companies =
      await sql`SELECT * from companies WHERE recruiter_id = ${req.user?.user_id}`;

    res.json(companies);
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler("company id is required", 400);
    }

    const [companyData] = await sql`SELECT c.*, COALESCE (
        (SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id),
        '[]'::json
        ) AS jobs
        FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;`;

    if (!companyData) {
      throw new ErrorHandler("company not found", 404);
    }

    res.json(companyData);
  }
);

export const getAllActiveJobs = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const { title, location, page = '1', limit = '9' } = req.query as {
      title?: string;
      location?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `SELECT 
    j.job_id, j.title, j.description, j.salary, j.location, j.is_active, j.openings,
    j.job_type, j.role, j.work_location, j.created_at, 
    c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id 
    FROM jobs j 
    JOIN companies c ON j.company_id = c.company_id 
    WHERE j.is_active = true`;

    let countQuery = `SELECT COUNT(*) as total FROM jobs j WHERE j.is_active = true`;

    const values = [];
    let paramIndex = 1;

    if (title) {
      baseQuery += ` AND j.title ILIKE $${paramIndex}`;
      countQuery += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (location) {
      baseQuery += ` AND j.location ILIKE $${paramIndex}`;
      countQuery += ` AND j.location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
      paramIndex++;
    }

    baseQuery += ` ORDER BY j.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limitNum, offset);

    const [jobs, totalResult] = await Promise.all([
      sql.query(baseQuery, values),
      sql.query(countQuery, values.slice(0, -2))
    ]);

    const total = parseInt(totalResult[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  }
);

export const getSingleJob = TryCatch(
    async(req:AuthenticatedRequest,res,next)=>{

         const [job] = await sql `
          SELECT 
            j.*,
            c.name AS company_name,
            c.logo AS company_logo,
            c.company_id AS company_id
          FROM jobs j
          LEFT JOIN companies c ON j.company_id = c.company_id
          WHERE j.job_id = ${req.params.jobId};
        `;

        res.json(job);

    }
)

export const getAllApplicationsForJob = TryCatch(
  async(req:AuthenticatedRequest,res)=>{

    const user = req.user;
    if(!user){
      throw new ErrorHandler("Authentication Required",401);
    }
    if(user.role !== "recruiter"){
      throw new ErrorHandler("Forbidden: only recrutier can view applications",403);
    }
    const {jobId} = req.params;

    const [jobs] = await sql `SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId};`;

    if(!jobs){
      throw new ErrorHandler("Job not found",404);
    }
    if(jobs.posted_by_recruiter_id !== user.user_id){
      throw new ErrorHandler("Forbidden: You are not allowed",403);
    }
    const applications = await sql `SELECT * FROM applications WHERE job_id = ${jobId}
    ORDER BY subscribed DESC, applied_at ASC;`;

    res.json(applications);

  }
)

export const updateApplicationStatus = TryCatch(
  async(req:AuthenticatedRequest,res,next)=>{

    const user = req.user;
    if(!user){
      throw new ErrorHandler("Authentication Required",401);
    }
    if(user.role !== "recruiter"){
      throw new ErrorHandler("Forbidden: only recrutier can update application status",403);
    }

    const {id} = req.params;
    const { status, notes } = req.body;

    const [application] = await sql `SELECT * FROM applications WHERE application_id = ${id};`;

    if(!application){
      throw new ErrorHandler("Application not found",404);
    }

    const [job] = await sql `SELECT posted_by_recruiter_id, title FROM jobs WHERE job_id = ${application.job_id};`;

    if(!job){
      throw new ErrorHandler("Job not found",404);
    }

    if(job.posted_by_recruiter_id !== user.user_id){
      throw new ErrorHandler("Forbidden: You are not allowed",403);
    }

    // Update application status
    const [updateApplication] = await sql `
    UPDATE applications 
    SET status = ${status}, status_updated_at = NOW()
    WHERE application_id = ${id} RETURNING *;`;

    // Add to status history
    await sql `
    INSERT INTO application_status_history (application_id, status, notes)
    VALUES (${id}, ${status}, ${notes || null})`;

    const message = {
      to: application.applicant_email,
      subject: `Your application status has been updated - HireHaven`,
      html: applicationStatusUpdateTemplate(job.title)
    }

    //publish message to kafka topic
    try {
      await publishToTopic('send-mail', message);
    } catch (err: any) {
      console.error("⚠️ Error publishing application status email to Kafka:", err.message);
    }

    res.json({
      message: "Application status updated successfully",
      job,
      application: updateApplication
    });

  }
)