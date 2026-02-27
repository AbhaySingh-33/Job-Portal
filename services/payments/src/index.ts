import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
import client from "prom-client";

dotenv.config();

const app = express();
const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",  
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

app.use(express.json());
app.use(cors())

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT || 5004, () => {
  console.log(`Payments service is running on port ${process.env.PORT || 5004}`);
});