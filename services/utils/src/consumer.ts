import { getKafkaClient } from "./config/kafka.config.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const startSendMailConsumer = async () => {
  try {
    const kafka = getKafkaClient("mail-service");
    const consumer = kafka.consumer({ 
      groupId: "mail-service-group",
      sessionTimeout: 60000, // Increased to 60 seconds
      heartbeatInterval: 3000, // Send heartbeat every 3 seconds
      rebalanceTimeout: 60000, // Increased rebalance timeout
      maxWaitTimeInMs: 5000, // Max wait time for new data
      retry: {
        retries: 10,
        initialRetryTime: 300,
        multiplier: 2
      }
    });

    await consumer.connect();
    console.log("✅ Kafka consumer connected");
    
    await consumer.subscribe({ 
      topic: "send-mail", 
      fromBeginning: false 
    });
    
    // SMTP Configuration with better timeout and error handling
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
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
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100
    });

    // Verify SMTP connection
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified');
    } catch (error: any) {
        console.error('❌ SMTP verification failed:', error.message);
        console.log('⚠️ Will attempt to send emails anyway...');
    }

    // Handle disconnections gracefully
    consumer.on('consumer.disconnect', () => {
        console.log('⚠️ Consumer disconnected');
    });

    consumer.on('consumer.connect', () => {
        console.log('✅ Consumer reconnected');
    });

    consumer.on('consumer.crash', (event) => {
        console.error('❌ Consumer crashed:', event.payload.error);
    });

    consumer.on('consumer.group_join', (event) => {
        console.log('👥 Consumer joined group:', event.payload);
    });

    consumer.on('consumer.rebalancing', () => {
        console.log('🔄 Consumer rebalancing...');
    });

    await consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      partitionsConsumedConcurrently: 1, // Process one partition at a time
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        try {
            const payload = message.value?.toString();
            if (!payload) {
                console.log('⚠️ Empty message received');
                return;
            }

            const { to, subject, html } = JSON.parse(payload);
            console.log(`📨 Processing email message for ${to} with subject: "${subject}"`);

            // Send heartbeat before potentially slow email operation
            await heartbeat();

            const info = await transporter.sendMail({
                from: process.env.SMTP_USER || '"HireHeaven" <no-reply@hireheaven.com>',
                to,
                subject,
                html,
            });
            
            // Send heartbeat after email sent
            await heartbeat();
            
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
            // Send heartbeat even on error to keep consumer alive
            try {
                await heartbeat();
            } catch (e) {
                console.error('Failed to send heartbeat:', e);
            }
        }
      },
    });
    
    console.log('🎧 Consumer is now listening for messages...');
    
  } catch (error: any) {
    console.error("❌ Failed to start Kafka consumer:", error.message);
    // Retry connection after delay
    setTimeout(() => {
        console.log('🔄 Retrying Kafka consumer connection...');
        startSendMailConsumer();
    }, 5000);
  }
};