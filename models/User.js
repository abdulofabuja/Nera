const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wallet: { type: Number, default: 0 },
  referralCode: { type: String },
  referredBy: { type: String },
  bonusUnlocked: { type: Boolean, default: false },
  firstTopupDone: { type: Boolean, default: false },
  referralBalance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false } // ✅ NEW FIELD
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);