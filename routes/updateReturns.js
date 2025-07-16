const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');

// POST /api/update-returns
router.post('/', async (req, res) => {
  try {
    const investments = await Investment.find({ status: 'active' });

    for (const inv of investments) {
      let totalReturn = inv.returns;

      // Update logic based on amount
      if (inv.amount === 2000) totalReturn = 3000;
      else if (inv.amount === 3000) totalReturn = 5500;
      else if (inv.amount === 5000) totalReturn = 9000;
      else if (inv.amount === 7500) totalReturn = 13500;

      inv.returns = totalReturn;
      inv.status = 'completed';
      inv.endDate = new Date();
      await inv.save();
    }

    res.json({ message: '✅ Investment returns updated successfully!' });
  } catch (err) {
    console.error('Error updating returns:', err.message);
    res.status(500).json({ message: '❌ Server error updating returns' });
  }
});

module.exports = router;