import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js"
import { Redis } from "@upstash/redis";
import { connectProducer } from "./producer.js";

dotenv.config();


export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

redisClient.ping().then(() => {
  console.log("✅ Connected to Redis");
}).catch((error) => {
  console.error("❌ Failed to connect to Redis:", error);
});

export async function initDb() {
  try {
    // Create enum type for user_role if it does not exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter');
        END IF;
      END$$;
    `;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        role user_role NOT NULL,
        bio TEXT,
        resume VARCHAR(255),
        resume_public_id VARCHAR(255),
        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscription TIMESTAMPTZ
      );
    `;

    // Create skills table
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
    `;

    // Create user_skills junction table
    await sql`
      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, skill_id)
      );
    `;

    console.log("✅ Database tables checked and created");
  } catch (error) {
    console.log("❌ Error initializing database", error);
    process.exit(1);
  }
}

initDb().then(async () => { // Make this async
    await connectProducer(); // <--- Connect Kafka before starting server
    
    app.listen(process.env.PORT || 3000, () => {
        console.log("Auth service is running");
    });
})
