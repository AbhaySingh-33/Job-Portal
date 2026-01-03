import { getKafkaClient } from "./config/kafka.config.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const startSendMailConsumer = async () => {
  try {
    const kafka = getKafkaClient("mail-service");
    const consumer = kafka.consumer({ 
      groupId: "mail-service-group",
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      retry: {
        retries: 8
      }
    });

    await consumer.connect();
    console.log("✅ Kafka consumer connected");
    
    await consumer.subscribe({ topic: "send-mail", fromBeginning: false });
    
    // Transporter ko loop ke bahar init karo (Performance Optimization)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
            const payload = message.value?.toString();
            if (!payload) return;

            const { to, subject, html } = JSON.parse(payload);

            await transporter.sendMail({
                from: '"HireHeaven" <no-reply@hireheaven.com>', // Proper format
                to,
                subject,
                html,
            });
            console.log(`📧 Email sent successfully to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send mail:", error);
        }
      },
    });
    } catch (error) {
        console.error("❌ Failed to start Kafka consumer:", error);
    }
};