require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: 'business_orbit' });
  
  const memberSchema = new mongoose.Schema({}, { strict: false });
  const Member = mongoose.model('CommunityMember', memberSchema, 'communitymembers');
  
  const members = await Member.find({});
  console.log('Total members in business_orbit:', members.length);
  if (members.length > 0) {
    const m = await Member.findOne({ email: 'truly.muskan007@gmail.com' });
    if (m) {
      console.log('Found Muskan in business_orbit:', m);
    } else {
      console.log('Muskan not found in business_orbit.');
    }
  }
  
  process.exit(0);
}

run().catch(console.error);
