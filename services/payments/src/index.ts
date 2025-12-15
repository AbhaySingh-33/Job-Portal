import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const app = express();

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",  
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

app.use(express.json());

app.use(cors())
app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT || 5004, () => {
  console.log(`Payments service is running on port ${process.env.PORT || 5004}`);
});