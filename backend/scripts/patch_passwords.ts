import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";
import { CommunityMember } from "../src/models/CommunityMember";

dotenv.config({ path: path.join(__dirname, "../.env") });

const patchPasswords = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
    const dbName = process.env.DB_NAME || "business_orbit";

    await mongoose.connect(mongoUrl, { dbName: dbName });
    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);

    const DEFAULT_PASSWORD = "BusinessOrbit@2026";
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const membersWithoutPassword = await CommunityMember.find({ password: { $exists: false } });
    console.log(`Found ${membersWithoutPassword.length} members without password.`);

    let patched = 0;
    for (const member of membersWithoutPassword) {
      member.password = hashedPassword;
      await member.save();
      patched++;
    }

    console.log(`✅ Patched ${patched} members with default password.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error patching passwords:", error);
    process.exit(1);
  }
};

patchPasswords();
