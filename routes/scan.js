const express  = require('express');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');
const router   = express.Router();

// ── Multer setup ─────────────────────────────────────────────────
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false); // safer than throwing error
  }
});

// ── Device database (fallback when Gemini unavailable) ───────────
const DEVICE_DB = { /* ... keep your existing DEVICE_DB ... */ };

// ── Smart filename guess ─────────────────────────────────────────
function smartGuess(filename, hint) {
  if (hint && DEVICE_DB[hint]) return hint;
  const n = (filename || '').toLowerCase();
  if (/phone|iphone|samsung|galaxy|pixel|android|nokia|redmi|poco|oppo|vivo|mobile|smartphone/.test(n)) return 'Smartphone';
  if (/laptop|macbook|notebook|thinkpad|dell|hp|lenovo|asus/.test(n)) return 'Laptop';
  if (/ipad|tablet/.test(n)) return 'Tablet';
  if (/charger|adapter|cable/.test(n)) return 'Charger';
  if (/batter/.test(n)) return 'Battery';
  if (/headphone|earphone|airpod|earbud/.test(n)) return 'Headphones';
  if (/printer/.test(n)) return 'Printer';
  if (/monitor|screen/.test(n)) return 'Monitor';
  if (/router|modem/.test(n)) return 'Router';
  if (/\btv\b|television/.test(n)) return 'TV';
  if (/keyboard/.test(n)) return 'Keyboard';
  return 'Other'; // safer default
}

// ── Build response from device DB ────────────────────────────────
function buildResponse(deviceType) {
  const d = DEVICE_DB[deviceType] || DEVICE_DB.Other;
  return {
    device_type:    deviceType,
    icon:           d.icon,
    confidence:     d.confidence,
    hazards:        d.hazards,
    disposal_steps: d.disposal_steps,
    impact:         d.impact
  };
}

// ── POST /api/scan ────────────────────────────────────────────────
router.post('/', upload.single('image'), async (req, res) => {
  const imagePath   = req.file?.path;
  const deviceHint  = req.body?.device_hint || '';

  try {
    // ── Try Gemini Vision AI ──────────────────────────────────────
    if (process.env.GEMINI_API_KEY && req.file) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imageData   = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');
        const mimeType    = req.file.mimetype || 'image/jpeg';

        const prompt = `You are an e-waste identification expert. Identify the device from this image.
Pick EXACTLY one from: Smartphone, Laptop, Tablet, Charger, Battery, Headphones, Printer, Monitor, Keyboard, TV, Router, Other.
Respond ONLY in JSON:
{
  "device_type": "Smartphone",
  "confidence": "95%",
  "reasoning": "Example reasoning"
}`;

        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { data: base64Image, mimeType } },
              { text: prompt }
            ]
          }]
        });

        const text = result.response.text().trim()
          .replace(/```json/g, '').replace(/```/g, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = { device_type: 'Other', confidence: '70%' };
        }

        const deviceType = DEVICE_DB[parsed.device_type] ? parsed.device_type : 'Other';
        const response = buildResponse(deviceType);
        response.confidence = parsed.confidence || response.confidence;

        // Save to MongoDB
        try {
          const Scan = require('../models/Scan');
          await Scan.create({
            userId:        'default_user',
            deviceType,
            confidence:    response.confidence,
            hazards:       response.hazards,
            disposalSteps: response.disposal_steps,
            imagePath:     imagePath,
            scannedAt:     new Date()
          });
        } catch (dbErr) {
          console.warn('⚠️ DB save failed (non-fatal):', dbErr.message);
        }

        console.log(`✅ Gemini identified: ${deviceType} (${response.confidence})`);
        return res.json(response);
      } catch (aiErr) {
        console.warn('⚠️ Gemini failed:', aiErr.message);
      }
    }

    // ── Fallback: filename + hint ─────────────────────────────────
    const deviceType = smartGuess(req.file?.originalname, deviceHint);
    const response   = buildResponse(deviceType);
    console.log(`📋 Fallback identified: ${deviceType}`);
    res.json(response);

  } catch (err) {
    console.error('❌ Scan error:', err);
    res.status(500).json({ error: 'Scan failed', message: err.message });
  } finally {
    if (imagePath) {
      try { fs.unlinkSync(imagePath); } catch (e) {}
    }
  }
});

// ── GET /api/scan/history ─────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const Scan = require('../models/Scan');
    const scans = await Scan.find({ userId: req.query.user_id || 'default_user' })
      .sort({ scannedAt: -1 })
      .limit(20);
    res.json({ scans });
  } catch (err) {
    res.json({ scans: [] });
  }
});

module.exports = router;