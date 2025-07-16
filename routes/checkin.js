const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

const checkinHistory = {}; // ⚠️ Temporary storage

router.post('/', auth, async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toDateString();

  if (!checkinHistory[userId]) checkinHistory[userId] = [];

  const lastCheckin = checkinHistory[userId].slice(-1)[0];

  if (lastCheckin === today) {
    return res.status(400).json({ message: 'Already checked in today.' });
  }

  // Simple streak reset logic (can be improved)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const missed = lastCheckin !== yesterday.toDateString();

  if (missed) checkinHistory[userId] = []; // reset streak

  checkinHistory[userId].push(today);
  const user = await User.findById(userId);
  user.wallet += 50;
  await user.save();

  res.json({
    message: '✅ Check-in successful! ₦50 added to wallet.',
    streak: checkinHistory[userId].length
  });
});

module.exports = router;