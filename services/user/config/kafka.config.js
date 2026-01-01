import { Kafka, logLevel } from 'kafkajs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
export const getKafkaClient = (clientId) => {
    const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
    const username = process.env.KAFKA_USERNAME;
    const password = process.env.KAFKA_PASSWORD;
    // Logic: Agar username/pass hai toh Cloud, nahi toh Local
    const isCloud = username && password;
    const kafkaConfig = {
        clientId: clientId,
        brokers: brokers,
        logLevel: logLevel.ERROR,
    };
    if (isCloud) {
        try {
            // ca.pem file ko src root mein dhoondhega
            const certPath = path.resolve(__dirname, '../../ca.pem');
            if (fs.existsSync(certPath)) {
                kafkaConfig.ssl = {
                    ca: [fs.readFileSync(certPath, 'utf-8')],
                };
                kafkaConfig.sasl = {
                    mechanism: 'scram-sha-256',
                    username: username,
                    password: password,
                };
            }
            else {
                console.warn(`⚠️ Warning: ca.pem not found at ${certPath}`);
            }
        }
        catch (error) {
            console.error("❌ Error configuring SSL/SASL:", error);
        }
    }
    return new Kafka(kafkaConfig);
};
