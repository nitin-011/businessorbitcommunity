import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Admin } from "./src/models/Admin";
import { CommunityMember } from "./src/models/CommunityMember";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/business_orbit";

async function check() {
  try {
    await mongoose.connect(MONGO_URL);
    const members = await CommunityMember.find().select('+password');
    console.log(`Found ${members.length} members`);
    const testMember = members.find(m => m.username === 'testmember');
    if (testMember) {
       console.log('Test Member Exists:', testMember.email);
       console.log('Password hash length:', testMember.password?.length);
    } else if (members.length > 0) {
       console.log('Sample member:', members[0].email, members[0].username);
    } else {
       console.log('No members found in DB');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
