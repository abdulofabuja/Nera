const express = require('express');
const router = express.Router();

// ✅ GET insight data (placeholder)
router.get('/', (req, res) => {
  res.json({
    title: 'Welcome to ₦eraInsight',
    message: 'This is your financial dashboard for smart investments and referral earnings.',
    tips: [
      'Check in daily to earn ₦50.',
      'Invest in the ₦2000, ₦3000, ₦5000 or ₦7500 packages.',
      'Withdraw every 7 days.',
      'Refer friends and earn more.'
    ]
  });
});

module.exports = router;