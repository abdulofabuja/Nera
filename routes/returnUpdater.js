const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');

// This can be protected by admin login later
router.post('/update-returns', async (req, res) => {
  try {
    const activeInvestments = await Investment.find({ status: 'active' });

    for (const investment of activeInvestments) {
      let newReturn = investment.returns;

      if (investment.amount === 2000) newReturn += 1000;  // Total 3000
      if (investment.amount === 3000) newReturn += 2500;  // Total 5500
      if (investment.amount === 5000) newReturn += 4000;  // Total 9000
      if (investment.amount === 7500) newReturn += 6000;  // Total 13500

      investment.returns = newReturn;
      investment.status = 'completed';
      await investment.save();
    }

    res.json({ message: '✅ Returns updated successfully for all active investments.' });
  } catch (err) {
    console.error('Return update error:', err.message);
    res.status(500).json({ message: '❌ Server error during return update' });
  }
});

module.exports = router;