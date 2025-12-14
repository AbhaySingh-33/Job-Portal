import { Kafka, logLevel } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      logLevel: logLevel.ERROR, // Only show actual errors, not rebalancing
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });

    // connect and subscribe
    await consumer.connect();
    console.log("----Kafka consumer connected to-----", process.env.KAFKA_BROKER || "localhost:9092");
    await consumer.subscribe({ topic: "send-mail", fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
            const {to ,subject, html}=JSON.parse(
                message.value?.toString() || '{}'
            );

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: "HireHeaven <no-reply>",
                to,
                subject,
                html,
            });
            console.log("Email sent successfully to " + to);
        } catch (error) {
            console.error("Failed to sent mail :", error);
        }
      },
    });
    } catch (error) {
        console.error("Failed to start Kafka consumer:", error);
    }
};
