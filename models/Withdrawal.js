const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, enum: ['investment', 'referral'], required: true }, // ✅ dropdown select
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);