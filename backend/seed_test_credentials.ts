import mongoose from "mongoose";
import { Admin } from "./src/models/Admin";
import { CommunityMember } from "./src/models/CommunityMember";
import { hashPassword } from "./src/utils/password";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "business_orbit";

async function seedCredentials() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URL}...`);
    await mongoose.connect(MONGO_URL, { dbName: DB_NAME });

    // 1. Seed Admin
    const adminPw = await hashPassword("AdminTest@123");
    await Admin.updateOne(
      { email: "admin@businessorbit.network" },
      { 
        $set: { 
          name: "Test Admin", 
          email: "admin@businessorbit.network", 
          password: adminPw, 
          role: "admin" 
        } 
      },
      { upsert: true }
    );
    console.log("✅ Admin credentials created: admin@businessorbit.network / AdminTest@123");

    // 2. Seed Community Member
    const memberPw = await hashPassword("CommunityTest@123");
    await CommunityMember.updateOne(
      { email: "community@businessorbit.network" },
      { 
        $set: {
          name: "Test Member", 
          email: "community@businessorbit.network", 
          username: "testmember",
          password: memberPw,
          role: "community_member",
          status: "active",
          phone: "+91 9999999999"
        }
      },
      { upsert: true }
    );
    console.log("✅ Community credentials created: community@businessorbit.network / CommunityTest@123");

    console.log("\nReady for testing!");
  } catch (err) {
    console.error("❌ Error seeding credentials:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedCredentials();
