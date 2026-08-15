require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  
  const memberSchema = new mongoose.Schema({}, { strict: false });
  const Member = mongoose.model('CommunityMember', memberSchema, 'communitymembers');
  
  const members = await Member.find({});
  console.log('Total members:', members.length);
  if (members.length > 0) {
    console.log(members[0]);
  }
  
  process.exit(0);
}

run().catch(console.error);
