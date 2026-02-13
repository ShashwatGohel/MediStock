import connectDB from "./config/db.js";
import User from "./models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const migrateUsers = async () => {
    try {
        await connectDB();

        // Mark all users that don't have isVerified explicitly set to false or true as verified
        // Actually, let's just mark everyone currently in the DB as verified.
        const result = await User.updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );

        // Also handle cases where default: false was already applied but they are "existing"
        // For simplicity, we can assume anyone in the DB right now is existing.
        // But to be safe, we'll just target those without the field first.

        console.log(`Migration Complete: ${result.modifiedCount} users marked as verified.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrateUsers();
