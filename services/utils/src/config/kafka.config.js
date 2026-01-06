"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKafkaClient = void 0;
// src/config/kafka.config.ts
var kafkajs_1 = require("kafkajs");
var path_1 = require("path");
var fs_1 = require("fs");
var dotenv_1 = require("dotenv");
var url_1 = require("url"); // <--- New Import
dotenv_1.default.config({ quiet: true });
// --- FIX FOR ESM (__dirname definition) ---
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// ------------------------------------------
var getKafkaClient = function (clientId) {
    var brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
    var username = process.env.KAFKA_USERNAME;
    var password = process.env.KAFKA_PASSWORD;
    var isCloud = username && password;
    var kafkaConfig = {
        clientId: clientId,
        brokers: brokers,
        logLevel: kafkajs_1.logLevel.INFO,
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
            var certPath = path_1.default.resolve(__dirname, '../../ca.pem');
            if (fs_1.default.existsSync(certPath)) {
                console.log("\u2705 Using custom CA certificate from: ".concat(certPath));
                kafkaConfig.ssl = {
                    rejectUnauthorized: true,
                    ca: [fs_1.default.readFileSync(certPath, 'utf-8')],
                };
            }
            else {
                console.log("\u2139\uFE0F No custom CA cert found, using default SSL");
            }
            // SASL authentication for Aiven
            kafkaConfig.sasl = {
                mechanism: 'scram-sha-256',
                username: username,
                password: password,
            };
            console.log("\u2705 Kafka configured for cloud with SASL_SSL");
        }
        catch (error) {
            console.error("❌ Error configuring SSL/SASL:", error);
            throw error;
        }
    }
    return new kafkajs_1.Kafka(kafkaConfig);
};
exports.getKafkaClient = getKafkaClient;
