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
    else cb(null, false);
  }
});

// ── Device database ───────────────────────────────────────────────
const DEVICE_DB = {
  Smartphone: {
    icon: '📱', confidence: '90%',
    hazards: ['Lithium', 'Lead', 'Mercury', 'Cobalt'],
    disposal_steps: ['Back up all photos, contacts and apps.', 'Factory reset and remove Google/Apple ID.', 'Remove SIM card and keep it separately.', 'Remove battery if possible.', 'Drop at a certified e-waste center.'],
    impact: { co2: '70 kg CO₂', gold: '0.03 g gold', water: '12 L water', energy: '180 kWh' }
  },
  Laptop: {
    icon: '💻', confidence: '90%',
    hazards: ['Lead', 'Cadmium', 'Mercury', 'Beryllium'],
    disposal_steps: ['Back up files to cloud or external drive.', 'Securely wipe SSD/HDD using factory reset.', 'Remove battery and keep it separate.', 'Take to a certified ITAD center.'],
    impact: { co2: '156 kg CO₂', gold: '0.5 g gold', water: '85 L water', energy: '320 kWh' }
  },
  Tablet: {
    icon: '📟', confidence: '90%',
    hazards: ['Lithium', 'Lead', 'Coltan'],
    disposal_steps: ['Sign out of all accounts and factory reset.', 'Remove SIM/memory card.', 'Drop at manufacturer store or e-waste center.'],
    impact: { co2: '90 kg CO₂', gold: '0.08 g gold', water: '35 L water', energy: '220 kWh' }
  },
  Charger: {
    icon: '🔌', confidence: '90%',
    hazards: ['PVC plastic', 'Lead', 'Flame retardants'],
    disposal_steps: ['Do not cut the cable.', 'Collect multiple chargers for one trip.', 'Drop at electronics store recycling bin.'],
    impact: { co2: '2 kg CO₂', gold: '0.001 g gold', water: '2 L water', energy: '5 kWh' }
  },
  Battery: {
    icon: '🔋', confidence: '90%',
    hazards: ['Lithium', 'Sulfuric acid', 'Heavy metals'],
    disposal_steps: ['NEVER throw in regular trash — fire hazard!', 'Tape terminals before storage.', 'Take to battery collection point.'],
    impact: { co2: '5 kg CO₂', gold: '0.002 g gold', water: '5 L water', energy: '12 kWh' }
  },
  Headphones: {
    icon: '🎧', confidence: '90%',
    hazards: ['PVC plastic', 'Lead solder', 'Lithium'],
    disposal_steps: ['Remove batteries from wireless headphones.', 'Check brand website for mail-in recycling.', 'Drop at electronics retailer.'],
    impact: { co2: '8 kg CO₂', gold: '0.005 g gold', water: '4 L water', energy: '18 kWh' }
  },
  Printer: {
    icon: '🖨️', confidence: '90%',
    hazards: ['Toner', 'Lead', 'Chromium'],
    disposal_steps: ['Remove all ink/toner cartridges.', 'Return cartridges to manufacturer.', 'Take to e-waste center.'],
    impact: { co2: '200 kg CO₂', gold: '0.1 g gold', water: '100 L water', energy: '400 kWh' }
  },
  Monitor: {
    icon: '🖥️', confidence: '90%',
    hazards: ['Mercury', 'Lead', 'Cadmium'],
    disposal_steps: ['Handle carefully — contains mercury.', 'Never smash — releases toxic dust.', 'Find a certified LCD recycler.'],
    impact: { co2: '450 kg CO₂', gold: '0.2 g gold', water: '250 L water', energy: '600 kWh' }
  },
  Keyboard: {
    icon: '⌨️', confidence: '90%',
    hazards: ['ABS plastic', 'Lead solder'],
    disposal_steps: ['Drop at any e-waste bin.', 'Consider donating if working.'],
    impact: { co2: '15 kg CO₂', gold: '0.01 g gold', water: '8 L water', energy: '30 kWh' }
  },
  TV: {
    icon: '📺', confidence: '90%',
    hazards: ['Lead', 'Mercury', 'Cadmium'],
    disposal_steps: ['Handle CRT TVs with extreme care.', 'Do NOT put at curbside.', 'Find a certified TV recycler.'],
    impact: { co2: '350 kg CO₂', gold: '0.15 g gold', water: '180 L water', energy: '500 kWh' }
  },
  Router: {
    icon: '📡', confidence: '90%',
    hazards: ['Lead solder', 'Flame retardants'],
    disposal_steps: ['Factory reset first.', 'Remove SIM cards.', 'Drop at e-waste bin or check ISP return program.'],
    impact: { co2: '10 kg CO₂', gold: '0.008 g gold', water: '6 L water', energy: '22 kWh' }
  },
  Other: {
    icon: '🔧', confidence: '70%',
    hazards: ['Mixed materials', 'Possible heavy metals'],
    disposal_steps: ['Check manufacturer website for guidance.', 'Take to nearest certified e-waste center.'],
    impact: { co2: '50 kg CO₂', gold: '0.05 g gold', water: '30 L water', energy: '100 kWh' }
  }
};

// ── Smart filename guess ──────────────────────────────────────────
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
  return 'Other';
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
  const imagePath  = req.file?.path;
  const deviceHint = req.body?.device_hint || '';

  try {
    if (process.env.GEMINI_API_KEY && req.file) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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
        try { parsed = JSON.parse(text); }
        catch (e) { parsed = { device_type: 'Other', confidence: '70%' }; }

        const deviceType = DEVICE_DB[parsed.device_type] ? parsed.device_type : 'Other';
        const response   = buildResponse(deviceType);
        response.confidence = parsed.confidence || response.confidence;

        try {
          const Scan = require('../models/Scan');
          await Scan.create({
            userId:        'guest',
            deviceType,
            confidence:    response.confidence,
            hazards:       response.hazards,
            disposalSteps: response.disposal_steps,
            imagePath:     imagePath,
            scannedAt:     new Date()
          });
          console.log('💾 Saved to MongoDB:', deviceType);
        } catch (dbErr) {
          console.warn('⚠️ DB save failed (non-fatal):', dbErr.message);
        }

        console.log(`✅ Gemini identified: ${deviceType} (${response.confidence})`);
        return res.json(response);

      } catch (aiErr) {
        console.warn('⚠️ Gemini failed:', aiErr.message);
      }
    }

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

// ── POST /api/scan/save — called by frontend after every scan ─────
router.post('/save', async (req, res) => {
  try {
    const { userId, deviceType, confidence, hazards, disposalSteps, source } = req.body;
    console.log('💾 ─────────────────────────────────');
    console.log('💾 NEW SCAN SAVED TO MONGODB');
    console.log('📱 Device    :', deviceType);
    console.log('🎯 Confidence:', confidence);
    console.log('🔍 Source    :', source);
    console.log('🕐 Time      :', new Date().toLocaleString());
    console.log('💾 ─────────────────────────────────');
    const Scan = require('../models/Scan');
    await Scan.create({
      userId:        userId || 'guest',
      deviceType:    deviceType || 'Other',
      confidence:    confidence || '—',
      hazards:       hazards || [],
      disposalSteps: disposalSteps || [],
      scannedAt:     new Date()
    });
    console.log('✅ Saved to MongoDB!');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/scan/history ─────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const Scan = require('../models/Scan');
    const scans = await Scan.find({ userId: req.query.user_id || 'guest' })
      .sort({ scannedAt: -1 })
      .limit(20);
    res.json({ scans });
  } catch (err) {
    res.json({ scans: [] });
  }
});

module.exports = router;
