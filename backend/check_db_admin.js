const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/businessorbit");
const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
Admin.find().then(admins => {
  console.log('Admins in DB:', admins);
  process.exit(0);
});
