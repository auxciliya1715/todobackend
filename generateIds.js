require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/user');

function generateUserCode() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `USR${randomNum}`;
}

async function addMissingUserIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find users without userId
    const usersWithoutId = await User.find({ userId: { $exists: false } });
    console.log(`Found ${usersWithoutId.length} users missing userId`);

    for (const user of usersWithoutId) {
      user.userId = generateUserCode();
      await user.save();
      console.log(`✅ Added userId ${user.userId} to ${user.email}`);
    }

    console.log('🎉 All missing userIds have been added!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addMissingUserIds();
