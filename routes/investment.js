const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Investment = require('../models/Investment');

// 🟢 GET all investments of logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching investments' });
  }
});

module.exports = router;