const express = require('express');
const router  = express.Router();

const CENTERS = [
  { id:1, name:'GreenCycle Hub', address:'MG Road, Hyderabad', phone:'+91 98765 43210', rating:4.8, type:'Certified Facility', certified:true, free:true,  hours:'Mon–Sat: 9AM–6PM', open:true,  accepts:['Phones','Laptops','Tablets','Batteries'], lat:17.4374, lng:78.4487, distance:'1.2 km' },
  { id:2, name:'E-Waste Solutions', address:'Banjara Hills, Hyderabad', phone:'+91 91234 56789', rating:4.5, type:'Drop-off Center', certified:true, free:true,  hours:'Mon–Fri: 8AM–7PM', open:true,  accepts:['All Electronics'], lat:17.4126, lng:78.4482, distance:'2.5 km' },
  { id:3, name:'TechRecycle Pro', address:'Hitech City, Hyderabad', phone:'+91 99887 65432', rating:4.9, type:'Premium Facility', certified:true, free:false, hours:'Mon–Sun: 7AM–9PM', open:true,  accepts:['Phones','Computers','Monitors'], lat:17.4435, lng:78.3772, distance:'3.1 km' },
  { id:4, name:'EcoSmart Recyclers', address:'Secunderabad, Hyderabad', phone:'+91 88776 55443', rating:4.3, type:'Community Center', certified:false,free:true,  hours:'Sat–Sun: 10AM–4PM', open:false, accepts:['Small Electronics'], lat:17.4399, lng:78.4983, distance:'4.7 km' },
  { id:5, name:'GreenTech Disposal', address:'Gachibowli, Hyderabad', phone:'+91 77665 44332', rating:4.6, type:'Corporate Facility', certified:true, free:false, hours:'Mon–Fri: 9AM–5PM', open:true,  accepts:['Bulk Electronics','IT Assets'], lat:17.4401, lng:78.3489, distance:'5.3 km' },
  { id:6, name:'CityGreen E-Waste', address:'Ameerpet, Hyderabad', phone:'+91 66554 33221', rating:4.1, type:'Municipal Center', certified:true, free:true,  hours:'Mon–Sat: 8AM–6PM', open:true,  accepts:['All Electronics','Appliances'], lat:17.4374, lng:78.4487, distance:'6.8 km' }
];

// GET /api/centers
router.get('/', (req, res) => {
  res.json({ centers: CENTERS });
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
