require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  const memberSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: { type: String }
  }, { strict: false });
  const Member = mongoose.model('CommunityMember', memberSchema, 'communitymembers');
  
  const member = await Member.findOne({ email: 'truly.muskan007@gmail.com'.toLowerCase() });
  
  console.log('Member found:', !!member);
  if (member) {
    const isMatch = await bcrypt.compare('somepassword', member.password);
    console.log('Password match:', isMatch);
  }
  
  process.exit(0);
}

run().catch(console.error);
