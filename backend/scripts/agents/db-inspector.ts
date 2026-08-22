import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the backend folder
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Admin } from "../../src/models/Admin";
import { Business } from "../../src/models/Business";
import { CommunityMember } from "../../src/models/CommunityMember";
import { OrbitCardOrder } from "../../src/models/OrbitCardOrder";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/business_orbit";

async function inspectDb() {
  try {
    console.log(`📡 Connecting to MongoDB at ${MONGO_URL.replace(/:[^:@]*@/, ":***@")}...`);
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected successfully.\n");

    console.log("📊 --- COLLECTION COUNTS ---");
    const [adminCount, businessCount, memberCount, orderCount] = await Promise.all([
      Admin.countDocuments(),
      Business.countDocuments(),
      CommunityMember.countDocuments(),
      OrbitCardOrder.countDocuments()
    ]);
    
    console.log(`Admins:           ${adminCount}`);
    console.log(`Businesses:       ${businessCount}`);
    console.log(`CommunityMembers: ${memberCount}`);
    console.log(`OrbitCardOrders:  ${orderCount}`);
    console.log("-----------------------------\n");

    console.log("🔍 --- LATEST PENDING BUSINESSES (Limit 3) ---");
    const pendingBusinesses = await Business.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    if (pendingBusinesses.length === 0) {
      console.log("No pending businesses.");
    } else {
      pendingBusinesses.forEach(b => {
        console.log(`- ${b.name} (${b.company}) | Email: ${b.email} | Created: ${b.createdAt}`);
      });
    }
    console.log("----------------------------------------------\n");

    console.log("🛒 --- LATEST ORBIT CARD ORDERS (Limit 3) ---");
    const latestOrders = await OrbitCardOrder.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    if (latestOrders.length === 0) {
      console.log("No Orbit Card orders.");
    } else {
      latestOrders.forEach(o => {
        console.log(`- TxID: ${o.transactionId} | Status: ${o.status} | Amount: ₹${o.amount / 100} | Buyer: ${o.fullName}`);
      });
    }
    console.log("---------------------------------------------");

  } catch (error) {
    console.error("❌ Error inspecting database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

inspectDb();
