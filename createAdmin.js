const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // Make sure this path is correct

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const phone = '09016015172';
    const password = 'adinoyi12';
    const hashedPassword = await bcrypt.hash(password, 10);

    const exists = await User.findOne({ phone });
    if (exists) {
      console.log('⚠️ Admin already exists with this phone.');
      process.exit();
    }

    const admin = new User({
      phone,
      password: hashedPassword,
      isAdmin: true,
      wallet: 0,
      referralBalance: 0,
      referralCode: 'ADMIN00',
      isBonusLocked: false
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();