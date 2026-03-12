const express = require('express');
const router  = express.Router();

let Scan, User;
function getScan() { if(!Scan) Scan = require('../models/Scan'); return Scan; }
function getUser() { if(!User) User = require('../models/User'); return User; }

// GET /api/user/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.user_id || 'default_user';
    const scans  = await getScan().find({ userId }).sort({ scannedAt: -1 });
    const user   = await getUser().findOne({ userId });
    res.json({
      devices_recycled: scans.length,
      points:           user?.points || scans.length * 100,
      co2_saved:        scans.length * 70,
      rank:             8,
      recent_scans:     scans.slice(0, 5)
    });
  } catch (err) {
    res.json({ devices_recycled:0, points:0, co2_saved:0, rank:0, recent_scans:[] });
  }
});

// POST /api/user/pickup
router.post('/pickup', async (req, res) => {
  try {
    const { device_type, user_id, address } = req.body;
    res.json({
      success:    true,
      message:    'Pickup scheduled!',
      ref:        'PU-' + Math.random().toString(36).substr(2,6).toUpperCase(),
      device_type, address,
      eta:        '2-3 business days'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/redeem
router.post('/redeem', async (req, res) => {
  try {
    const { reward, cost, user_id } = req.body;
    const userId = user_id || 'default_user';
    await getUser().findOneAndUpdate(
      { userId },
      { $inc: { points: -cost } },
      { upsert: true }
    );
    res.json({ success: true, message: `Redeemed: ${reward}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
