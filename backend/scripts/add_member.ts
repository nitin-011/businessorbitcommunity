import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables relative to backend root
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import the CommunityMember schema
import { CommunityMember } from "../src/models/CommunityMember";

const addMember = async () => {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error("Usage: npx ts-node add_member.ts <name> <email> <password>");
    process.exit(1);
  }

  const [name, email, password] = args;

  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
    const dbName = process.env.DB_NAME || "business_orbit";

    await mongoose.connect(mongoUrl, {
      dbName: dbName,
    });
    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);

    // Check if member already exists
    const existingMember = await CommunityMember.findOne({
      email: email.toLowerCase(),
    });
    if (existingMember) {
      console.error(`❌ Member with email ${email} already exists.`);
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create member
    const newMember = new CommunityMember({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      status: "active",
    });

    await newMember.save();
    console.log(`✅ Successfully added community member: ${name} (${email})`);

    // Disconnect
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding member:", error);
    process.exit(1);
  }
};

addMember();
