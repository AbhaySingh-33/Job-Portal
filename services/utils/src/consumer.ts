import { getKafkaClient } from "./config/kafka.config.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const startSendMailConsumer = async () => {
  try {
    // Validate SMTP environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ Missing SMTP environment variables!');
      console.log('Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT');
      console.log('Email functionality will NOT work until these are set.');
    }

    const kafka = getKafkaClient("mail-service");
    const consumer = kafka.consumer({ 
      groupId: "mail-service-group",
      sessionTimeout: 60000, // Increased to 60 seconds
      heartbeatInterval: 5000, // Increased to 5 seconds
      rebalanceTimeout: 60000,
      retry: {
        retries: 8
      }
    });

    await consumer.connect();
    console.log("✅ Kafka consumer connected");
    
    await consumer.subscribe({ topic: "send-mail", fromBeginning: false });
    
    // SMTP Configuration with better timeout and error handling
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const isResend = process.env.SMTP_HOST?.includes('resend');
    const isSendGrid = process.env.SMTP_HOST?.includes('sendgrid');
    
    console.log(`📧 SMTP Config: ${process.env.SMTP_HOST}:${smtpPort} (user: ${process.env.SMTP_USER})`);
    
    // Different config for different providers
    const transportConfig: any = {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        // Resend uses SSL (port 465), others use STARTTLS (port 587)
        secure: isResend ? true : smtpPort === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
    };
    
    // Add TLS config for non-Resend providers
    if (!isResend) {
        transportConfig.tls = {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        };
    }
    
    const transporter = nodemailer.createTransport(transportConfig);
    
    let smtpReady = false;

    // Verify SMTP connection (non-blocking)
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ SMTP verification failed:', error.message);
            console.log('⚠️ Check your SMTP API key/password!');
            if (isResend) {
                console.log('💡 Resend: Make sure API key is correct (starts with re_)');
            }
            smtpReady = false;
        } else {
            console.log('✅ SMTP connection verified - Ready to send emails');
            smtpReady = true;
        }
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
            const payload = message.value?.toString();
            if (!payload) {
                console.log('⚠️ Empty message received');
                return;
            }

            console.log('📨 Processing email message...');
            const { to, subject, html } = JSON.parse(payload);

            // Add timeout for email sending
            const sendMailWithTimeout = Promise.race([
                transporter.sendMail({
                    from: process.env.SMTP_USER || '"HireHeaven" <no-reply@hireheaven.com>',
                    to,
                    subject,
                    html,
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email send timeout after 45s')), 45000)
                )
            ]);

            const info = await sendMailWithTimeout;
            console.log(`✅ Email sent successfully to ${to}. MessageId: ${(info as any).messageId}`);
            smtpReady = true;
        } catch (error: any) {
            console.error("❌ Failed to send mail:", error.message);
            if (error.code || error.command || error.responseCode) {
                console.error("Details:", {
                    code: error.code,
                    command: error.command,
                    responseCode: error.responseCode
                });
            }
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
                console.log('💡 Hint: For Gmail use port 587 with App Password (not regular password)');
            }
            // Don't throw - just log and continue with next message
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