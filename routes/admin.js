const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middlewares/auth');

// ✅ Admin check middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET all users (with wallet + referral + investments)
router.get('/all-users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    const result = [];

    for (const user of users) {
      const investments = await Investment.find({ user: user._id });
      result.push({
        phone: user.phone,
        wallet: user.wallet,
        referralBalance: user.referralBalance,
        investments: investments.map(inv => ({
          amount: inv.amount,
          returns: inv.returns,
          status: inv.status
        }))
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ✅ GET investments for one user
router.get('/user-investments/:userId', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const investments = await Investment.find({ user: userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching investments' });
  }
});

// ✅ GET all pending withdrawal requests
router.get('/withdrawals', auth, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' }).populate('user', 'phone');
    res.json(withdrawals.map(w => ({
      _id: w._id,
      phone: w.user.phone,
      amount: w.amount,
      source: w.source,
      bankName: w.bankName,
      accountNumber: w.accountNumber,
      accountName: w.accountName
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching withdrawals' });
  }
});

// ✅ Approve withdrawal
router.post('/withdrawals/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ message: 'Withdrawal not found or already processed' });
    }

    withdrawal.status = 'approved';
    await withdrawal.save();
    res.json({ message: 'Withdrawal approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving withdrawal' });
  }
});

// ❌ Decline withdrawal (refund amount)
router.post('/withdrawals/:id/decline', auth, isAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ message: 'Withdrawal not found or already processed' });
    }

    // Refund based on source
    if (withdrawal.source === 'investment') {
      withdrawal.user.wallet += withdrawal.amount;
    } else if (withdrawal.source === 'referral') {
      withdrawal.user.referralBalance += withdrawal.amount;
    }

    withdrawal.status = 'declined';
    await withdrawal.user.save();
    await withdrawal.save();
    res.json({ message: 'Withdrawal declined and refunded' });

  } catch (err) {
    res.status(500).json({ message: 'Error declining withdrawal' });
  }
});

module.exports = router;