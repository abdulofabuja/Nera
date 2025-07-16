const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// 📥 GET /api/user/wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      wallet: user.wallet || 0,
      referral: user.referralBalance || 0,
      activeInvestment: user.activeInvestment || 0,
      dailyReturn: user.dailyReturn || 0,
      bonusUnlocked: user.bonusUnlocked || false
    });

  } catch (err) {
    console.error('Wallet fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;