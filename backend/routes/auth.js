const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Validate username
  if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  // Check for valid username characters
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  // Validate password
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (password.length > 100) {
    return res.status(400).json({ error: 'Password is too long' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDb();

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, balance: 1000.0 }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Basic type validation
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid credentials format' });
  }

  const db = getDb();

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, balance: user.balance }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

module.exports = router;
