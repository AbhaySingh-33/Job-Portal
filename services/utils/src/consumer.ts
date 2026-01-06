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
    
    // SMTP Configuration with better timeout and error handling
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    // Verify SMTP connection
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified');
    } catch (error: any) {
        console.error('❌ SMTP verification failed:', error.message);
        console.log('⚠️ Will attempt to send emails anyway...');
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
            const payload = message.value?.toString();
            if (!payload) {
                console.log('⚠️ Empty message received');
                return;
            }

            const { to, subject, html } = JSON.parse(payload);
            console.log(`📨 Processing email message for ${to} with subject: "${subject}"`);

            const info = await transporter.sendMail({
                from: process.env.SMTP_USER || '"HireHeaven" <no-reply@hireheaven.com>',
                to,
                subject,
                html,
            });
            console.log(`✅ Email sent successfully to ${to}`);
            console.log(`   MessageId: ${info.messageId}`);
            console.log(`   Response: ${info.response}`);
        } catch (error: any) {
            console.error("❌ Failed to send mail:", error.message);
            console.error("Details:", {
                code: error.code,
                command: error.command,
                responseCode: error.responseCode,
                response: error.response
            });
        }
      },
    });
    } catch (error: any) {
        console.error("❌ Failed to start Kafka consumer:", error.message);
        // Retry connection after delay
        setTimeout(() => {
            console.log('🔄 Retrying Kafka consumer connection...');
            startSendMailConsumer();
        }, 5000);
    }
};