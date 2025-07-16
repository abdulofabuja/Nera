const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Investment = require('../models/Investment');
const User = require('../models/User');

// 🟢 GET all investments of logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching investments' });
  }
});

// 🟢 POST create new investment
router.post('/', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    let actualWallet = user.wallet;

    // If bonus is locked, exclude ₦2000 from usable balance
    if (user.isBonusLocked) {
      if (actualWallet - 2000 < amount) {
        return res.status(400).json({ message: 'Insufficient balance. ₦2000 bonus is locked until first investment.' });
      }
    } else {
      if (actualWallet < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }

    // Deduct investment amount
    user.wallet -= amount;

    // Unlock ₦2000 bonus after first investment
    if (user.isBonusLocked) {
      user.isBonusLocked = false;
    }

    // Calculate daily return
    let dailyReturn = 0;
    if (amount === 2000) dailyReturn = 429;
    else if (amount === 3000) dailyReturn = 715;
    else if (amount === 5000) dailyReturn = 1286;
    else if (amount === 7500) dailyReturn = 1857;
    else return res.status(400).json({ message: 'Invalid package amount' });

    // Save investment
    const newInvestment = new Investment({
      user: user._id,
      amount,
      dailyReturn,
    });

    user.activeInvestment += amount;
    user.dailyReturn += dailyReturn;

    await newInvestment.save();
    await user.save();

    res.json({ message: 'Investment successful', newInvestment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating investment' });
  }
});

module.exports = router;