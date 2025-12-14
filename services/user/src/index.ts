import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user",userRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Users Service running at port ${process.env.PORT}`)
})
