import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "../src/models/Admin";
import { hashPassword, verifyPassword } from "../src/utils/password";
import { config } from "../src/config/env";

dotenv.config();

const seedAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    const adminEmail = config.adminEmail;
    const adminPassword = config.adminPassword;

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword);
      await Admin.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Admin user seeded successfully");
    } else {
      const isPasswordValid = await verifyPassword(
        adminPassword,
        existingAdmin.password,
      );
      if (!isPasswordValid) {
        const hashedPassword = await hashPassword(adminPassword);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log("✅ Admin password updated");
      } else {
        console.log("✅ Admin user already exists with correct password");
      }
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

seedAdmin();
