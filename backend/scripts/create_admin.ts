import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "../src/models/Admin";
import { hashPassword } from "../src/utils/password";
import { config } from "../src/config/env";

dotenv.config();

const createAdmin = async (): Promise<void> => {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Usage: npx ts-node scripts/create_admin.ts <name> <email> <password> [role]"
    );
    console.error(
      "Example: npx ts-node scripts/create_admin.ts \"John Doe\" john@example.com mysecurepassword"
    );
    process.exit(1);
  }

  const [name, email, password, role = "admin"] = args;
  const normalizedEmail = email.toLowerCase();

  try {
    await mongoose.connect(config.mongoUrl, { dbName: config.dbName });
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      console.error(`❌ Admin user with email '${normalizedEmail}' already exists.`);
      process.exit(1);
    }

    const hashedPassword = await hashPassword(password);

    await Admin.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    console.log(
      `✅ Admin user '${name}' created successfully with email '${normalizedEmail}' and role '${role}'.`
    );
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createAdmin();
