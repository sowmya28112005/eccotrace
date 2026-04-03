const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();

// ── Helpers ───────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'ecotrace_secret_change_me';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// ── POST /api/user/register ───────────────────────────────────────
// After successful registration the client is told to redirect to
// scan.html (NOT dashboard.html) so the user can immediately
// continue listing the device they came from.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const User = require('../models/user');

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      joinedAt: new Date()
    });

    const token = signToken(user._id);

    console.log('✅ New user registered:', user.email);

    // redirect field tells the frontend where to go after register.
    // We always send to scan.html — NOT dashboard.html.
    return res.status(201).json({
      success:  true,
      token,
      userId:   user._id,
      name:     user.name,
      redirect: 'scan.html'   // ← always redirect to scan after register
    });

  } catch (err) {
    console.error('❌ Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// ── POST /api/user/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const User = require('../models/user');
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = signToken(user._id);
    console.log('✅ User logged in:', user.email);

    // Login goes to dashboard
    return res.json({
      success:  true,
      token,
      userId:   user._id,
      name:     user.name,
      redirect: 'dashboard.html'
    });

  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// ── GET /api/user/profile ─────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token      = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const User    = require('../models/user');
    const user    = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// ── GET /api/user/leaderboard ─────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const User = require('../models/user');
    const Scan = require('../models/scan');

    // Aggregate scan counts per user
    const counts = await Scan.aggregate([
      { $group: { _id: '$userId', totalScans: { $sum: 1 } } },
      { $sort: { totalScans: -1 } },
      { $limit: 20 }
    ]);

    // Populate names
    const board = await Promise.all(counts.map(async (entry) => {
      try {
        const u = await User.findById(entry._id).select('name');
        return { name: u?.name || 'Anonymous', totalScans: entry.totalScans };
      } catch {
        return { name: 'Anonymous', totalScans: entry.totalScans };
      }
    }));

    return res.json({ leaderboard: board });
  } catch (err) {
    console.error('❌ Leaderboard error:', err.message);
    return res.json({ leaderboard: [] });
  }
});

module.exports = router;