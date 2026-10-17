# Pani Safe — Data Methodology, Quality Rules & Screening Standards

**Event:** IBM Z Datathon 2026  
**Focus:** Ground Water Chemistry Screening for Maharashtra, India  
**Source Attribution:** Central Ground Water Board (CGWB), Ministry of Jal Shakti, Government of India  

---

## 1. Dataset Provenance & Scope

The core dataset utilized by Pani Safe originates from historical groundwater quality monitoring conducted by the **Central Ground Water Board (CGWB)**, Western Region, covering the state of Maharashtra.

- **Total Historical Records:** 18,249 validated hydrochemical sample events
- **Unique Monitoring Stations:** 1,758+ observation wells (dug wells, tube wells, and piezometers)
- **District Coverage:** 35+ administrative districts across Maharashtra (including Ahmednagar, Akola, Amravati, Aurangabad, Beed, Bhandara, Buldhana, Chandrapur, Dhule, Gadchiroli, Gondia, Hingoli, Jalgaon, Jalna, Kolhapur, Latur, Mumbai City, Mumbai Suburban, Nagpur, Nanded, Nandurbar, Nashik, Osmanabad, Palghar, Parbhani, Pune, Raigad, Ratnagiri, Sangli, Satara, Sindhudurg, Solapur, Thane, Wardha, Washim, and Yavatmal).
- **Temporal Span:** Multi-year historical surveillance (seasonal pre-monsoon and post-monsoon campaigns).

---

## 2. Data Cleaning & Integrity Principles

Groundwater hydrochemistry data requires rigorous data integrity rules to prevent misleading conclusions:

### Rule 1: Strict Preservation of Missing Values (Null Preservation)
In raw government archives, chemical parameters are frequently left blank when a particular laboratory run did not test for that analyte.
- **Problem:** Many automated data tools convert blank cells or `NaN` into `0`.
- **Consequence:** In water science, converting missing Fluoride to `0 mg/L` falsely suggests zero toxicity. Converting missing TDS to `0 mg/L` corrupts ion balance ratios.
- **Pani Safe Implementation:** Missing measurements are strictly preserved as `null`. In the UI and API, these are explicitly flagged as `N/A (Not Reported)`. Data quality indexes calculate exact measurement completeness.

### Rule 2: Treatment of Zero TDS Readings as Unverified / Missing
- **Scientific Context:** Natural groundwater circulating through Maharashtra's basaltic Deccan Traps invariably dissolves mineral ions. A natural groundwater reading of exactly `0.0 mg/L TDS` is hydrogeologically impossible.
- **Pani Safe Implementation:** Any record with `TDS === 0` is classified as *Unverified / Sensor Default* and excluded from distribution calculations.

### Rule 3: Exclusion of Out-of-Scale pH Readings
- **Scientific Context:** The operational pH scale runs from `0.0` to `14.0`.
- **Pani Safe Implementation:** Any historical entry with `pH < 0` or `pH > 14` is identified as an instrument miscalibration or transcription error and excluded from pH distribution metrics.

### Rule 4: Station Disambiguation via Composite Identifiers
- **Problem:** Multiple talukas across different districts contain identical village names (e.g. "Khed", "Bori", "Wadgaon").
- **Pani Safe Implementation:** Stations are indexed by a compound key consisting of `District + Station Name + Latitude + Longitude` to prevent disparate monitoring wells from being improperly aggregated.

---

## 3. Screening Thresholds & Standards Alignment

Pani Safe references benchmark limits aligned with the **Bureau of Indian Standards (BIS IS 10500:2012 — Indian Standard Drinking Water Specification)**:

### A. Potential of Hydrogen (pH)
- **Acceptable Screening Range:** `6.5` to `8.5`
- **Permissible Limit:** No relaxation
- **Flag Logic:** Flagged if `pH < 6.5` (acidic tendency, plumbing corrosion risk) OR `pH > 8.5` (alkaline encrustation risk).
- **Classification:** "Selected Screening Threshold Exceeded"

### B. Total Dissolved Solids (TDS)
- **Acceptable Screening Threshold:** `500 mg/L`
- **Permissible Limit under IS 10500:** `2,000 mg/L` (in absence of alternate source)
- **Flag Logic:** Flagged if `TDS > 500 mg/L`.
- **Classification:** "Review Recommended"

> **Crucial Rule on Double-Counting:**  
> If a sample exhibits both `pH_Flag = true` and `TDS_Flag = true`, it is classified under `bothFlagsCount` and counted once toward the overall `needsReviewCount`.

---

## 4. The Critical Boundary: Screening vs. Certification

To ensure ethics and transparency, Pani Safe enforces strict scientific terminology:

1. **What Pani Safe DOES:**
   - Provides decision-support triage to environmental researchers, community leaders, and district hydrologists.
   - Highlights historical sampling stations that crossed preliminary screening thresholds.
   - Identifies data gaps and unmonitored parameters in historical records.

2. **What Pani Safe DOES NOT DO:**
   - It does **not** provide drinking-water certification.
   - It does **not** declare water definitively "safe" or "unsafe."
   - It does **not** simulate fake real-time sensor streams or claim predictive AI without physically validated models.
   - It avoids alarmist labels such as "toxic", "poisonous", or "confirmed contaminated."

3. **Required Next Steps for Flagged Stations:**
   - Physical field inspection of the wellhead.
   - Fresh duplicate sampling adhering to chain-of-custody protocols.
   - Certified laboratory analysis in an accredited NABL facility, including biological parameters (coliform bacteria) and heavy metal screening (Arsenic, Lead, Cadmium).
