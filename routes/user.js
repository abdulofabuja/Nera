const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// 📥 GET /api/user/wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let displayWallet = user.wallet;

    // 👁️ Hide ₦2,000 bonus if still locked
    if (user.isBonusLocked && displayWallet >= 2000) {
      displayWallet -= 2000;
    }

    res.json({
      wallet: displayWallet,
      referral: user.referralBalance || 0,
      activeInvestment: user.activeInvestment || 0,
      dailyReturn: user.dailyReturn || 0
    });

  } catch (err) {
    console.error('Wallet fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;