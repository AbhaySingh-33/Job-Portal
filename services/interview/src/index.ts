import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";

dotenv.config();

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS interviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                job_role VARCHAR(255) NOT NULL,
                tech_stack TEXT[],
                experience_level VARCHAR(50),
                questions JSONB,
                transcript TEXT,
                feedback_json JSONB,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Interview service database tables checked and created successfully.");
    } catch (error) {
        console.log("Error while creating tables", error);
        process.exit(1);
    }
}

await initDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Interview service is running on port ${process.env.PORT}`);
    });
});