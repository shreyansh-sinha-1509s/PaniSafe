# Pani Safe — Groundwater Quality Screening & Decision-Support Platform

[![IBM Z Datathon 2026](https://img.shields.io/badge/IBM%20Z%20Datathon-2026%20(Event%20Code:%20SSF2026)-052F5F?style=for-the-badge&logo=ibm)](https://www.ibm.com/community/z/)
[![LinuxONE Architecture](https://img.shields.io/badge/Architecture-s390x%20%7C%20x86__64%20%7C%20arm64-0D9488?style=for-the-badge)](https://www.ibm.com/it-infrastructure/linuxone)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-164E3F?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-0F382A?style=for-the-badge&logo=react)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passed%20%7C%200%20Failed-10B981?style=for-the-badge)]()
[![Data Provenance](https://img.shields.io/badge/Data%20Provenance-Deterministic%20Synthetic%20Demo-F59E0B?style=for-the-badge)]()

> **Pani Safe** is an environmental analytics and decision-support prototype designed for **Maharashtra, India**, developed for the **IBM Z Datathon 2026 (Event Code: SSF2026)**. By evaluating hydrochemical parameters against **Bureau of Indian Standards (BIS IS 10500:2012)** drinking water screening thresholds, Pani Safe assists environmental researchers, hydrologists, and public health planners in identifying monitoring stations that require qualified human review and accredited laboratory verification.

---

## 🔬 Critical Data Provenance & Scientific Notice

### 1. Data Provenance: Synthetic Demonstration Dataset (Option B)
To ensure complete scientific integrity and transparency:
- The **18,249 sample records** in this repository represent a **reproducible synthetic demonstration dataset** generated using a fixed-seed PRNG (Mulberry32, seed `20260427`).
- The dataset models realistic Maharashtra groundwater hydrochemistry across all **36 administrative districts** and **1,804 unique monitoring stations**, reflecting seasonal pre-monsoon and post-monsoon distributions and regional mineral characteristics.
- **Why Synthetic Data?** Publicly accessible Central Ground Water Board (CGWB) micro-level datasets lacked verifiable open licensing and traceable coordinate-level provenance within the datathon workspace. Rather than misrepresenting synthetic records as raw physical CGWB sensor data, all records are explicitly tagged as `SYNTHETIC_DEMO` across the database, API telemetry, user interface, Leaflet maps, and CSV exports.

### 2. Screening Decision Support vs. Drinking Water Certification
- **Screening Flag ≠ Confirmed Contamination:** A screening flag indicates that a sample value exceeds an initial benchmark threshold. It is **not** proof of toxicity or contamination.
- **Decision Support:** Flags serve as prioritization signals for district hydrologists to deploy field teams for duplicate sampling and chain-of-custody laboratory testing.
- **Accredited Verification Required:** Definitive water safety assessments require physical testing in an accredited NABL facility, including biological pathogens (total coliform / E. coli) and heavy metals (arsenic, lead, mercury).

---

## 📊 Recalculated Dataset Metrics

All metrics reflect exact figures from the reproducible dataset (`seed: 20260427`):

| Metric | Exact Count / Measurement | Methodological Context |
| :--- | :--- | :--- |
| **Total Sample Events** | **18,249** | Multi-year seasonal screening events |
| **Unique Monitoring Stations** | **1,804** | Indexed via composite keys to resolve duplicate village names |
| **Districts Covered** | **36** | Complete administrative coverage of Maharashtra |
| **Review Signals (`needsReviewCount`)** | **2,865 (15.7%)** | Total records crossing at least one screening benchmark |
| **pH Benchmark Exceedances** | **1,122 (6.4%)** | Samples with valid pH outside acceptable range 6.5–8.5 |
| **TDS Desirable Benchmark Exceedances** | **2,223 (13.0%)** | Samples with valid TDS &gt; 500 mg/L (desirable palatability limit) |
| **Dual-Exceedance Signals** | **480 (2.6%)** | Samples exceeding both pH and TDS thresholds simultaneously |
| **Within Screening Limits** | **15,384 (84.3%)** | Samples meeting initial screening criteria |
| **Valid pH Readings** | **17,569 (96.3%)** | 680 missing values (3.7%) preserved as `null` |
| **Usable TDS Readings** | **17,113 (93.8%)** | 1,136 missing/unverified values (6.2%), including `0 mg/L` sensor defaults |
| **Data Quality Index** | **95.0%** | Overall parameter completeness across reported fields |

---

## 🏛️ Standards Alignment: BIS IS 10500:2012

Pani Safe references the **Bureau of Indian Standards (BIS IS 10500:2012 Drinking Water Specification)**:

| Parameter | Acceptable / Desirable Limit | Permissible Limit in Absence of Alternate Source | Screening Action in Pani Safe |
| :--- | :--- | :--- | :--- |
| **pH Value** | **6.5 – 8.5** | **No relaxation** | Flagged when `< 6.5` (corrosion risk) or `> 8.5` (encrustation risk). Values outside `0–14` are excluded as sensor errors. |
| **Total Dissolved Solids (TDS)** | **500 mg/L** | **2,000 mg/L** | Flagged as "Review Recommended" above 500 mg/L. Natural water always contains dissolved minerals; readings of `0.0 mg/L` are treated as unverified sensor defaults. |

---

## 🏗️ System Architecture

```
PaniSafe/
  ├── backend/
  │   ├── data/
  │   │   ├── pani_safe_results.csv    <-- 18,249 synthetic demo records (seed 20260427)
  │   │   ├── pani_safe_alerts.csv     <-- 2,865 review queue records
  │   │   ├── feedback.json            <-- Persistent local researcher feedback audit trail
  │   │   └── users.json               <-- Demo analyst account (bcrypt hashed)
  │   ├── src/
  │   │   ├── controllers/             <-- API controllers & JWT auth
  │   │   ├── routes/                  <-- Express route definitions
  │   │   ├── services/dataService.js  <-- In-memory multi-indexed query engine (sub-5ms)
  │   │   ├── utils/generateData.js    <-- Deterministic seeded data synthesizer
  │   │   └── server.js                <-- Express server (API & static client delivery)
  │   ├── test/
  │   │   └── verify.js                <-- 19 automated integration tests
  │   └── package.json
  ├── frontend/
  │   ├── src/
  │   │   ├── components/              <-- Navbar, Footer, LeafletMap, RecordDrawer, MetricCard
  │   │   ├── context/AuthContext.jsx  <-- Analyst session state & demo login
  │   │   ├── pages/                   <-- Home, Dashboard, Explore, Map, Alerts, Methodology, About, Contact
  │   │   ├── services/api.js          <-- Configurable REST API client
  │   │   ├── styles/index.css         <-- Custom CSS design system tokens
  │   │   ├── App.jsx                  <-- Client router
  │   │   └── main.jsx
  │   ├── index.html                   <-- SEO metadata & OpenGraph tags
  │   ├── package.json
  │   └── vite.config.js               <-- Build configuration with isolated PostCSS
  ├── docs/
  │   ├── architecture.md              <-- Technical architecture specification
  │   ├── data-methodology.md          <-- Data cleaning rules, null handling & IS 10500
  │   ├── linuxone-deployment.md       <-- IBM LinuxONE Community Cloud (s390x) guide
  │   └── demo-script.md               <-- 3-minute video/judging presentation script
  ├── package.json                     <-- Root workspace scripts
  └── README.md
```

---

## 🌟 Key Features

1. **Deterministic Reproducibility:** Data generation is 100% reproducible via Mulberry32 PRNG (`npm run generate-data`).
2. **Null-Preserving Data Engine:** Blank readings remain `null`; never coerced to zero. Data completeness is explicitly measured.
3. **Station Disambiguation:** Resolves identical village names across different talukas using composite keys: `${District}_${StationName}_${Latitude}_${Longitude}`.
4. **Interactive Dashboard:** Binned pH and TDS histograms, seasonal sampling timeline, top districts by screening need, and dynamic multi-criteria filtering.
5. **GIS Spatial Map:** Leaflet + OpenStreetMap engine rendering color-coded station pins and contextual inspection popups.
6. **Data Explorer & CSV Export:** Searchable, sortable, paginated table with slide-over parameter drawer and streaming CSV export with provenance notices.
7. **IBM LinuxONE (s390x) Portability:** Built exclusively with pure-JavaScript dependencies (`bcryptjs`, native crypto, in-memory index) to ensure zero compilation or gyp errors on s390x enterprise Linux.
8. **Secure Local Persistence:** Feedback and throwaway demo accounts are persisted locally in audit files without transmitting sensitive data to external trackers.

---

## ⚡ Quick Start: Local Development (Windows / macOS / Linux)

### 1. Prerequisites
- **Node.js**: v18.x, v20.x, v22.x, or v24.x
- **npm**: v9.x or higher

### 2. Install & Build
```bash
# Clone the repository
git clone https://github.com/shreyansh-sinha-1509s/PaniSafe.git
cd PaniSafe

# Install dependencies (root, backend, and frontend)
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..

# Compile production frontend bundle
npm run build
```

### 3. Run Automated Integration Tests
```bash
npm test
```
*Executes 19 end-to-end tests verifying the data service, API endpoints, IS 10500 metadata, CSV export, feedback validation, and auth.*

### 4. Start the Application

**Option A: Single Unified Production Server (Recommended)**
```bash
npm start
```
- Serves both REST API and React UI at: **`http://localhost:5000`**
- Check system telemetry: **`http://localhost:5000/api/health`**

**Option B: Concurrent Development Mode (Live HMR)**
```bash
npm run dev
```
- Frontend client: **`http://localhost:3000`** (proxies API calls to port 5000)
- Backend API: **`http://localhost:5000`**

### 5. Demo Analyst Credentials
To inspect the authenticated analyst view:
- **Email:** `analyst.demo@panisafe.in`
- **Password:** `DemoAnalyst2026!`
*(Throwaway demo account; password hashed with bcrypt)*

---

## 🐧 IBM LinuxONE Community Cloud Deployment (s390x)

Pani Safe is designed to deploy natively on **IBM LinuxONE Community Cloud** running Ubuntu on the **s390x** mainframe architecture.

### Step 1: Connect to LinuxONE Instance via SSH Tunnel
To keep the application bound securely to loopback on the VM while allowing evaluation from your local browser, establish an SSH tunnel:

```bash
# Replace with your LinuxONE VM username and IP address:
ssh -L 5000:localhost:5000 -i <path-to-private-key> linux1@<LINUXONE_VM_IP>
```

### Step 2: Verify Architecture
```bash
uname -m
# Output MUST report: s390x
```

### Step 3: Clone, Build & Run
```bash
git clone https://github.com/shreyansh-sinha-1509s/PaniSafe.git
cd PaniSafe
npm install
cd backend && npm install && cd ../frontend && npm install && npm run build && cd ..

# Start the unified server bound to loopback:
cd backend
PORT=5000 NODE_ENV=production npm start
```

### Step 4: Verify Telemetry on LinuxONE
In a second terminal on the VM (or via the SSH tunnel locally):
```bash
curl http://localhost:5000/api/health
```

Expected JSON response confirming LinuxONE execution:
```json
{
  "status": "healthy",
  "eventCode": "SSF2026",
  "system": {
    "platform": "linux",
    "architecture": "s390x",
    "nodeVersion": "v20.x.x"
  },
  "dataEngine": {
    "isLoaded": true,
    "totalRecordsLoaded": 18249,
    "stationsIndexed": 1804,
    "districtsCovered": 36,
    "isSyntheticData": true
  }
}
```

View the platform at `http://localhost:5000` through your local browser via the SSH tunnel.

---

## 📋 Automated Test Coverage

The test suite in [`backend/test/verify.js`](file:///c:/Users/essak/Downloads/PaniSafe-main/backend/test/verify.js) validates:
1. Deterministic metric calculation (18,249 records, 1,804 stations, 36 districts, 2,865 alerts)
2. HTTP server initialization on ephemeral test ports
3. Telemetry response including event code `SSF2026` and `isSyntheticData: true`
4. Statistical summary and histogram binning
5. Multi-faceted query filtering, search, and pagination
6. Single record retrieval by identifier
7. District-level aggregations
8. Station GIS indexing and coordinate boundary validation
9. Station chronological timeline and history
10. Alert queue sorting and priority categorization
11. Multi-year sampling trend aggregations
12. BIS IS 10500:2012 metadata endpoint alignment
13. CSV export streaming with synthetic provenance disclaimer headers
14. Feedback form input sanitization and persistence
15. Feedback email format validation
16. Demo analyst authentication and JWT generation
17. Static frontend bundle serving from Express root

---

## 👥 Authors & Acknowledgments

- **Developed for:** IBM Z Datathon 2026 (Event Code: **SSF2026**)
- **Target Platform:** IBM LinuxONE Community Cloud (Ubuntu on s390x)
- **Standard Reference:** Bureau of Indian Standards (BIS IS 10500:2012 Drinking Water Specification)
- **License:** Apache License 2.0
