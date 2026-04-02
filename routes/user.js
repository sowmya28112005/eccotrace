// routes/user.js  — EcoTrace user auth routes
// MongoDB via Mongoose. Add to server.js: app.use('/api/user', require('./routes/user'));

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const User     = require('../models/user');

// ────────────────────────────────────────────────
// POST /api/user/check-email
// Checks if an email already exists in MongoDB.
// Called by register.html BEFORE the user sets a password.
// Response: { exists: true/false }
// ────────────────────────────────────────────────
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    return res.json({ exists: !!existing });
  } catch (err) {
    console.error('check-email error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ────────────────────────────────────────────────
// POST /api/user/register
// Creates a new user. Returns 409 if email taken.
// Body: { firstName, lastName, email, city, password }
// Response: { message, user: { firstName, lastName, email, city, eco_points } }
// ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, city, password } = req.body;

    // Validate
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: 'firstName, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName:  (lastName || '').trim(),
      email:     normalizedEmail,
      city:      (city || '').trim(),
      password:  hashedPassword,
      eco_points: 50,
      createdAt: new Date()
    });

    // Return safe user object (no password)
    return res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id:         newUser._id,
        firstName:  newUser.firstName,
        lastName:   newUser.lastName,
        email:      newUser.email,
        city:       newUser.city,
        eco_points: newUser.eco_points
      }
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// ────────────────────────────────────────────────
// POST /api/user/login
// Verifies email + password against MongoDB.
// Body: { email, password }
// Response: { message, user: { id, firstName, email, eco_points } }
// ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please register first.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    // Return safe user object
    return res.json({
      message: 'Login successful',
      user: {
        id:         user._id,
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.email,
        city:       user.city,
        eco_points: user.eco_points || 0
      }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// ────────────────────────────────────────────────
// GET /api/user/stats  (optional — for dashboard)
// ────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total = await User.countDocuments();
    return res.json({ total_users: total });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;