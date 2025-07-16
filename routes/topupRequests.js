const express = require('express');
const router = express.Router();

// Placeholder route for now
router.get('/', (req, res) => {
  res.send('Top-up requests route working');
});

module.exports = router;