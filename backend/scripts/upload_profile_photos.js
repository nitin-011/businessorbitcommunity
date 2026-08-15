#!/usr/bin/env node
/**
 * upload_profile_photos.js
 *
 * Uploads all professional profile photos from the local directory to
 * Cloudinary (folder: businessorbit/profiles, access_mode: public) and
 * then patches the photoUrl field of the matching CommunityMember documents
 * in MongoDB.
 *
 * Usage:
 *   node scripts/upload_profile_photos.js
 */

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Constants ────────────────────────────────────────────────────────────────
const IMAGES_DIR = process.env.IMAGES_DIR || path.resolve(__dirname, "../../Docs/photos");
try {
  if (!fs.statSync(IMAGES_DIR).isDirectory()) {
    console.error(`Images directory is not a directory: ${IMAGES_DIR}`);
    process.exit(1);
  }
  fs.accessSync(IMAGES_DIR, fs.constants.R_OK);
} catch (err) {
  console.error(`Images directory not found or not readable: ${IMAGES_DIR}`);
  process.exit(1);
}
const CLOUDINARY_FOLDER = "businessorbit/profiles";
const MONGO_URL = process.env.MONGO_URL;

// ─── Member Email Map ─────────────────────────────────────────────────────────
// Maps the name extracted from the filename → member email in the DB.
// Names are normalised (lowercase, trimmed) for matching.
const NAME_TO_EMAIL = {
  muskan: "truly.muskan007@gmail.com",
  "sakeena yousuf": "sakeenayousuf04@gmail.com",
  "mountain bird bagpackers": "contact.mountainbirdbagpackers@gmail.com",
  "sandeep ahluwalia": "bobwalia@gmail.com",
  "aman deep": "amandeep269054@gmail.com",
  "ujjwal dhawan": "ujjwaldhawan1003@gmail.com",
  "navpreet singh": "2713.navi@gmail.com",
  radhika: "r60921@gmail.com",
  "asheesh bhalla": "bhallaasheesh@gmail.com",
  "dr.shruti avasthi": "infocometaiinstitute@gmail.com",
  "akanksha 2352": "akanksha.arora@aol.com",
  "gurvinder singh": "gurvindersingh1666@gmail.com",
  "vijay kumar": "vijay_mvsb@yahoo.com",
};

// Sonika Sarhadi has no matching member — she will be uploaded but not assigned.
// (Puneet Madan is the only member without a photo. The Sonika Sarhadi photo is
//  clearly of a different individual, so it would be inappropriate to assign it
//  to Puneet. Puneet's card will display an initials avatar as designed.)
const UNASSIGNED_NAMES = ["sonika sarhadi"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract the person's name from a filename like:
 *   "1719239631297 - Aman Deep.jpeg"
 *   "founder_gurvinder - Gurvinder Singh.jpg"
 *   "IMG_4304 - Mountain Bird Bagpackers.PNG"
 * Returns the name part, lowercased and trimmed.
 */
function extractNameFromFilename(filename) {
  const withoutExt = path.basename(filename, path.extname(filename));
  const dashIdx = withoutExt.lastIndexOf(" - ");
  if (dashIdx === -1) return withoutExt.toLowerCase().trim();
  return withoutExt
    .slice(dashIdx + 3)
    .toLowerCase()
    .trim();
}

/**
 * Upload a single file to Cloudinary with public access.
 * Returns the secure_url of the uploaded resource.
 */
async function uploadToCloudinary(filePath, publicId) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    access_mode: "public",
    overwrite: true,
    resource_type: "image",
    // Allow HEIC — Cloudinary converts it automatically
    format: "jpg",
  });
  return result.secure_url;
}

// ─── Mongoose Schema (minimal, just what we need) ────────────────────────────
const CommunityMemberSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, lowercase: true },
    photoUrl: String,
    status: String,
  },
  { timestamps: true },
);

const CommunityMember =
  mongoose.models.CommunityMember ||
  mongoose.model("CommunityMember", CommunityMemberSchema);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔗 Connecting to MongoDB…");
  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB connected\n");

  let rawFiles;
  try {
    rawFiles = fs.readdirSync(IMAGES_DIR);
  } catch (err) {
    throw new Error(`Failed to read directory ${IMAGES_DIR}: ${err.message}`);
  }
  const files = rawFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".heic",
      ".heif",
    ].includes(ext);
  });

  console.log(`📁 Found ${files.length} image(s) in directory:\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const nameKey = extractNameFromFilename(file);
    const email = NAME_TO_EMAIL[nameKey];
    const isUnassigned = UNASSIGNED_NAMES.includes(nameKey);

    console.log(`──────────────────────────────────────────`);
    console.log(`📸 File    : ${file}`);
    console.log(`🏷️  Name    : ${nameKey}`);

    if (isUnassigned) {
      console.log(
        `⚠️  Status  : UNASSIGNED (no matching member — uploading anyway)`,
      );
    } else if (!email) {
      console.log(`❌ Status  : No email mapping found — SKIPPING`);
      results.push({
        file,
        nameKey,
        email: null,
        url: null,
        status: "no_mapping",
      });
      continue;
    } else {
      console.log(`📧 Email   : ${email}`);
    }

    // Upload to Cloudinary
    try {
      const publicId = `profile_${nameKey.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;
      console.log(`☁️  Uploading to Cloudinary (public_id: ${publicId})…`);
      const url = await uploadToCloudinary(filePath, publicId);
      console.log(`✅ URL     : ${url}`);

      if (!isUnassigned && email) {
        // Patch the DB record
        const member = await CommunityMember.findOne({ email });
        if (!member) {
          console.log(
            `⚠️  DB      : No member found with email ${email} — URL not saved to DB`,
          );
          results.push({
            file,
            nameKey,
            email,
            url,
            status: "member_not_in_db",
          });
        } else {
          await CommunityMember.updateOne(
            { email },
            { $set: { photoUrl: url } },
          );
          console.log(
            `💾 DB      : photoUrl updated for "${member.name}" (${email})`,
          );
          results.push({ file, nameKey, email, url, status: "updated" });
        }
      } else {
        results.push({
          file,
          nameKey,
          email: null,
          url,
          status: "uploaded_unassigned",
        });
      }
    } catch (err) {
      console.error(`❌ Upload failed for ${file}:`, err.message);
      results.push({
        file,
        nameKey,
        email,
        url: null,
        status: "upload_error",
        error: err.message,
      });
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log("📊 SUMMARY");
  console.log("══════════════════════════════════════════\n");

  const updated = results.filter((r) => r.status === "updated");
  const unassigned = results.filter((r) => r.status === "uploaded_unassigned");
  const notInDb = results.filter((r) => r.status === "member_not_in_db");
  const errors = results.filter((r) => r.status === "upload_error");
  const noMapping = results.filter((r) => r.status === "no_mapping");

  console.log(`✅ Successfully updated  : ${updated.length}`);
  updated.forEach((r) => console.log(`   • ${r.nameKey} → ${r.url}`));

  if (unassigned.length) {
    console.log(`\n⚠️  Uploaded (unassigned): ${unassigned.length}`);
    unassigned.forEach((r) => console.log(`   • ${r.nameKey} → ${r.url}`));
  }
  if (notInDb.length) {
    console.log(`\n⚠️  Not found in DB      : ${notInDb.length}`);
    notInDb.forEach((r) => console.log(`   • ${r.nameKey} (${r.email})`));
  }
  if (errors.length) {
    console.log(`\n❌ Upload errors         : ${errors.length}`);
    errors.forEach((r) => console.log(`   • ${r.nameKey}: ${r.error}`));
  }
  if (noMapping.length) {
    console.log(`\n🚫 No name mapping found : ${noMapping.length}`);
    noMapping.forEach((r) => console.log(`   • ${r.file}`));
  }

  await mongoose.disconnect();
  console.log("\n🔌 MongoDB disconnected. Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
