const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// 📥 GET /api/user/wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('wallet referralBonus');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ wallet: user.wallet, referralBonus: user.referralBonus });
  } catch (err) {
    console.error('Wallet fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;