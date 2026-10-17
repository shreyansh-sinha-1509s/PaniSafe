# Pani Safe — Data Provenance, Methodology & Screening Standards

**Event:** IBM Z Datathon 2026 (Event Code: **SSF2026**)  
**Focus Area:** Groundwater Chemistry Screening & Decision Support for Maharashtra, India  
**Target Architecture:** IBM LinuxONE Community Cloud (s390x) & Linux/macOS/Windows  
**Screening Standard Reference:** Bureau of Indian Standards (BIS IS 10500:2012 — Drinking Water Specification)  

---

## 1. Data Provenance: Synthetic Demonstration Dataset (Option B)

### Background & Scientific Transparency
During project preparation for the IBM Z Datathon 2026, groundwater monitoring archives from the Central Ground Water Board (CGWB) were surveyed. However, because verifiable open-license, coordinate-accurate micro-level CGWB raw station records could not be independently obtained or verified within the local repository environment, the team implemented **Option B**: an auditable, deterministic **synthetic demonstration dataset**.

1. **Deterministic PRNG:**
   - Generated using an explicit 32-bit Mulberry32 pseudo-random number generator initialized with seed `20260427`.
   - Running `npm run generate-data` reproduces the exact same 18,249 rows, station coordinates, and chemical values bit-for-bit.
2. **Realistic Hydrogeological Modeling:**
   - **Districts:** Covers all **36 administrative districts** of Maharashtra.
   - **Station Count:** Indexes **1,804 unique monitoring stations** (dug wells, tube wells, and piezometers).
   - **Seasonal Cycles:** Simulates pre-monsoon (April–May) and post-monsoon (November–December) groundwater recharge dynamics.
   - **Deccan Basalt Hydrochemistry:** Incorporates realistic ranges for pH, Total Dissolved Solids (TDS), Electrical Conductivity (EC), Total Hardness, Calcium, Magnesium, Chloride, Sulphate, Nitrate, Fluoride, and Alkalinity.
3. **Explicit Provenance Labeling:**
   - Every row contains `Agency: "CGWB (Simulated Demo)"` and `Data_Provenance: "SYNTHETIC_DEMO"`.
   - The REST API health endpoint reports `"isSyntheticData": true` and `"eventCode": "SSF2026"`.
   - UI banners, Leaflet map popups, station headers, and CSV export files feature explicit synthetic demonstration notices.

---

## 2. Recalculated Dataset Metrics & Inventory

The generated demonstration dataset (`backend/data/pani_safe_results.csv`) was evaluated with the following exact measurements:

| Metric | Measured Value | Methodology Note |
| :--- | :--- | :--- |
| **Total Sample Events** | **18,249** | Complete dataset across multi-year seasonal campaigns |
| **Unique Monitoring Stations** | **1,804** | Indexed via compound keys (`District + Station + Lat + Lon`) |
| **Administrative Districts** | **36** | All Maharashtra districts represented |
| **Review Signals (`needsReviewCount`)** | **2,865 (15.7%)** | Samples crossing at least one screening benchmark |
| **pH Exceedance Signals** | **1,122 (6.4%)** | Valid pH outside acceptable range `6.5 – 8.5` |
| **TDS Exceedance Signals** | **2,223 (13.0%)** | Valid TDS exceeding desirable limit `> 500 mg/L` |
| **Dual Exceedances** | **480 (2.6%)** | Samples exceeding both pH and TDS thresholds |
| **Within Screening Benchmarks** | **15,384 (84.3%)** | Samples within initial screening benchmarks |
| **Reported Valid pH Readings** | **17,569 (96.3%)** | 680 missing values (3.7%) preserved as `null` |
| **Reported Usable TDS Readings** | **17,113 (93.8%)** | 1,136 missing or unverified values (6.2%) |
| **Overall Data Quality Index** | **95.0%** | Average completeness across monitored parameters |

---

## 3. Data Integrity & Scientific Cleaning Rules

Groundwater hydrochemistry data requires strict scientific integrity rules to prevent biased or erroneous decision-making:

### Rule 1: Strict Preservation of Missing Values (Null Preservation)
In raw monitoring archives, analyte columns are frequently omitted if a specific test was not performed during that sampling run.
- **Common Error in Generic Pipelines:** Converting missing fields or `NaN` into `0`.
- **Scientific Consequence:** Converting missing Fluoride to `0.0 mg/L` falsely conveys non-toxicity. Converting missing TDS to `0.0 mg/L` corrupts ion balance ratios.
- **Pani Safe Implementation:** Blank entries are preserved as `null`. In the UI and API, these are explicitly labeled as `N/A (Not Reported)`. Statistical denominators reflect only valid, reported samples.

### Rule 2: Treatment of 0.0 mg/L TDS as Unverified / Sensor Default
- **Hydrogeological Context:** Natural groundwater moving through basaltic or alluvial aquifers dissolves minerals continuously. Pure water (`0.0 mg/L TDS`) does not exist naturally in groundwater aquifers.
- **Pani Safe Implementation:** Any reading with `TDS === 0` is classified as *Unverified / Sensor Default* and excluded from distribution metrics and averages.

### Rule 3: Exclusion of Physically Impossible pH Values
- **Physical Context:** The aqueous pH scale operates between `0.0` and `14.0`.
- **Pani Safe Implementation:** Any historical entry with `pH < 0` or `pH > 14` is identified as an instrument miscalibration or recording error and excluded from pH distribution metrics.

### Rule 4: Station Disambiguation via Composite Keys
- **Geographic Challenge:** Multiple talukas across different districts share identical village names (e.g., "Khed", "Bori", "Wadgaon", "Shirur").
- **Pani Safe Implementation:** Stations are disambiguated using a composite unique key:  
  `${District}_${CleanStationName}_${Latitude}_${Longitude}`.

---

## 4. Screening Thresholds Aligned with BIS IS 10500:2012

Pani Safe references benchmark limits defined by the **Bureau of Indian Standards (BIS IS 10500:2012 — Indian Standard Drinking Water Specification)**:

```
+-----------------------------------------------------------------------------------------+
|                                BIS IS 10500:2012 CRITERIA                                |
+-----------------------------------------------------------------------------------------+
| Parameter | Acceptable / Desirable Limit | Permissible Limit (No Alternate) | Relaxation?|
+-----------+------------------------------+----------------------------------+------------+
| pH Value  | 6.5 – 8.5                    | 6.5 – 8.5                        | None       |
| TDS       | 500 mg/L                     | 2,000 mg/L                       | Yes        |
+-----------------------------------------------------------------------------------------+
```

### A. pH Screening Rationale
- **Acceptable Range:** `6.5` to `8.5`.
- **Permissible Limit:** **No relaxation.** Waters outside this range require pH correction prior to distribution.
- **Screening Triggers:**
  - `pH < 6.5`: Indicates acidic tendency. Associated with metallic leaching, plumbing corrosion, and heavy metal mobility.
  - `pH > 8.5`: Indicates alkaline tendency. Associated with mineral encrustation in distribution pipes and reduced disinfection efficacy.

### B. Total Dissolved Solids (TDS) Screening Rationale
- **Acceptable Limit:** `500 mg/L` (desirable threshold for palatability and gastrointestinal comfort).
- **Permissible Limit:** `2,000 mg/L` in the absence of an alternate drinking water source.
- **Screening Triggers:**
  - `TDS <= 500 mg/L`: Within desirable screening benchmark.
  - `500 < TDS <= 2,000 mg/L`: "Review Recommended" — palatability threshold exceeded; may be acceptable if no alternative source exists, but warrants local hydrogeological investigation.
  - `TDS > 2,000 mg/L`: Exceeds permissible limit under any circumstance; prioritized for immediate lab re-testing.

---

## 5. Non-Alarmist Screening vs. Drinking Water Certification

Pani Safe maintains strict scientific boundaries between analytics and regulatory certification:

1. **What Pani Safe Provides:**
   - **Triage & Decision Support:** Enables water resource managers to rank districts and talukas by screening flag rates.
   - **Audit of Monitoring Gaps:** Visualizes parameter completeness and unmonitored stations across historical campaigns.
   - **Actionable Inspection Queue:** Consolidates 2,865 flagged records into an inspectable queue for field deployment.

2. **What Pani Safe Does NOT Do:**
   - Does **not** issue drinking water safety certificates.
   - Does **not** present historical screening events as live real-time sensor streams.
   - Does **not** claim speculative AI/ML models without physically verified training grounds.
   - Avoids sensationist terminology like "toxic", "poisoned", or "confirmed contamination."

3. **Required Next Steps for Flagged Stations:**
   - Deployment of trained field technicians for sample collection following ISO/BIS chain-of-custody protocols.
   - Analysis in an accredited **NABL (National Accreditation Board for Testing and Calibration Laboratories)** facility.
   - Comprehensive screening for biological pathogens (fecal coliform, E. coli) and trace heavy metals (arsenic, lead, chromium, cadmium).
