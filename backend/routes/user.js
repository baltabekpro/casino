const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile and balance
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDb();

  db.get('SELECT id, username, balance FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Get game history
router.get('/history', authenticateToken, (req, res) => {
  const db = getDb();

  db.all(
    'SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 50',
    [req.user.id],
    (err, history) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }

      res.json({ history });
    }
  );
});

module.exports = router;
