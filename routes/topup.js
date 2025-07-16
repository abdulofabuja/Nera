const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Investment = require('../models/Investment');

// ✅ VERIFY Flutterwave payment and activate investment
router.post('/flutterwave/verify', auth, async (req, res) => {
  const { transaction_id, amount, returns } = req.body;

  if (!transaction_id || !amount || !returns) {
    return res.status(400).json({ message: 'Missing data' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Verify Flutterwave payment
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    const data = response.data;
    if (data.status !== 'success' || data.data.status !== 'successful') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // ✅ Create investment
    const newInvestment = new Investment({
      user: user._id,
      amount,
      returns,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });
    await newInvestment.save();

    // ✅ Unlock ₦2000 bonus on first top-up
    if (!user.firstTopupDone && !user.bonusUnlocked && amount >= 2000) {
      user.wallet += 2000;
      user.bonusUnlocked = true;
    }

    // ✅ 10% referral bonus
    if (!user.firstTopupDone && user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const bonus = Math.floor(amount * 0.1);
        referrer.referralBalance += bonus;
        await referrer.save();
      }
    }

    user.firstTopupDone = true;
    await user.save();

    res.json({ message: '✅ Investment started successfully' });
  } catch (err) {
    console.error('Flutterwave verify error:', err.message);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

module.exports = router;