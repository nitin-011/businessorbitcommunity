import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";

// Load environment variables from the backend folder
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Admin } from "../../src/models/Admin";
import { Business } from "../../src/models/Business";
import { CommunityMember } from "../../src/models/CommunityMember";
import { OrbitCardOrder } from "../../src/models/OrbitCardOrder";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/business_orbit";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedData() {
  try {
    console.log(`📡 Connecting to MongoDB at ${MONGO_URL.replace(/:[^:@]*@/, ":***@")}...`);
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected successfully.\n");

    console.log("🌱 Seeding Admin...");
    const adminPw = await hashPassword("AdminTest@123");
    await Admin.updateOne(
      { email: "e2e-admin@businessorbit.network" },
      { 
        $set: { 
          name: "E2E Admin", 
          email: "e2e-admin@businessorbit.network", 
          password: adminPw, 
          role: "admin" 
        } 
      },
      { upsert: true }
    );
    console.log("   -> Created Admin: e2e-admin@businessorbit.network / AdminTest@123");

    console.log("🌱 Seeding Community Member...");
    const memberPw = await hashPassword("CommunityTest@123");
    await CommunityMember.updateOne(
      { email: "e2e-community@businessorbit.network" },
      { 
        $set: {
          name: "E2E Member", 
          email: "e2e-community@businessorbit.network", 
          username: "e2emember",
          password: memberPw,
          role: "CEO at E2E Corp",
          status: "active",
          phone: "+91 9999999999"
        }
      },
      { upsert: true }
    );
    console.log("   -> Created Member: e2e-community@businessorbit.network (e2emember) / CommunityTest@123");

    console.log("🌱 Seeding Pending Business...");
    await Business.updateOne(
      { email: "e2e-pending@businessorbit.network" },
      {
        $set: {
          name: "Pending Applicant",
          company: "E2E Startup",
          role: "Founder",
          stage: "Seed",
          email: "e2e-pending@businessorbit.network",
          phone: "+91 8888888888",
          status: "pending",
          requiresPasswordChange: true
        }
      },
      { upsert: true }
    );
    console.log("   -> Created Pending Business: e2e-pending@businessorbit.network");

    console.log("🌱 Seeding Mock Orbit Card Order...");
    const txId = "E2E_ORDER_TEST_" + Date.now();
    await OrbitCardOrder.create({
      shippingAddress: "123 E2E Street, Testing City, IN",
      fullName: "E2E Tester",
      email: "e2e-community@businessorbit.network",
      phone: "+91 9999999999",
      companyAndDesignation: "CEO at E2E Corp",
      amount: 1179900,
      transactionId: txId,
      status: "SUCCESS"
    });
    console.log(`   -> Created Orbit Card Order (SUCCESS): ${txId}`);

    console.log("\n🎉 E2E Data Seeding Complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedData();
