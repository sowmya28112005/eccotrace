# ♻️ EcoTrace — E-Waste Recycling Tracker

> Scan, track, and recycle your electronic waste responsibly. Earn eco points, find certified recycling centers near you, and make a real environmental impact.

---

## 🌍 About

**EcoTrace** is a full-stack web application that helps users responsibly dispose of electronic waste (e-waste). Users can scan their old devices, find nearby certified recycling centers, schedule drop-offs or doorstep pickups, and track their environmental impact — all while earning Eco Points redeemable for real-world rewards.

E-waste is the fastest-growing waste stream globally. EcoTrace makes it easy for everyday people to do the right thing.

---

## ✨ Features

### 🔍 Device Scanner
- Scan or manually log old electronic devices
- Supports smartphones, laptops, tablets, monitors, TVs, batteries, and more
- Instant CO₂, energy, water, and gold recovery estimates per device

### 🗺️ Recycling Centers Map
- 12 certified recycling centers across Hyderabad
- Filter by: Open Now, Free Drop-off, Certified
- Search by name or area
- "Near Me" — sorts centers by real GPS distance
- Interactive map with pin markers
- One-click Google Maps directions

### 📅 Schedule Drop-off / Pickup
- Book a self drop-off or doorstep pickup at any center
- Choose date and time slot
- Select devices to recycle
- Instant booking confirmation with reference ID
- Live progress tracking (Booked → Confirmed → En Route → Done)

### 📊 Personal Dashboard
- Per-user data — each login sees only their own stats
- Eco Points earned from scans and completed bookings
- CO₂ prevented, energy recovered, water saved, gold recovered
- Recycling activity bar chart (Week / Month / Year)
- Impact score ring
- Community leaderboard
- Rewards system (Store Discount, Free Pickup, Plant a Tree, Eco Champion Badge)

### 👤 Auth System
- User registration and login
- JWT-based authentication
- Per-user data scoping in localStorage
- Persistent data across sessions

### 🎨 UI / UX
- Light & Dark mode
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Toast notifications
- Confetti on booking success

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Fonts | Syne + Inter (Google Fonts) |
| Maps | Google Maps Directions API |
| File Uploads | Multer |

---

## 📁 Project Structure


eccotrace/
│
├── public/                 # Frontend HTML pages
│   ├── index.html          # Landing / home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── scan.html           # Device scanner
│   ├── centers.html        # Recycling centers map
│   ├── dashboard.html      # User dashboard
│   └── tm-detect.js        # Device detection helper
│
├── routes/                 # Express API routes
│   ├── user.js             # Auth: register, login, stats
│   ├── centers.js          # Centers list + schedule booking
│   └── scan.js             # Device scan + history
│
├── models/                 # MongoDB schemas
│   ├── user.js             # User model
│   └── scan.js             # Scan/device model
│
├── uploads/                # Uploaded scan images
├── .env                    # Environment variables (not committed)
├── server.js               # Express app entry point
├── package.json
└── README.md


---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the repo
'''
git clone https://github.com/sowmya28112005/eccotrace.git
cd eccotrace


### 2. Install dependencies
```bash
npm install

### 3. Set up environment variables
Create a `.env` file in the root:
env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecotrace
JWT_SECRET=your_super_secret_key_here


### 4. Start the server
bash
node server.js
# or with auto-restart:
npx nodemon server.js


### 5. Open in browser
```
http://localhost:3000/public/index.html
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | Login, returns JWT + name |
| GET | `/api/user/stats` | Get user stats |

### Centers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/centers` | Get all centers |
| GET | `/api/centers?lat=17.4&lng=78.4` | Get centers sorted by distance |
| POST | `/api/centers/schedule` | Book a drop-off / pickup |

### Scans
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan` | Log a new device scan |
| GET | `/api/scan/history` | Get scan history |

---

## 📊 Environmental Impact Calculations

EcoTrace estimates the environmental benefit of recycling each device type:

| Device | CO₂ Prevented | Energy Recovered | Water Saved | Gold Recovered |
|---|---|---|---|---|
| Smartphone | 70 kg | 180 kWh | 12 L | 0.03g |
| Laptop | 156 kg | 320 kWh | 85 L | 0.50g |
| Monitor | 450 kg | 600 kWh | 250 L | 0.20g |
| TV | 350 kg | 500 kWh | 180 L | 0.15g |
| Tablet | 90 kg | 220 kWh | 35 L | 0.08g |
| Battery | 5 kg | 12 kWh | 5 L | 0.002g |

---

## 🏆 Eco Points System

| Device | Points Earned |
|---|---|
| Smartphone | 50 pts |
| Laptop | 100 pts |
| Monitor | 150 pts |
| Printer | 120 pts |
| TV | 130 pts |
| Tablet | 70 pts |

**Rewards you can redeem:**
- 🏷️ 200 pts → 10% discount at partner stores
- 🚚 500 pts → Free doorstep pickup
- 🌳 300 pts → Plant a tree in your name
- 🎖️ 1,500 pts → Eco Champion Badge

---

## 🗺️ Recycling Centers (Hyderabad)

| # | Center | Area | Type | Free |
|---|---|---|---|---|
| 1 | GreenCycle Hub | MG Road, Secunderabad | Certified | ✅ |
| 2 | EcoRecycle Center | Jubilee Hills | Government | ✅ |
| 3 | Tech Disposal Unit | HITEC City | Corporate | ❌ |
| 4 | E-Waste Pickup Point | Banjara Hills | Collection Point | ✅ |
| 5 | Recykal Smart Bin | Gachibowli | Smart Bin | ✅ |
| 6 | Attero Recycling | Kompally | Certified | ✅ |
| 7 | CleanEarth Solutions | Kukatpally | Drop-off | ✅ |
| 8 | Zero Waste Hub | Ameerpet | Community | ✅ |
| 9 | PlanetSave Recyclers | Dilsukhnagar | Municipal | ✅ |
| 10 | EcoVerde E-Waste | LB Nagar | Certified | ❌ |
| 11 | TechGreen Disposal | Uppal | Corporate | ❌ |
| 12 | Hasiru Dala Point | Mehdipatnam | Certified | ✅ |

---

## 🔒 Security Notes

Make sure your `.gitignore` includes:
```
node_modules/
.env
uploads/
*.log
```

Never commit your `.env` file — it contains your database URI and JWT secret.



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'add: your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👩‍💻 Author

**Sowmya** — [@sowmya28112005](https://github.com/sowmya28112005)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <strong>🌱 Every device recycled is a step towards a cleaner planet.</strong><br/>
  Made with ♻️ and 💚 for a sustainable future.
</div>
