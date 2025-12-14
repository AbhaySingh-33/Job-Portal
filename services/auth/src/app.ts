import express from "express";
import authRouter from "./routes/auth.js";
import { connectProducer } from "./producer.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

connectProducer();

app.use("/api/auth", authRouter);

export default app;