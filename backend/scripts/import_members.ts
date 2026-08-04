import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables relative to backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

import { CommunityMember } from '../src/models/CommunityMember';

const importMembers = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'business_orbit';

    await mongoose.connect(mongoUrl, {
      dbName: dbName,
    });
    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);

    const jsonPath = path.join(__dirname, '../../Business_Orbit_Community_Member_Spotlight_Responses.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const membersData = JSON.parse(rawData);

    let inserted = 0;
    let skipped = 0;

    for (const data of membersData) {
      const emailRaw = (data['Email'] || data['Email Address'] || '').trim().toLowerCase();
      if (!emailRaw) {
        console.warn(`⚠️ Skipping record for ${data['Name']} - No email provided.`);
        skipped++;
        continue;
      }

      // Check if member already exists
      const existingMember = await CommunityMember.findOne({ email: emailRaw });
      if (existingMember) {
        console.warn(`⚠️ Skipping ${emailRaw} - Member already exists.`);
        skipped++;
        continue;
      }

      const phoneVal = data['Phone Number'];
      const phoneStr = phoneVal !== undefined && phoneVal !== null ? String(phoneVal).trim() : undefined;

      const newMember = new CommunityMember({
        name: data['Name'] ? String(data['Name']).trim() : 'Unknown',
        email: emailRaw,
        role: data['Company & Designation'] ? String(data['Company & Designation']).trim() : undefined,
        bio: data['Tell us about yourself'] ? String(data['Tell us about yourself']).trim() : undefined,
        phone: phoneStr,
        linkedin: data['LinkedIn Profile URL'] ? String(data['LinkedIn Profile URL']).trim() : undefined,
        instagram: data['Instagram Profile URL\n'] ? String(data['Instagram Profile URL\n']).trim() : undefined,
        photoUrl: data['Professional Photo'] ? String(data['Professional Photo']).trim() : undefined,
        status: 'active'
      });

      await newMember.save();
      inserted++;
      console.log(`✅ Inserted: ${newMember.name} (${newMember.email})`);
    }

    console.log(`\n🎉 Import complete! Inserted: ${inserted}, Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing members:', error);
    process.exit(1);
  }
};

importMembers();
