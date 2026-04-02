const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/user');

// ── REGISTER ─────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    console.log('📥 Register received:', req.body);

    const { name, email, password } = req.body;

    // ── 1. Validation ──────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // ── 2. Split name ──────────────────────────────────────────
    const parts     = name.trim().split(' ');
    const firstName = parts[0];
    const lastName  = parts.slice(1).join(' ') || '';

    // ── 3. Duplicate email check ───────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // ── 4. Hash password ───────────────────────────────────────
    const hashed = await bcrypt.hash(password, 10);

    // ── 5. Save user ───────────────────────────────────────────
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashed
    });
    await user.save();
    console.log('✅ User saved:', user._id);

    // ── 6. Generate JWT ────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ecotrace_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      userId: user._id,
      name: `${firstName} ${lastName}`.trim()
    });

  } catch (err) {
    console.error('❌ Register error:', err);

    // MongoDB duplicate key (race condition on email)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Mongoose validation error — show which field failed
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${msg}` });
    }

    // MongoDB not connected
    if (err.name === 'MongoNotConnectedError' || err.message.includes('buffering timed out')) {
      return res.status(500).json({ message: 'Database not connected. Check your MONGO_URI in .env' });
    }

    // Catch-all — return the REAL message so you can debug
    return res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📥 Login received:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account found. Please register.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ecotrace_secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login success:', user._id);

    return res.status(200).json({
      token,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`.trim()
    });

  } catch (err) {
    console.error('❌ Login error:', err);

    if (err.name === 'MongoNotConnectedError' || err.message.includes('buffering timed out')) {
      return res.status(500).json({ message: 'Database not connected. Check your MONGO_URI in .env' });
    }

    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;