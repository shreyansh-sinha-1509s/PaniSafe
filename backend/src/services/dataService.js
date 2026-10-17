import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCGWBMaharashtraData } from '../utils/generateData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const RESULTS_PATH = path.join(DATA_DIR, 'pani_safe_results.csv');
const ALERTS_PATH = path.join(DATA_DIR, 'pani_safe_alerts.csv');

// In-memory data store
class DataService {
  constructor() {
    this.records = [];
    this.alerts = [];
    this.stations = new Map();
    this.districts = new Map();
    this.isLoaded = false;
    this.loadError = null;
    this.loadStats = {};
    this.metadata = {};
    this.isSimulatedBenchmark = false;
  }

  // Parse a single CSV line with support for quotes
  parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  // Safe numeric parsing preserving nulls
  parseNumeric(val) {
    if (val === undefined || val === null || val === '') return null;
    const clean = String(val).replace(/["']/g, '').trim();
    if (clean === '' || clean.toLowerCase() === 'nan' || clean.toLowerCase() === 'null') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  // Safe boolean parsing
  parseBoolean(val) {
    if (val === undefined || val === null) return false;
    const clean = String(val).replace(/["']/g, '').trim().toLowerCase();
    return clean === 'true' || clean === '1' || clean === 'yes' || clean === 't';
  }

  // Validate coordinates specifically for Maharashtra / India
  validateCoordinates(lat, lon) {
    if (lat === null || lon === null) return { isValid: false, reason: 'Missing coordinates' };
    if (isNaN(lat) || isNaN(lon)) return { isValid: false, reason: 'Non-numeric coordinates' };
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return { isValid: false, reason: 'Coordinates outside global range' };
    }
    // Maharashtra approx bounds: Lat 15.0 - 23.0, Lon 72.0 - 81.5
    const inMaharashtra = lat >= 15.0 && lat <= 23.0 && lon >= 72.0 && lon <= 81.5;
    return {
      isValid: true,
      inMaharashtra,
      reason: inMaharashtra ? 'Valid Maharashtra coordinates' : 'Valid coordinates outside primary bounds'
    };
  }

  // Parse CSV file content
  parseCsvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error(`CSV file at ${filePath} has fewer than 2 rows (header + 1 record).`);
    }

    const headers = this.parseCsvLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
    
    // Validate core expected fields
    const requiredFields = ['Station', 'District', 'Data Acquisition Time'];
    for (const req of requiredFields) {
      const match = headers.find(h => h.toLowerCase() === req.toLowerCase());
      if (!match) {
        throw new Error(`Missing required column '${req}' in ${filePath}. Found headers: ${headers.join(', ')}`);
      }
    }

    const headerIndex = {};
    headers.forEach((h, idx) => {
      headerIndex[h.toLowerCase()] = idx;
    });

    const getCol = (cols, name, altNames = []) => {
      const candidates = [name, ...altNames];
      for (const cand of candidates) {
        const idx = headerIndex[cand.toLowerCase()];
        if (idx !== undefined && idx < cols.length) {
          const val = cols[idx].replace(/^["']|["']$/g, '').trim();
          return val === '' ? null : val;
        }
      }
      return null;
    };

    const parsedRecords = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

      const stationName = getCol(cols, 'Station', ['Station_Name', 'Location']) || `Station-${i}`;
      const district = getCol(cols, 'District', ['District_Name']) || 'Unknown District';
      const tehsil = getCol(cols, 'Tehsil', ['Taluka', 'Subdistrict']) || '';
      const block = getCol(cols, 'Block') || '';
      const village = getCol(cols, 'Village') || '';
      const agency = getCol(cols, 'Agency') || 'CGWB';
      const state = getCol(cols, 'State') || 'Maharashtra';

      const rawLat = getCol(cols, 'Latitude', ['Lat']);
      const rawLon = getCol(cols, 'Longitude', ['Lon', 'Long']);
      const lat = this.parseNumeric(rawLat);
      const lon = this.parseNumeric(rawLon);
      const coordValidation = this.validateCoordinates(lat, lon);

      const rawTime = getCol(cols, 'Data Acquisition Time', ['Sampling_Date', 'Date', 'Time']) || '2020-01-01';
      let samplingDate = null;
      let samplingYear = null;
      try {
        const d = new Date(rawTime);
        if (!isNaN(d.getTime())) {
          samplingDate = d.toISOString().split('T')[0];
          samplingYear = d.getFullYear();
        } else {
          // fallback string parse
          const matchYear = String(rawTime).match(/\b(20\d\d|19\d\d)\b/);
          if (matchYear) samplingYear = parseInt(matchYear[1], 10);
          samplingDate = String(rawTime).substring(0, 10);
        }
      } catch {
        samplingDate = String(rawTime).substring(0, 10);
      }

      // Chemical parameters
      const rawPh = getCol(cols, 'Potential of Hydrogen (pH)', ['pH', 'PH']);
      let ph = this.parseNumeric(rawPh);
      // Exclude invalid pH readings outside 0-14 from analysis
      let isPhValidRange = false;
      if (ph !== null) {
        if (ph >= 0 && ph <= 14) {
          isPhValidRange = true;
        } else {
          // Invalid pH outside standard scale
          ph = null; // Excluded from pH analysis per methodology
        }
      }

      const rawTds = getCol(cols, 'Total Dissolved Solids (mg/L)', ['TDS', 'TDS (mg/L)']);
      let tds = this.parseNumeric(rawTds);
      let isTdsUnverifiedZero = false;
      if (tds !== null && tds === 0) {
        // Zero TDS readings were marked unverified/missing in notebook analysis
        isTdsUnverifiedZero = true;
        tds = null;
      }

      const ec = this.parseNumeric(getCol(cols, 'Electrical Conductivity (µS/cm)', ['EC', 'Electrical Conductivity']));
      const chloride = this.parseNumeric(getCol(cols, 'Chloride (mg/L)', ['Chloride', 'Cl']));
      const fluoride = this.parseNumeric(getCol(cols, 'Fluoride (mg/L)', ['Fluoride', 'F']));
      const nitrate = this.parseNumeric(getCol(cols, 'Nitrate (mg/L)', ['Nitrate', 'NO3']));
      const sulphate = this.parseNumeric(getCol(cols, 'Sulphate (mg/L)', ['Sulphate', 'SO4']));
      const hardness = this.parseNumeric(getCol(cols, 'Hardness Total (mg/L)', ['Hardness', 'Total Hardness']));
      const calcium = this.parseNumeric(getCol(cols, 'Calcium (mg/L)', ['Calcium', 'Ca']));
      const magnesium = this.parseNumeric(getCol(cols, 'Magnesium (mg/L)', ['Magnesium', 'Mg']));

      // Flags: use existing flags if available, else evaluate according to screening criteria
      const rawPhFlag = getCol(cols, 'pH_Flag');
      const rawTdsFlag = getCol(cols, 'TDS_Flag');
      const rawNeedsReview = getCol(cols, 'Needs_Review');

      let phFlag = false;
      if (rawPhFlag !== null) {
        phFlag = this.parseBoolean(rawPhFlag);
      } else if (ph !== null) {
        phFlag = ph < 6.5 || ph > 8.5;
      }

      let tdsFlag = false;
      if (rawTdsFlag !== null) {
        tdsFlag = this.parseBoolean(rawTdsFlag);
      } else if (tds !== null) {
        tdsFlag = tds > 500;
      }

      let needsReview = false;
      if (rawNeedsReview !== null) {
        needsReview = this.parseBoolean(rawNeedsReview);
      } else {
        needsReview = phFlag || tdsFlag;
      }

      // Unique station composite identifier to prevent collisions for same station names across locations
      const safeLatStr = lat !== null ? lat.toFixed(4) : 'nolat';
      const safeLonStr = lon !== null ? lon.toFixed(4) : 'nolon';
      const cleanStationSlug = stationName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const cleanDistrictSlug = district.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const stationId = `${cleanDistrictSlug}_${cleanStationSlug}_${safeLatStr}_${safeLonStr}`;

      const recordId = `REC-${i}`;

      parsedRecords.push({
        id: recordId,
        stationId,
        station: stationName,
        district,
        tehsil,
        block,
        village,
        agency,
        state,
        latitude: lat,
        longitude: lon,
        hasValidCoords: coordValidation.isValid,
        inMaharashtra: coordValidation.inMaharashtra,
        acquisitionTime: rawTime,
        samplingDate,
        samplingYear,
        ph,
        isPhValidRange,
        tds,
        isTdsUnverifiedZero,
        ec,
        chloride,
        fluoride,
        nitrate,
        sulphate,
        hardness,
        calcium,
        magnesium,
        phFlag,
        tdsFlag,
        needsReview,
        screeningReason: this.computeScreeningReason(phFlag, tdsFlag, ph, tds)
      });
    }

    return { records: parsedRecords, headers };
  }

  computeScreeningReason(phFlag, tdsFlag, ph, tds) {
    const reasons = [];
    if (phFlag && ph !== null) {
      if (ph < 6.5) reasons.push(`pH ${ph.toFixed(2)} is below acceptable limit (6.5 - 8.5 per IS 10500:2012) — review recommended for acidic corrosion tendency`);
      if (ph > 8.5) reasons.push(`pH ${ph.toFixed(2)} exceeds acceptable limit (6.5 - 8.5 per IS 10500:2012) — review recommended for alkaline encrustation`);
    }
    if (tdsFlag && tds !== null) {
      if (tds > 2000) {
        reasons.push(`TDS ${tds.toFixed(1)} mg/L exceeds permissible limit (2,000 mg/L per IS 10500:2012) — priority review signal`);
      } else {
        reasons.push(`TDS ${tds.toFixed(1)} mg/L exceeds desirable screening threshold (500 mg/L), within permissible limit (2,000 mg/L in absence of alternate source) per IS 10500:2012`);
      }
    }
    if (reasons.length === 0) {
      return 'Within preliminary screening limits (pH 6.5 - 8.5, TDS <= 500 mg/L)';
    }
    return reasons.join('; ');
  }

  // Initialize data service on server startup
  init() {
    try {
      console.log('Initializing Pani Safe Data Engine...');
      let resultsFileExists = fs.existsSync(RESULTS_PATH);

      if (!resultsFileExists) {
        console.warn(`[DATA NOTICE] File not found at ${RESULTS_PATH}.`);
        console.warn(`Generating reproducible synthetic demonstration dataset (18,249 records)...`);
        generateCGWBMaharashtraData(18249);
        this.isSimulatedBenchmark = true;
      } else {
        console.log(`[DATA OK] Found existing results CSV at ${RESULTS_PATH}`);
        this.isSimulatedBenchmark = true;
      }

      // Parse results file
      const { records, headers } = this.parseCsvFile(RESULTS_PATH);
      this.records = records;

      // Build Station and District aggregations
      this.buildAggregations();

      this.isLoaded = true;
      this.loadError = null;

      console.log(`[DATA INITIALIZATION SUCCESS]`);
      console.log(`- Loaded records: ${this.records.length}`);
      console.log(`- Unique stations: ${this.stations.size}`);
      console.log(`- Districts covered: ${this.districts.size}`);
      console.log(`- Flagged records: ${this.summary.needsReviewCount} (${((this.summary.needsReviewCount / this.records.length) * 100).toFixed(1)}%)`);
      console.log(`- Valid pH readings: ${this.summary.validPhCount}`);
      console.log(`- Usable TDS readings: ${this.summary.validTdsCount}`);

      this.metadata = {
        source: 'Synthetic Demonstration Dataset (Modeled on Maharashtra Regional Hydrochemistry & BIS IS 10500:2012 Standards)',
        isSynthetic: true,
        benchmarkMode: true,
        dataSourceDescription: 'Deterministic synthetic demonstration dataset (18,249 records across 36 districts) generated with seed 20260427 for IBM Z Datathon 2026 prototype evaluation. Not real Central Ground Water Board (CGWB) field measurements or live physical water test certifications.',
        totalRecords: this.records.length,
        totalStations: this.stations.size,
        totalDistricts: this.districts.size,
        screeningRules: {
          phStandard: 'Acceptable limit: 6.5 - 8.5 | Permissible limit: No relaxation (BIS IS 10500:2012). Values outside 0-14 excluded as instrument anomalies.',
          tdsStandard: 'Desirable threshold: 500 mg/L | Permissible limit in absence of alternate source: 2,000 mg/L (BIS IS 10500:2012). Zero TDS treated as unverified/sensor default.',
          disclaimer: 'Preliminary screening and decision-support tool. Not a drinking-water safety certification.'
        },
        columnsDetected: headers
      };

    } catch (err) {
      console.error('[DATA SERVICE ERROR]', err);
      this.isLoaded = false;
      this.loadError = err.message;
    }
  }

  // Pre-calculate summary stats, stations map, districts map, and histograms
  buildAggregations() {
    this.stations = new Map();
    this.districts = new Map();

    let validPhCount = 0;
    let validTdsCount = 0;
    let phFlagCount = 0;
    let tdsFlagCount = 0;
    let bothFlagsCount = 0;
    let needsReviewCount = 0;
    let validCoordCount = 0;

    const yearlyMap = new Map();

    for (const rec of this.records) {
      if (rec.ph !== null) validPhCount++;
      if (rec.tds !== null) validTdsCount++;
      if (rec.hasValidCoords) validCoordCount++;

      if (rec.phFlag) phFlagCount++;
      if (rec.tdsFlag) tdsFlagCount++;
      if (rec.phFlag && rec.tdsFlag) bothFlagsCount++;
      if (rec.needsReview) needsReviewCount++;

      // Station aggregation
      if (!this.stations.has(rec.stationId)) {
        this.stations.set(rec.stationId, {
          stationId: rec.stationId,
          station: rec.station,
          district: rec.district,
          tehsil: rec.tehsil,
          block: rec.block,
          village: rec.village,
          agency: rec.agency,
          latitude: rec.latitude,
          longitude: rec.longitude,
          hasValidCoords: rec.hasValidCoords,
          inMaharashtra: rec.inMaharashtra,
          recordCount: 0,
          flaggedCount: 0,
          latestDate: rec.samplingDate,
          latestPh: rec.ph,
          latestTds: rec.tds,
          needsReviewLatest: rec.needsReview,
          records: []
        });
      }

      const st = this.stations.get(rec.stationId);
      st.recordCount++;
      if (rec.needsReview) st.flaggedCount++;
      if (!st.latestDate || (rec.samplingDate && rec.samplingDate > st.latestDate)) {
        st.latestDate = rec.samplingDate;
        st.latestPh = rec.ph;
        st.latestTds = rec.tds;
        st.needsReviewLatest = rec.needsReview;
      }
      st.records.push(rec);

      // District aggregation
      if (!this.districts.has(rec.district)) {
        this.districts.set(rec.district, {
          district: rec.district,
          recordCount: 0,
          stationIds: new Set(),
          flaggedCount: 0,
          phFlagCount: 0,
          tdsFlagCount: 0,
          bothFlagsCount: 0,
          validPhCount: 0,
          validTdsCount: 0,
          latSum: 0,
          lonSum: 0,
          coordCount: 0
        });
      }

      const dist = this.districts.get(rec.district);
      dist.recordCount++;
      dist.stationIds.add(rec.stationId);
      if (rec.needsReview) dist.flaggedCount++;
      if (rec.phFlag) dist.phFlagCount++;
      if (rec.tdsFlag) dist.tdsFlagCount++;
      if (rec.phFlag && rec.tdsFlag) dist.bothFlagsCount++;
      if (rec.ph !== null) dist.validPhCount++;
      if (rec.tds !== null) dist.validTdsCount++;
      if (rec.hasValidCoords) {
        dist.latSum += rec.latitude;
        dist.lonSum += rec.longitude;
        dist.coordCount++;
      }

      // Yearly aggregation
      const year = rec.samplingYear || 2020;
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          recordCount: 0,
          flaggedCount: 0,
          phFlagCount: 0,
          tdsFlagCount: 0,
          phSum: 0,
          phCount: 0,
          tdsSum: 0,
          tdsCount: 0
        });
      }
      const yStats = yearlyMap.get(year);
      yStats.recordCount++;
      if (rec.needsReview) yStats.flaggedCount++;
      if (rec.phFlag) yStats.phFlagCount++;
      if (rec.tdsFlag) yStats.tdsFlagCount++;
      if (rec.ph !== null) {
        yStats.phSum += rec.ph;
        yStats.phCount++;
      }
      if (rec.tds !== null) {
        yStats.tdsSum += rec.tds;
        yStats.tdsCount++;
      }
    }

    // Convert districts map to list with averages
    const districtList = Array.from(this.districts.values()).map(d => ({
      district: d.district,
      recordCount: d.recordCount,
      stationCount: d.stationIds.size,
      flaggedCount: d.flaggedCount,
      flagRate: parseFloat(((d.flaggedCount / d.recordCount) * 100).toFixed(1)),
      phFlagCount: d.phFlagCount,
      tdsFlagCount: d.tdsFlagCount,
      bothFlagsCount: d.bothFlagsCount,
      validPhCount: d.validPhCount,
      validTdsCount: d.validTdsCount,
      avgLat: d.coordCount > 0 ? parseFloat((d.latSum / d.coordCount).toFixed(4)) : null,
      avgLon: d.coordCount > 0 ? parseFloat((d.lonSum / d.coordCount).toFixed(4)) : null
    })).sort((a, b) => b.recordCount - a.recordCount);

    // Yearly trends sorted
    const trends = Array.from(yearlyMap.values())
      .map(y => ({
        year: y.year,
        recordCount: y.recordCount,
        flaggedCount: y.flaggedCount,
        phFlagCount: y.phFlagCount,
        tdsFlagCount: y.tdsFlagCount,
        flagRate: parseFloat(((y.flaggedCount / y.recordCount) * 100).toFixed(1)),
        avgPh: y.phCount > 0 ? parseFloat((y.phSum / y.phCount).toFixed(2)) : null,
        avgTds: y.tdsCount > 0 ? Math.round(y.tdsSum / y.tdsCount) : null
      }))
      .sort((a, b) => a.year - b.year);

    // Binned histograms
    const phHistogram = [
      { range: '< 6.0', label: 'Acidic (< 6.0)', count: 0, flag: true },
      { range: '6.0 - 6.49', label: 'Slightly Acidic (6.0 - 6.5)', count: 0, flag: true },
      { range: '6.5 - 6.99', label: 'Acceptable (6.5 - 7.0)', count: 0, flag: false },
      { range: '7.0 - 7.49', label: 'Neutral (7.0 - 7.5)', count: 0, flag: false },
      { range: '7.5 - 7.99', label: 'Slightly Alkaline (7.5 - 8.0)', count: 0, flag: false },
      { range: '8.0 - 8.5', label: 'Acceptable (8.0 - 8.5)', count: 0, flag: false },
      { range: '8.51 - 9.0', label: 'Alkaline (> 8.5 - 9.0)', count: 0, flag: true },
      { range: '> 9.0', label: 'Highly Alkaline (> 9.0)', count: 0, flag: true }
    ];

    for (const rec of this.records) {
      if (rec.ph !== null) {
        const p = rec.ph;
        if (p < 6.0) phHistogram[0].count++;
        else if (p < 6.5) phHistogram[1].count++;
        else if (p < 7.0) phHistogram[2].count++;
        else if (p < 7.5) phHistogram[3].count++;
        else if (p < 8.0) phHistogram[4].count++;
        else if (p <= 8.5) phHistogram[5].count++;
        else if (p <= 9.0) phHistogram[6].count++;
        else phHistogram[7].count++;
      }
    }

    const tdsHistogram = [
      { range: '< 250', label: 'Low (< 250 mg/L)', count: 0, flag: false },
      { range: '250 - 500', label: 'Acceptable (250 - 500 mg/L)', count: 0, flag: false },
      { range: '501 - 750', label: 'Moderate Threshold (> 500 - 750 mg/L)', count: 0, flag: true },
      { range: '751 - 1000', label: 'Elevated (750 - 1000 mg/L)', count: 0, flag: true },
      { range: '1001 - 1500', label: 'High (1000 - 1500 mg/L)', count: 0, flag: true },
      { range: '> 1500', label: 'Very High (> 1500 mg/L)', count: 0, flag: true }
    ];

    for (const rec of this.records) {
      if (rec.tds !== null) {
        const t = rec.tds;
        if (t < 250) tdsHistogram[0].count++;
        else if (t <= 500) tdsHistogram[1].count++;
        else if (t <= 750) tdsHistogram[2].count++;
        else if (t <= 1000) tdsHistogram[3].count++;
        else if (t <= 1500) tdsHistogram[4].count++;
        else tdsHistogram[5].count++;
      }
    }

    const totalRecords = this.records.length;
    // Data quality index: percentage of records with complete primary parameters
    const qualityIndex = totalRecords > 0
      ? parseFloat((((validPhCount + validTdsCount) / (totalRecords * 2)) * 100).toFixed(1))
      : 0;

    this.summary = {
      totalRecords,
      totalStations: this.stations.size,
      totalDistricts: this.districts.size,
      needsReviewCount,
      phFlagCount,
      tdsFlagCount,
      bothFlagsCount,
      singleFlagCount: (phFlagCount + tdsFlagCount) - (2 * bothFlagsCount),
      withinThresholdsCount: totalRecords - needsReviewCount,
      validPhCount,
      missingPhCount: totalRecords - validPhCount,
      validTdsCount,
      missingTdsCount: totalRecords - validTdsCount,
      validCoordCount,
      dataQualityIndex: qualityIndex,
      phFlagRate: parseFloat(((phFlagCount / (validPhCount || 1)) * 100).toFixed(1)),
      tdsFlagRate: parseFloat(((tdsFlagCount / (validTdsCount || 1)) * 100).toFixed(1)),
      overallReviewRate: parseFloat(((needsReviewCount / (totalRecords || 1)) * 100).toFixed(1))
    };

    this.districtList = districtList;
    this.trends = trends;
    this.phHistogram = phHistogram;
    this.tdsHistogram = tdsHistogram;
  }

  // Filter and paginate records
  queryRecords(params = {}) {
    if (!this.isLoaded) throw new Error(this.loadError || 'Data service not loaded');

    let filtered = this.records;

    if (params.district && params.district !== 'all') {
      const targetDist = params.district.toLowerCase();
      filtered = filtered.filter(r => r.district.toLowerCase() === targetDist);
    }

    if (params.station && params.station !== 'all') {
      const targetStation = params.station.toLowerCase();
      filtered = filtered.filter(r => r.station.toLowerCase().includes(targetStation) || r.stationId === params.station);
    }

    if (params.phFlag !== undefined && params.phFlag !== 'all') {
      const wantPhFlag = params.phFlag === 'true' || params.phFlag === true;
      filtered = filtered.filter(r => r.phFlag === wantPhFlag);
    }

    if (params.tdsFlag !== undefined && params.tdsFlag !== 'all') {
      const wantTdsFlag = params.tdsFlag === 'true' || params.tdsFlag === true;
      filtered = filtered.filter(r => r.tdsFlag === wantTdsFlag);
    }

    if (params.needsReview !== undefined && params.needsReview !== 'all') {
      const wantReview = params.needsReview === 'true' || params.needsReview === true;
      filtered = filtered.filter(r => r.needsReview === wantReview);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.station.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.village.toLowerCase().includes(q) ||
        r.tehsil.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }

    if (params.startYear) {
      const sY = parseInt(params.startYear, 10);
      if (!isNaN(sY)) filtered = filtered.filter(r => r.samplingYear >= sY);
    }

    if (params.endYear) {
      const eY = parseInt(params.endYear, 10);
      if (!isNaN(eY)) filtered = filtered.filter(r => r.samplingYear <= eY);
    }

    const totalFiltered = filtered.length;

    // Sorting
    const sortField = params.sort || 'acquisitionTime';
    const sortOrder = (params.order || 'desc').toLowerCase();
    const modifier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * modifier;
      }
      return (valA - valB) * modifier;
    });

    // Pagination
    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(params.limit, 10) || 25));
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      records: paginated,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit)
      }
    };
  }

  // Get station details and historical chemistry records
  getStationById(id) {
    if (!this.isLoaded) throw new Error('Data service not loaded');
    const st = this.stations.get(id);
    if (!st) return null;

    // Sort station historical records by date
    const sortedRecords = [...st.records].sort((a, b) => {
      const dA = new Date(a.acquisitionTime).getTime();
      const dB = new Date(b.acquisitionTime).getTime();
      return dA - dB;
    });

    // Missing parameter analysis for this station
    let missingPh = 0;
    let missingTds = 0;
    let missingFluoride = 0;
    let missingNitrate = 0;
    let missingChloride = 0;
    let missingHardness = 0;

    sortedRecords.forEach(r => {
      if (r.ph === null) missingPh++;
      if (r.tds === null) missingTds++;
      if (r.fluoride === null) missingFluoride++;
      if (r.nitrate === null) missingNitrate++;
      if (r.chloride === null) missingChloride++;
      if (r.hardness === null) missingHardness++;
    });

    return {
      ...st,
      records: sortedRecords,
      missingParametersSummary: {
        totalSamples: sortedRecords.length,
        missingPh,
        missingTds,
        missingFluoride,
        missingNitrate,
        missingChloride,
        missingHardness
      }
    };
  }

  // Get stations list for map view and dropdowns
  getStationsList(params = {}) {
    if (!this.isLoaded) throw new Error('Data service not loaded');
    let list = Array.from(this.stations.values());

    if (params.district && params.district !== 'all') {
      const d = params.district.toLowerCase();
      list = list.filter(s => s.district.toLowerCase() === d);
    }

    if (params.screeningStatus && params.screeningStatus !== 'all') {
      if (params.screeningStatus === 'flagged') {
        list = list.filter(s => s.flaggedCount > 0);
      } else if (params.screeningStatus === 'clean') {
        list = list.filter(s => s.flaggedCount === 0);
      }
    }

    if (params.onlyValidCoords === 'true' || params.onlyValidCoords === true) {
      list = list.filter(s => s.hasValidCoords);
    }

    return list.map(s => ({
      stationId: s.stationId,
      station: s.station,
      district: s.district,
      tehsil: s.tehsil,
      village: s.village,
      agency: s.agency,
      latitude: s.latitude,
      longitude: s.longitude,
      hasValidCoords: s.hasValidCoords,
      recordCount: s.recordCount,
      flaggedCount: s.flaggedCount,
      latestDate: s.latestDate,
      latestPh: s.latestPh,
      latestTds: s.latestTds,
      needsReviewLatest: s.needsReviewLatest
    }));
  }

  // Get alert records
  getAlerts(params = {}) {
    return this.queryRecords({
      ...params,
      needsReview: 'true'
    });
  }

  // Export filtered records as CSV string
  exportCsv(params = {}) {
    const { records } = this.queryRecords({ ...params, limit: 100000, page: 1 });
    const headers = [
      'Station',
      'Agency',
      'State',
      'District',
      'Tehsil',
      'Block',
      'Village',
      'Latitude',
      'Longitude',
      'Data Acquisition Time',
      'Potential of Hydrogen (pH)',
      'Total Dissolved Solids (mg/L)',
      'pH_Flag',
      'TDS_Flag',
      'Needs_Review',
      'Screening_Reason',
      'Data_Provenance'
    ];

    const lines = [
      '# Pani Safe - IBM Z Datathon 2026 (SSF2026) - Synthetic Demonstration Dataset',
      '# Notice: Simulated hydrochemical benchmark records for decision-support screening demonstration. Not certified drinking water test results.',
      headers.join(',')
    ];
    for (const r of records) {
      const line = [
        `"${r.station}"`,
        `"${r.agency}"`,
        `"${r.state}"`,
        `"${r.district}"`,
        `"${r.tehsil}"`,
        `"${r.block}"`,
        `"${r.village}"`,
        r.latitude !== null ? r.latitude : '',
        r.longitude !== null ? r.longitude : '',
        `"${r.acquisitionTime}"`,
        r.ph !== null ? r.ph : '',
        r.tds !== null ? r.tds : '',
        r.phFlag ? 'TRUE' : 'FALSE',
        r.tdsFlag ? 'TRUE' : 'FALSE',
        r.needsReview ? 'TRUE' : 'FALSE',
        `"${r.screeningReason.replace(/"/g, '""')}"`,
        '"SYNTHETIC_DEMO"'
      ];
      lines.push(line.join(','));
    }
    return lines.join('\n');
  }
}

// Singleton instance
export const dataService = new DataService();
