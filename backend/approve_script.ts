import mongoose from "mongoose";
import dotenv from "dotenv";
import { Business } from "./src/models/Business";

dotenv.config();

async function main() {
  const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
  const email = "reetabrata.bhandari@gmail.com";
  
  console.log(`Connecting to MongoDB at ${MONGO_URL}...`);
  await mongoose.connect(MONGO_URL, { dbName: process.env.DB_NAME || "business_orbit" });
  console.log("Connected to MongoDB.");

  console.log(`Searching for founder with email: ${email}...`);
  const business = await Business.findOne({ email });

  if (!business) {
    console.error("Founder not found in the database.");
    process.exit(1);
  }

  console.log(`Found founder!`);
  console.log(`ID: ${business._id}`);
  console.log(`Name: ${business.name}`);
  console.log(`Status: ${business.status}`);

  const id = business._id.toString();
  const url = `http://localhost:8001/api/business/admin/approve/${id}`;

  console.log(`Sending POST request to ${url}...`);

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to send request:", error);
  }

  await mongoose.disconnect();
}

main();
