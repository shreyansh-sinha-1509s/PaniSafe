# Pani Safe — 3-Minute Presentation & Demo Script

**Project:** Pani Safe — Groundwater Quality Screening & Decision-Support Platform  
**Event:** IBM Z Datathon 2026 (Event Code: **SSF2026**)  
**Target Deployment:** IBM LinuxONE Community Cloud (Ubuntu on s390x architecture)  

---

## ⏱️ 3-Minute Video / Judging Walkthrough Script

### **[0:00 - 0:35] Introduction: Problem & Purpose**
> *"Hello judges, welcome to **Pani Safe**, an environmental analytics and decision-support prototype built for the **IBM Z Datathon 2026**, Event Code **SSF2026**.*
> 
> *In Maharashtra, millions of rural and peri-urban citizens rely on groundwater for daily drinking needs. However, environmental monitoring data is often trapped in static government archives with missing fields and inconsistent station identifiers.*
> 
> *Pani Safe bridges this gap. It is an auditable decision-support system that screens groundwater hydrochemistry against **Bureau of Indian Standards (BIS IS 10500:2012)** benchmarks to help district hydrologists prioritize monitoring wells for qualified laboratory verification."*

---

### **[0:35 - 1:15] Truthful Data Provenance & Scientific Methodology**
> *"Let's talk about our data provenance. In strict adherence to scientific ethics and datathon requirements, Pani Safe uses an auditable, reproducible synthetic demonstration dataset generated with a fixed random seed. It models realistic groundwater hydrochemistry across all **36 districts of Maharashtra** and **1,804 unique monitoring stations**, totaling **18,249 sample events**.*
> 
> *Our screening engine enforces strict scientific principles:*
> 1. *First, **null preservation**: missing parameters remain `null` rather than being coerced to zero.*
> 2. *Second, **physical realism**: 0 mg/L TDS readings are flagged as unverified sensor defaults.*
> 3. *Third, **non-alarmist screening**: Exceeding an IS 10500 benchmark (such as pH outside 6.5–8.5 or TDS above 500 mg/L) is categorized as a 'Review Recommended' screening trigger—never a definitive claim of contamination. Official verification always requires an accredited NABL laboratory."*

---

### **[1:15 - 2:10] Platform Tour: Dashboard, GIS Map, & Explorer**
> *(Screen Recording / Live Demo)*
> 
> 1. ***Dashboard:*** *"On our Analytics Dashboard, you see instant KPIs: 18,249 samples, 1,804 stations, and 2,865 records requiring review (a 15.7% review rate). Binned histograms display parameter distributions across the state, while seasonal trends show multi-year patterns."*
> 2. ***Station Disambiguation:*** *"To eliminate duplicate village names across different talukas, every observation well is disambiguated with a compound key: District, Station Name, Latitude, and Longitude."*
> 3. ***GIS Spatial Map:*** *"Our interactive Leaflet map uses open OpenStreetMap tiles—with zero external tracking—rendering color-coded pins for fast spatial triage."*
> 4. ***Data Explorer & CSV Export:*** *"Researchers can filter by district, parameter thresholds, and station name. Clicking any record slides out our detailed parameter inspection drawer. You can also export filtered datasets to CSV with embedded provenance headers."*
> 5. ***Analyst Portal & Local Audit Trail:*** *"Analysts can log in using throwaway demo credentials to access our inspection workflow. Community notes and feedback are persisted safely in local audit files without external leakage."*

---

### **[2:10 - 2:50] IBM LinuxONE (s390x) Native Compatibility**
> *"Pani Safe was engineered from day one for the **IBM LinuxONE** mainframe architecture (`s390x`).*
> 
> *Native C/C++ bindings frequently break on non-x86 architectures. To ensure flawless execution on s390x, we utilized pure JavaScript dependencies: `bcryptjs`, Node.js native crypto, and an in-memory multi-indexed query engine that executes queries in under 5 milliseconds with zero external database compilation overhead.*
> 
> *Our automated test suite runs 19 integration tests covering the entire data pipeline, security validation, and REST API. Running `curl http://localhost:5000/api/health` directly reports our architecture (`s390x`), event code (`SSF2026`), and synthetic data provenance."*

---

### **[2:50 - 3:00] Conclusion**
> *"Pani Safe demonstrates how enterprise IBM Z mainframe performance and principled environmental data science come together to protect community drinking water. Thank you!"*

---

## 📸 Datathon Submission Evidence & Screenshot Checklist

When submitting to Hack2Skill / IBM Z Datathon 2026, capture and attach the following evidence:

- [ ] **1. LinuxONE Architecture Verification Screenshot:**
  - Terminal showing SSH connection to `linux1@<VM_IP>`.
  - Output of `uname -m` displaying `s390x`.
  - Output of `node -v` and `npm -v`.
- [ ] **2. System Telemetry & Health API JSON:**
  - `curl http://localhost:5000/api/health`
  - Showing `"eventCode": "SSF2026"`, `"architecture": "s390x"`, `"isLoaded": true`, `"totalRecordsLoaded": 18249`, `"stationsIndexed": 1804`, `"isSyntheticData": true`.
- [ ] **3. Automated Test Suite Output:**
  - Screenshot of `npm test` running `backend/test/verify.js` with all 19 tests passing (0 failures).
- [ ] **4. Analytics Dashboard:**
  - Showing KPI cards (18,249 Total Samples, 1,804 Stations, 36 Districts, 2,865 Review Signals, 95.0% Data Quality Index).
  - Binned histograms for pH and TDS.
- [ ] **5. GIS Spatial Map:**
  - Showing Maharashtra district clusters with status pins and station inspection popups.
- [ ] **6. Data Explorer & Slide-Over Drawer:**
  - Showing paginated records with composite station keys and parameter drawer open.
- [ ] **7. Alerts & Review Queue:**
  - Showing prioritized records with specific BIS IS 10500:2012 screening exceedance reasons.
- [ ] **8. Authenticated Demo Session:**
  - Header showing logged-in analyst (`Dr. Ananya Deshmukh (Demo Analyst)`).
