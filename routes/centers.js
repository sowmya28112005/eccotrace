const express = require('express');
const router  = express.Router();

const CENTERS = [
  { id:1, name:'GreenCycle Hub', address:'MG Road, Hyderabad', phone:'+91 98765 43210', rating:4.8, type:'Certified Facility', certified:true, free:true,  hours:'Mon–Sat: 9AM–6PM', open:true,  accepts:['Phones','Laptops','Tablets','Batteries'], lat:17.4374, lng:78.4487 },
  { id:2, name:'E-Waste Solutions', address:'Banjara Hills, Hyderabad', phone:'+91 91234 56789', rating:4.5, type:'Drop-off Center', certified:true, free:true,  hours:'Mon–Fri: 8AM–7PM', open:true,  accepts:['All Electronics'], lat:17.4126, lng:78.4482 },
  { id:3, name:'TechRecycle Pro', address:'Hitech City, Hyderabad', phone:'+91 99887 65432', rating:4.9, type:'Premium Facility', certified:true, free:false, hours:'Mon–Sun: 7AM–9PM', open:true,  accepts:['Phones','Computers','Monitors'], lat:17.4435, lng:78.3772 },
  { id:4, name:'EcoSmart Recyclers', address:'Secunderabad, Hyderabad', phone:'+91 88776 55443', rating:4.3, type:'Community Center', certified:false,free:true,  hours:'Sat–Sun: 10AM–4PM', open:false, accepts:['Small Electronics'], lat:17.4399, lng:78.4983 },
  { id:5, name:'GreenTech Disposal', address:'Gachibowli, Hyderabad', phone:'+91 77665 44332', rating:4.6, type:'Corporate Facility', certified:true, free:false, hours:'Mon–Fri: 9AM–5PM', open:true,  accepts:['Bulk Electronics','IT Assets'], lat:17.4401, lng:78.3489 },
  { id:6, name:'CityGreen E-Waste', address:'Ameerpet, Hyderabad', phone:'+91 66554 33221', rating:4.1, type:'Municipal Center', certified:true, free:true,  hours:'Mon–Sat: 8AM–6PM', open:true,  accepts:['All Electronics','Appliances'], lat:17.4374, lng:78.4487 }
];

// ── Calculate distance between two coordinates (km) ──
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// GET /api/centers?lat=17.43&lng=78.44
router.get('/', (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  let centers = CENTERS.map(c => ({ ...c }));

  // If user location provided, calculate real distances
  if (!isNaN(userLat) && !isNaN(userLng)) {
    centers = centers
      .map(c => ({
        ...c,
        distance: getDistance(userLat, userLng, c.lat, c.lng).toFixed(1) + ' km'
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  res.json({ centers });
});

// POST /api/centers/schedule
router.post('/schedule', async (req, res) => {
  try {
    const booking = {
      ref:       'ECO-' + Math.random().toString(36).substr(2,6).toUpperCase(),
      ...req.body,
      createdAt: new Date()
    };
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;