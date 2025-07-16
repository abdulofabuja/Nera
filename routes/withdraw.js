const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const auth = require('../middlewares/auth');

// 📤 POST: User requests withdrawal
router.post('/', auth, async (req, res) => {
  const { amount, source, bankName, accountNumber, accountName } = req.body;

  if (!amount || !source || !bankName || !accountNumber || !accountName) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check and deduct balance based on source
    if (source === 'investment') {
      if (user.wallet < amount) {
        return res.status(400).json({ message: 'Insufficient investment balance' });
      }
      user.wallet -= amount;
    } else if (source === 'referral') {
      if (user.referralBalance < amount) {
        return res.status(400).json({ message: 'Insufficient referral balance' });
      }
      user.referralBalance -= amount;
    } else {
      return res.status(400).json({ message: 'Invalid withdrawal source' });
    }

    // Save withdrawal request
    const newWithdrawal = new Withdrawal({
      user: user._id,
      amount,
      source,
      bankName,
      accountNumber,
      accountName
    });

    await newWithdrawal.save();
    await user.save();

    res.json({ message: 'Withdrawal request submitted and pending approval' });

  } catch (err) {
    console.error('Withdrawal error:', err.message);
    res.status(500).json({ message: 'Server error during withdrawal request' });
  }
});

module.exports = router;