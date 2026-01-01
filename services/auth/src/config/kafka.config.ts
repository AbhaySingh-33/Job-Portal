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
        logLevel: logLevel.ERROR, 
    };

    if (isCloud) {
        try {
            // Logic: dist/config/ -> dist/ -> root/ (so ../../ is correct)
            const certPath = path.resolve(__dirname, '../../ca.pem'); 
            
            console.log(`🔍 Looking for certificate at: ${certPath}`); // Debug log

            if (fs.existsSync(certPath)) {
                kafkaConfig.ssl = {
                    ca: [fs.readFileSync(certPath, 'utf-8')],
                };
                kafkaConfig.sasl = {
                    mechanism: 'scram-sha-256',
                    username: username,
                    password: password,
                } as SASLOptions;
            } else {
                console.warn(`⚠️ Warning: ca.pem not found at ${certPath}. Connection might fail.`);
            }
        } catch (error) {
            console.error("❌ Error configuring SSL/SASL:", error);
        }
    }

    return new Kafka(kafkaConfig);
};