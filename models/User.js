const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wallet: { type: Number, default: 2000 }, // 🎁 Bonus credited at registration
  referralCode: { type: String },
  referredBy: { type: String },
  bonusUnlocked: { type: Boolean, default: false },
  firstTopupDone: { type: Boolean, default: false },
  referralBalance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },

  // ✅ NEW: Lock bonus until user activates package
  isBonusLocked: { type: Boolean, default: true },
  activeInvestment: { type: Number, default: 0 },
  dailyReturn: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);;