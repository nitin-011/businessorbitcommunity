#!/usr/bin/env node
/**
 * seed_members.js
 *
 * Seeds community members from Business_Orbit_Community_Member_Spotlight_Responses.json
 * into MongoDB, then patches the photoUrl for each member that has a
 * matching Cloudinary upload.
 *
 * Usage:
 *   node scripts/seed_members.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const MONGO_URL = process.env.MONGO_URL;

// ─── Cloudinary URLs from upload (all public, businessorbit/profiles folder) ──
const CLOUDINARY_URLS = {
  "truly.muskan007@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356807/businessorbit/profiles/profile_muskan.jpg",
  "sakeenayousuf04@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356797/businessorbit/profiles/profile_sakeena_yousuf.jpg",
  "contact.mountainbirdbagpackers@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356809/businessorbit/profiles/profile_mountain_bird_bagpackers.jpg",
  "bobwalia@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356802/businessorbit/profiles/profile_sandeep_ahluwalia.jpg",
  "amandeep269054@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356795/businessorbit/profiles/profile_aman_deep.jpg",
  "ujjwaldhawan1003@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356815/businessorbit/profiles/profile_ujjwal_dhawan.jpg",
  "2713.navi@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356812/businessorbit/profiles/profile_navpreet_singh.jpg",
  "r60921@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356817/businessorbit/profiles/profile_radhika.jpg",
  "bhallaasheesh@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356804/businessorbit/profiles/profile_asheesh_bhalla.jpg",
  "infocometaiinstitute@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356798/businessorbit/profiles/profile_drshruti_avasthi.jpg",
  "akanksha.arora@aol.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356800/businessorbit/profiles/profile_akanksha_2352.jpg",
  "gurvindersingh1666@gmail.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356818/businessorbit/profiles/profile_gurvinder_singh.jpg",
  "vijay_mvsb@yahoo.com":
    "https://res.cloudinary.com/dbomrpvlf/image/upload/v1786356810/businessorbit/profiles/profile_vijay_kumar.jpg",
  // puneetkmadan@yahoo.com intentionally has no photo — initials fallback
};

// ─── Mongoose Schema ──────────────────────────────────────────────────────────
const CommunityMemberSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    username:  { type: String, unique: true, sparse: true },
    role:      { type: String },
    bio:       { type: String },
    linkedin:  { type: String },
    instagram: { type: String },
    phone:     { type: String },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String },
    photoUrl:  { type: String },
    status:    { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const CommunityMember =
  mongoose.models.CommunityMember ||
  mongoose.model("CommunityMember", CommunityMemberSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise an Instagram field to a URL or empty string */
function normaliseInstagram(raw) {
  if (!raw || !raw.trim()) return "";
  const val = raw.trim();
  if (val.startsWith("http")) return val.split(/\s+/)[0]; // take first URL
  // bare handle → URL
  const handle = val.replace(/^@/, "").split(/[^a-zA-Z0-9_.]/)[0];
  return handle ? `https://www.instagram.com/${handle}/` : "";
}

/** Normalise a LinkedIn field to a URL or empty string */
function normaliseLinkedin(raw) {
  if (!raw || !raw.trim() || raw.trim().toLowerCase() === "nil") return "";
  const val = raw.trim();
  if (val.startsWith("http")) return val.split(/\s+/)[0]; // take first URL
  if (val.startsWith("linkedin.com")) return "https://" + val.split(/\s+/)[0];
  return "";
}

/** Normalise phone to a consistent string */
function normalisePhone(raw) {
  if (!raw) return "";
  return String(raw).trim().split(/[,\/]/)[0].trim(); // take first number if multiple
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔗 Connecting to MongoDB…");
  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB connected\n");

  const jsonPath = path.resolve(
    __dirname,
    "../../Business_Orbit_Community_Member_Spotlight_Responses.json"
  );
  const rawMembers = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Default password — members will change on first login
  const DEFAULT_PASSWORD = "BusinessOrbit@2026";
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log(`📋 Found ${rawMembers.length} member(s) in JSON file\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of rawMembers) {
    const email = (raw["Email"] || raw["Email Address"] || "").trim().toLowerCase();
    if (!email) {
      console.log(`⚠️  Skipping entry with no email: ${raw["Name"]}`);
      skipped++;
      continue;
    }

    const name      = raw["Name"].trim();
    const role      = (raw["Company & Designation"] || "").trim();
    const bio       = (raw["Tell us about yourself"] || "").trim();
    const linkedin  = normaliseLinkedin(raw["LinkedIn Profile URL"]);
    const instagram = normaliseInstagram(raw["Instagram Profile URL\n"] || raw["Instagram Profile URL"]);
    const phone     = normalisePhone(raw["Phone Number"]);
    const photoUrl  = CLOUDINARY_URLS[email] || null;

    const doc = {
      name,
      role,
      bio,
      linkedin,
      instagram,
      phone,
      email,
      password: hashedPassword,
      photoUrl,
      status: "active",
    };

    const existing = await CommunityMember.findOne({ email });

    if (existing) {
      // Only patch — don't overwrite existing data
      await CommunityMember.updateOne(
        { email },
        { $set: { photoUrl: photoUrl || existing.photoUrl } }
      );
      console.log(`🔄 Updated photoUrl for existing member: ${name} (${email})`);
      updated++;
    } else {
      await CommunityMember.create(doc);
      console.log(`✅ Created member: ${name} (${email})${photoUrl ? " [photo ✅]" : " [no photo — initials fallback]"}`);
      created++;
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log("📊 SEED SUMMARY");
  console.log("══════════════════════════════════════════");
  console.log(`✅ Created : ${created}`);
  console.log(`🔄 Updated : ${updated}`);
  console.log(`⚠️  Skipped : ${skipped}`);
  console.log(`\n🔑 Default password: "${DEFAULT_PASSWORD}"`);
  console.log("   (All members should update their password on first login)\n");

  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected. Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
