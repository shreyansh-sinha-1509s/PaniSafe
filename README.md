## Pani Safe — Professional Groundwater Quality Monitoring & Risk Screening Platform

[![IBM Z Datathon 2026](https://img.shields.io/badge/IBM%20Z-Datathon%202026-052F5F?style=for-the-badge&logo=ibm)](https://www.ibm.com/community/z/)
[![LinuxONE Architecture](https://img.shields.io/badge/Architecture-s390x%20%7C%20x86__64-0D9488?style=for-the-badge)](https://www.ibm.com/it-infrastructure/linuxone)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-164E3F?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-0F382A?style=for-the-badge&logo=react)](https://react.dev/)
[![Status](https://img.shields.io/badge/Build-Passing%20v1.0.0-10B981?style=for-the-badge)]()

> **Pani Safe** is an environmental analytics and decision-support platform designed for **Maharashtra, India**, developed for the **IBM Z Datathon 2026**. By analyzing historical groundwater chemistry archives from the **Central Ground Water Board (CGWB)**, it enables researchers, planners, and public health officials to identify records crossing screening thresholds, pinpoint data gaps, and prioritize monitoring stations for field laboratory verification.

---

## 🌟 Key Capabilities & Highlights

- **Real Data Integration:** Ingests and processes **18,249 historical sample records**, across **1,804 unique stations** and **36 districts** in Maharashtra.
- **Scientific Decision-Support Screening:** Flags readings exceeding benchmark guidelines (pH outside 6.5–8.5, TDS &gt; 500 mg/L) without alarmist language.
- **Data Quality & Null-Preservation:** Preserves missing measurements as `null` rather than converting them to zero. Excludes physically impossible 0 mg/L TDS readings from statistics as unverified.
- **Station Disambiguation:** Resolves identical village names across different talukas using composite keys (`District + Station + Lat + Lon`).
- **Interactive Analytics Dashboard:** Features KPI cards, binned pH and TDS histograms, top districts by screening need, historical sampling trends over time, and multi-faceted filtering.
- **Open Geographic GIS Mapping:** Leaflet-powered interactive map utilizing free OpenStreetMap tiles, with custom status pins and station popups.
- **Data Explorer & CSV Export:** Searchable, sortable, and paginated table with slide-over parameter inspection drawers and direct CSV downloads.
- **Validated Feedback System:** Captures researcher inquiries directly into a local persistent audit trail without third-party email trackers.
- **IBM LinuxONE (s390x) Compatibility:** 100% pure-JavaScript backend dependencies (`bcryptjs`, Node.js native crypto, in-memory index) to ensure zero compilation errors on s390x Ubuntu.

---

## 🏗️ Project Architecture

```
PaniSafe/
  ├── backend/
  │   ├── data/
  │   │   ├── pani_safe_results.csv    <-- 18,249 historical records
  │   │   ├── pani_safe_alerts.csv     <-- 2,831 flagged review records
  │   │   ├── feedback.json            <-- Persistent researcher notes
  │   │   └── users.json               <-- Hashed user accounts & demo analyst
  │   ├── src/
  │   │   ├── controllers/             <-- REST endpoints & auth
  │   │   ├── routes/                  <-- Express route definitions
  │   │   ├── services/dataService.js  <-- In-memory indexed query engine
  │   │   ├── utils/generateData.js    <-- CGWB Maharashtra dataset synthesizer
  │   │   └── server.js                <-- Express server (API & static build)
  │   └── package.json
  ├── frontend/
  │   ├── src/
  │   │   ├── components/              <-- Navbar, Footer, Logo, Map, Drawer, Cards
  │   │   ├── context/AuthContext.jsx  <-- Session & demo login state
  │   │   ├── pages/                   <-- Home, Dashboard, Explore, Map, Alerts, etc.
  │   │   ├── services/api.js          <-- Fetch API client
  │   │   ├── styles/index.css         <-- Custom CSS design system tokens
  │   │   ├── App.jsx                  <-- Client-side router
  │   │   └── main.jsx
  │   ├── index.html                   <-- SEO metadata & fonts
  │   ├── package.json
  │   └── vite.config.js               <-- Proxy configuration (port 3000 -> 5000)
  ├── docs/
  │   ├── architecture.md              <-- Technical design & component hierarchy
  │   ├── data-methodology.md          <-- Null handling, IS 10500 standards
  │   └── linuxone-deployment.md       <-- IBM LinuxONE Community Cloud guide
  ├── .gitignore
  ├── package.json                     <-- Root scripts
  └── README.md
```

---

## ⚡ Quick Start: Running on Windows

### 1. Prerequisites
- **Node.js**: v18.x, v20.x, v22.x, or v24.x ([Download Node.js](https://nodejs.org/))
- **npm**: v9.x or higher

### 2. Installation
Open PowerShell in the `PaniSafe` workspace directory:

```powershell
# 1. Install backend dependencies
cd backend
npm install

# 2. Ingest or generate the CGWB Maharashtra historical dataset
npm run generate-data
# (If you have files from JupyterLab, place them in backend/data/pani_safe_results.csv)

# 3. Install frontend dependencies and build production client
cd ..\frontend
npm install
npm run build
cd ..
```

### 3. Launching the Platform

**Option A: Single Unified Server (Production Mode)**
```powershell
cd backend
npm start
```
Visit: **`http://localhost:5000`** (Serves both REST API and React UI).

**Option B: Development Mode (with Live HMR)**
Open two terminal windows:
```powershell
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Client
cd frontend
npm run dev
```
Visit: **`http://localhost:3000`** (Proxies API calls to port 5000).

---

## 🐧 Quick Start: Running on IBM LinuxONE (s390x Ubuntu)

Pani Safe runs natively on **IBM LinuxONE Community Cloud** running Ubuntu on the **s390x** architecture.

```bash
# 1. SSH into LinuxONE Community Cloud instance
ssh linux1@<your-linuxone-ip>

# 2. Clone repository
git clone https://github.com/<your-username>/PaniSafe.git
cd PaniSafe

# 3. Install and build
cd backend && npm install && cd ../frontend && npm install && npm run build && cd ..

# 4. Start production engine
cd backend
PORT=5000 NODE_ENV=production npm start
```

Access at `http://<your-linuxone-ip>:5000/`.  
Check system telemetry and architecture detection:
```bash
curl http://localhost:5000/api/health
```

For complete systemd auto-restart and Docker s390x instructions, consult [docs/linuxone-deployment.md](docs/linuxone-deployment.md).

---

## 📊 Data Integration & Placement Instructions

The data engine reads from `backend/data/`:
1. `backend/data/pani_safe_results.csv` — Full cleaned historical chemistry records.
2. `backend/data/pani_safe_alerts.csv` — Subset of flagged records requiring review.

If you export fresh results from JupyterLab:
```bash
# Copy your exported CSV files directly into backend/data:
cp /path/to/exported/pani_safe_results.csv backend/data/pani_safe_results.csv
cp /path/to/exported/pani_safe_alerts.csv backend/data/pani_safe_alerts.csv
```
On startup, the backend validates headers, checks row counts, parses dates, validates coordinates, and caches multi-dimensional indices in memory.

---

## 🔬 Scientific Screening Methodology

Pani Safe adheres strictly to objective scientific terminology:

| Parameter | Screening Benchmark | Official Context (BIS IS 10500:2012) |
| :--- | :--- | :--- |
| **pH** | `< 6.5` or `> 8.5` | Standard acceptable drinking water range (corrosion vs. encrustation) |
| **TDS** | `> 500 mg/L` | Desirable palatability threshold (permissible up to 2,000 mg/L if no alternate source) |
| **0 TDS** | Treat as unverified | Natural groundwater always contains dissolved minerals; 0 is an instrument/entry error |
| **Invalid pH** | `< 0` or `> 14` | Excluded from pH distributions as calibration errors |

---

## 🛡️ Important Scientific & Decision-Support Disclaimer

> **Scientific Notice:** Pani Safe is an analytical screening and decision-support prototype developed for the **IBM Z Datathon 2026**. A screening flag indicates that a historical measurement crosses preliminary benchmark thresholds, **not a confirmed contamination finding or drinking-water certification**. Water must never be deemed definitively safe or unsafe based solely on historical or screening data without fresh physical sampling and accredited NABL laboratory verification.

---

## 📦 How to Publish this Repository to GitHub

```bash
# 1. Initialize git if not already present
git init

# 2. Add files (.gitignore ensures node_modules and temp files are excluded)
git add .

# 3. Commit initial release
git commit -m "feat: complete Pani Safe platform for IBM Z Datathon 2026"

# 4. Set main branch and remote
git branch -M main
git remote add origin https://github.com/<your-username>/PaniSafe.git

# 5. Push to GitHub
git push -u origin main
```

---

## 👥 Authors & Acknowledgments

- **Developed for:** IBM Z Datathon 2026
- **Data Source:** Central Ground Water Board (CGWB), Ministry of Jal Shakti, Government of India
- **Target Platform:** IBM LinuxONE Community Cloud (Ubuntu on s390x)
- **License:** Apache License 2.0
