// src/config/kafka.config.ts
import { Kafka, logLevel, SASLOptions } from 'kafkajs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url'; // <--- New Import

dotenv.config({ quiet: true });

// --- FIX FOR ESM (__dirname definition) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------

export const getKafkaClient = (clientId: string) => {
    const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
    const username = process.env.KAFKA_USERNAME;
    const password = process.env.KAFKA_PASSWORD;

    const isCloud = username && password;

    const kafkaConfig: any = {
        clientId: clientId,
        brokers: brokers,
        logLevel: logLevel.INFO,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        retry: {
            initialRetryTime: 300,
            retries: 8,
        },
    };

    if (isCloud) {
        try {
            // SSL/TLS is required for Aiven
            kafkaConfig.ssl = true; // Simple boolean works for most cloud providers
            
            // Optional: Try to load custom CA certificate if provided
            const certPath = path.resolve(__dirname, '../../ca.pem'); 
            if (fs.existsSync(certPath)) {
                console.log(`✅ Using custom CA certificate from: ${certPath}`);
                kafkaConfig.ssl = {
                    rejectUnauthorized: true,
                    ca: [fs.readFileSync(certPath, 'utf-8')],
                };
            } else {
                console.log(`ℹ️ No custom CA cert found, using default SSL`);
            }
            
            // SASL authentication for Aiven
            kafkaConfig.sasl = {
                mechanism: 'scram-sha-256',
                username: username,
                password: password,
            } as SASLOptions;
            
            console.log(`✅ Kafka configured for cloud with SASL_SSL`);
        } catch (error) {
            console.error("❌ Error configuring SSL/SASL:", error);
            throw error;
        }
    }

    return new Kafka(kafkaConfig);
};