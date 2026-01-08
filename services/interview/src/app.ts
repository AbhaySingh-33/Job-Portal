import express from 'express';
import dotenv from 'dotenv';
import interviewRoutes from "./routes/interview.js";
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/interview", interviewRoutes);

export default app;