const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost:27017/businessorbit",
);
const Admin = mongoose.model(
  "Admin",
  new mongoose.Schema({}, { strict: false }),
);
Admin.find({}, { email: 1, role: 1, _id: 1 }).then((admins) => {
  console.log("Admins in DB:", admins);
  process.exit(0);
});
