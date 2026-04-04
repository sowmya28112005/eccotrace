const express = require('express');
const router  = express.Router();

const CENTERS = [
  {
    id: 1,
    name: 'GreenCycle Hub',
    address: 'MG Road, Secunderabad, Hyderabad',
    phone: '+91 98765 43210',
    rating: 4.8,
    type: 'Certified Facility',
    certified: true,
    free: true,
    hours: 'Mon–Sat: 9AM–6PM',
    open: true,
    accepts: ['Phones', 'Laptops', 'Batteries', 'Monitors'],
    lat: 17.4374,
    lng: 78.4987
  },
  {
    id: 2,
    name: 'EcoRecycle Center',
    address: 'Jubilee Hills, Road No. 36, Hyderabad',
    phone: '+91 87654 32109',
    rating: 4.5,
    type: 'Government Facility',
    certified: true,
    free: true,
    hours: 'Mon–Fri: 10AM–5PM',
    open: true,
    accepts: ['All Electronics', 'Batteries', 'Cables'],
    lat: 17.4311,
    lng: 78.4054
  },
  {
    id: 3,
    name: 'Tech Disposal Unit',
    address: 'HITEC City, Madhapur, Hyderabad',
    phone: '+91 76543 21098',
    rating: 4.2,
    type: 'Corporate Facility',
    certified: true,
    free: false,
    hours: 'Mon–Sat: 8AM–8PM',
    open: true,
    accepts: ['Laptops', 'Servers', 'Printers', 'Phones'],
    lat: 17.4474,
    lng: 78.3762
  },
  {
    id: 4,
    name: 'E-Waste Pickup Point',
    address: 'Banjara Hills, Road No. 12, Hyderabad',
    phone: '+91 65432 10987',
    rating: 4.0,
    type: 'Collection Point',
    certified: false,
    free: true,
    hours: 'Tue–Sun: 11AM–7PM',
    open: false,
    accepts: ['Small Electronics', 'Chargers', 'Batteries'],
    lat: 17.4129,
    lng: 78.4498
  },
  {
    id: 5,
    name: 'Recykal Smart Bin',
    address: 'Gachibowli, Financial District, Hyderabad',
    phone: '+91 54321 09876',
    rating: 4.6,
    type: 'Smart Bin',
    certified: true,
    free: true,
    hours: '24/7 Drop-off',
    open: true,
    accepts: ['Phones', 'Tablets', 'Chargers', 'Earphones'],
    lat: 17.4416,
    lng: 78.3486
  },
  {
    id: 6,
    name: 'Attero Recycling',
    address: 'Kompally, Medchal Road, Hyderabad',
    phone: '+91 43210 98765',
    rating: 4.7,
    type: 'Certified Facility',
    certified: true,
    free: true,
    hours: 'Mon–Sat: 9AM–5PM',
    open: false,
    accepts: ['All E-Waste', 'Industrial Electronics'],
    lat: 17.5418,
    lng: 78.4859
  },
  {
    id: 7,
    name: 'CleanEarth Solutions',
    address: 'Kukatpally, KPHB Colony, Hyderabad',
    phone: '+91 91234 56781',
    rating: 4.4,
    type: 'Drop-off Center',
    certified: true,
    free: true,
    hours: 'Mon–Sat: 8AM–7PM',
    open: true,
    accepts: ['Phones', 'Laptops', 'TVs', 'Monitors', 'Printers'],
    lat: 17.4849,
    lng: 78.3996
  },
  {
    id: 8,
    name: 'Zero Waste Hub',
    address: 'Ameerpet, SR Nagar, Hyderabad',
    phone: '+91 80123 45678',
    rating: 4.3,
    type: 'Community Center',
    certified: false,
    free: true,
    hours: 'Mon–Sun: 9AM–8PM',
    open: true,
    accepts: ['Small Electronics', 'Chargers', 'Batteries', 'Cables'],
    lat: 17.4374,
    lng: 78.4487
  },
  {
    id: 9,
    name: 'PlanetSave Recyclers',
    address: 'Dilsukhnagar, Moosarambagh, Hyderabad',
    phone: '+91 99887 11223',
    rating: 4.1,
    type: 'Municipal Center',
    certified: true,
    free: true,
    hours: 'Tue–Sun: 10AM–6PM',
    open: false,
    accepts: ['All Electronics', 'Appliances', 'Batteries'],
    lat: 17.3688,
    lng: 78.5247
  },
  {
    id: 10,
    name: 'EcoVerde E-Waste',
    address: 'LB Nagar, Saroornagar, Hyderabad',
    phone: '+91 77889 90011',
    rating: 4.5,
    type: 'Certified Facility',
    certified: true,
    free: false,
    hours: 'Mon–Sat: 9AM–6PM',
    open: true,
    accepts: ['Phones', 'Laptops', 'Tablets', 'Headphones'],
    lat: 17.3469,
    lng: 78.5487
  },
  {
    id: 11,
    name: 'TechGreen Disposal',
    address: 'Uppal, Industrial Area, Hyderabad',
    phone: '+91 66778 89900',
    rating: 4.6,
    type: 'Corporate Facility',
    certified: true,
    free: false,
    hours: 'Mon–Fri: 8AM–5PM',
    open: true,
    accepts: ['Bulk Electronics', 'IT Assets', 'Servers', 'Printers'],
    lat: 17.4042,
    lng: 78.5597
  },
  {
    id: 12,
    name: 'Hasiru Dala Point',
    address: 'Mehdipatnam, Rethibowli, Hyderabad',
    phone: '+91 55667 78899',
    rating: 4.9,
    type: 'Certified Facility',
    certified: true,
    free: true,
    hours: 'Mon–Sun: 7AM–9PM',
    open: true,
    accepts: ['All E-Waste', 'Phones', 'Laptops', 'Appliances', 'Batteries'],
    lat: 17.3952,
    lng: 78.4383
  }
];

// Calculate haversine distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/centers?lat=17.43&lng=78.44
router.get('/', (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  let centers = CENTERS.map(c => ({ ...c }));

  if (!isNaN(userLat) && !isNaN(userLng)) {
    centers = centers
      .map(c => ({
        ...c,
        distance: getDistance(userLat, userLng, c.lat, c.lng).toFixed(1) + ' km'
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  res.json({ centers, total: centers.length });
});

// POST /api/centers/schedule
router.post('/schedule', async (req, res) => {
  try {
    const booking = {
      ref: 'ECO-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      ...req.body,
      createdAt: new Date()
    };
    console.log('New booking:', booking.ref, '|', booking.center_name, '|', booking.name);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;