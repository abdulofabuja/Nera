const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// ✨ Generate unique referral code
function generateReferralCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 📌 Register Route
router.post('/register', async (req, res) => {
  const { phone, password, referredBy } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required' });

  try {
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      referredBy: referredBy || null,
      wallet: 2000, // 🎁 Give ₦2000 bonus at start
      isBonusLocked: true // 🚫 Lock bonus until first investment
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        phone: newUser.phone,
        referralCode: newUser.referralCode,
        wallet: newUser.wallet,
        isBonusLocked: newUser.isBonusLocked
      }
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔑 Login Route
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required' });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        phone: user.phone,
        referralCode: user.referralCode,
        wallet: user.wallet,
        isBonusLocked: user.isBonusLocked
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;