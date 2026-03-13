const express = require('express');
const router  = express.Router();

let Scan, User;
function getScan() { if(!Scan) Scan = require('../models/Scan'); return Scan; }
function getUser() { if(!User) User = require('../models/User'); return User; }

// GET /api/user/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.user_id || 'default_user';
    console.log(`📊 Stats requested for user: ${userId}`);
    const scans  = await getScan().find({ userId }).sort({ scannedAt: -1 });
    const user   = await getUser().findOne({ userId });
    console.log(`✅ Found ${scans.length} scans for ${userId}`);
    res.json({
      devices_recycled: scans.length,
      points:           user?.points || scans.length * 100,
      co2_saved:        scans.length * 70,
      rank:             8,
      recent_scans:     scans.slice(0, 5)
    });
  } catch (err) {
    console.error('❌ Stats error:', err.message);
    res.json({ devices_recycled:0, points:0, co2_saved:0, rank:0, recent_scans:[] });
  }
});

// POST /api/user/pickup
router.post('/pickup', async (req, res) => {
  try {
    const { device_type, user_id, address, name, phone } = req.body;
    console.log('📦 ─────────────────────────────────');
    console.log('📦 NEW PICKUP REQUEST RECEIVED');
    console.log('📦 ─────────────────────────────────');
    console.log('👤 Name       :', name       || 'Not provided');
    console.log('📱 Device     :', device_type || 'Not provided');
    console.log('📍 Address    :', address     || 'Not provided');
    console.log('📞 Phone      :', phone       || 'Not provided');
    console.log('🆔 User ID    :', user_id     || 'guest');
    console.log('🕐 Time       :', new Date().toLocaleString());
    console.log('📦 ─────────────────────────────────');

    const ref = 'PU-' + Math.random().toString(36).substr(2,6).toUpperCase();
    console.log('✅ Pickup confirmed! Ref:', ref);

    res.json({
      success:    true,
      message:    'Pickup scheduled!',
      ref,
      device_type, address,
      eta:        '2-3 business days'
    });
  } catch (err) {
    console.error('❌ Pickup error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/redeem
router.post('/redeem', async (req, res) => {
  try {
    const { reward, cost, user_id } = req.body;
    const userId = user_id || 'default_user';
    console.log('🎁 ─────────────────────────────────');
    console.log('🎁 REWARD REDEMPTION');
    console.log('🎁 ─────────────────────────────────');
    console.log('🆔 User   :', userId);
    console.log('🎁 Reward :', reward);
    console.log('💰 Cost   :', cost, 'points');
    console.log('🎁 ─────────────────────────────────');
    await getUser().findOneAndUpdate(
      { userId },
      { $inc: { points: -cost } },
      { upsert: true }
    );
    console.log('✅ Points deducted successfully');
    res.json({ success: true, message: `Redeemed: ${reward}` });
  } catch (err) {
    console.error('❌ Redeem error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
