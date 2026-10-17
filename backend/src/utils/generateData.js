import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

const MAHARASHTRA_DISTRICTS = [
  { name: 'Ahmednagar', lat: 19.0952, lon: 74.7496, stations: 65 },
  { name: 'Akola', lat: 20.7002, lon: 77.0082, stations: 48 },
  { name: 'Amravati', lat: 20.9320, lon: 77.7523, stations: 58 },
  { name: 'Aurangabad', lat: 19.8762, lon: 75.3433, stations: 62 },
  { name: 'Beed', lat: 18.9891, lon: 75.7601, stations: 52 },
  { name: 'Bhandara', lat: 21.1685, lon: 79.6558, stations: 42 },
  { name: 'Buldhana', lat: 20.5312, lon: 76.1804, stations: 50 },
  { name: 'Chandrapur', lat: 19.9615, lon: 79.2961, stations: 55 },
  { name: 'Dhule', lat: 20.9042, lon: 74.7749, stations: 44 },
  { name: 'Gadchiroli', lat: 20.1809, lon: 80.0035, stations: 46 },
  { name: 'Gondia', lat: 21.4604, lon: 80.1961, stations: 40 },
  { name: 'Hingoli', lat: 19.7196, lon: 77.1478, stations: 38 },
  { name: 'Jalgaon', lat: 21.0077, lon: 75.5626, stations: 60 },
  { name: 'Jalna', lat: 19.8410, lon: 75.8864, stations: 45 },
  { name: 'Kolhapur', lat: 16.7050, lon: 74.2433, stations: 56 },
  { name: 'Latur', lat: 18.4088, lon: 76.5604, stations: 48 },
  { name: 'Mumbai City', lat: 18.9388, lon: 72.8354, stations: 24 },
  { name: 'Mumbai Suburban', lat: 19.0760, lon: 72.8777, stations: 32 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, stations: 68 },
  { name: 'Nanded', lat: 19.1383, lon: 77.3210, stations: 54 },
  { name: 'Nandurbar', lat: 21.3705, lon: 74.2404, stations: 40 },
  { name: 'Nashik', lat: 19.9975, lon: 73.7898, stations: 72 },
  { name: 'Osmanabad', lat: 18.1856, lon: 76.0419, stations: 46 },
  { name: 'Palghar', lat: 19.6967, lon: 72.7699, stations: 42 },
  { name: 'Parbhani', lat: 19.2686, lon: 76.7719, stations: 44 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, stations: 80 },
  { name: 'Raigad', lat: 18.5158, lon: 73.1822, stations: 45 },
  { name: 'Ratnagiri', lat: 16.9902, lon: 73.3120, stations: 48 },
  { name: 'Sangli', lat: 16.8524, lon: 74.5815, stations: 52 },
  { name: 'Satara', lat: 17.6805, lon: 73.9997, stations: 54 },
  { name: 'Sindhudurg', lat: 16.1158, lon: 73.7142, stations: 40 },
  { name: 'Solapur', lat: 17.6599, lon: 75.9064, stations: 64 },
  { name: 'Thane', lat: 19.2183, lon: 72.9781, stations: 55 },
  { name: 'Wardha', lat: 20.7453, lon: 78.6022, stations: 42 },
  { name: 'Washim', lat: 20.1112, lon: 77.1354, stations: 38 },
  { name: 'Yavatmal', lat: 20.3888, lon: 78.1204, stations: 55 }
];

const VILLAGE_PREFIXES = ['Khed', 'Wad', 'Pimpal', 'Shir', 'Bhav', 'Chinch', 'Bori', 'Nand', 'Degaon', 'Manjar', 'Kasba', 'Dharm', 'Raj', 'Govind', 'Rampur', 'Son'];
const VILLAGE_SUFFIXES = ['gaon', 'wadi', 'khed', 'pur', 'ur', 'ner', 'bad', 'vali', 'kheda', 'oli'];

function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRandom(seed) {
  let s = Math.sin(seed++) * 10000;
  return s - Math.floor(s);
}

export function generateCGWBMaharashtraData(targetRecords = 18249) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const resultsPath = path.join(DATA_DIR, 'pani_safe_results.csv');
  const alertsPath = path.join(DATA_DIR, 'pani_safe_alerts.csv');

  // Build station pool of ~1,758 unique stations across 35 districts
  const stationPool = [];
  let stationCounter = 1;

  for (const dist of MAHARASHTRA_DISTRICTS) {
    for (let i = 0; i < dist.stations; i++) {
      const vPrefix = VILLAGE_PREFIXES[randomInt(0, VILLAGE_PREFIXES.length - 1)];
      const vSuffix = VILLAGE_SUFFIXES[randomInt(0, VILLAGE_SUFFIXES.length - 1)];
      const villageName = `${vPrefix}${vSuffix}`;
      const stationCode = `CGWB-MH-${dist.name.substring(0, 3).toUpperCase()}-${String(stationCounter).padStart(4, '0')}`;
      
      // Slight coordinate offset around district center
      const latOffset = (Math.random() - 0.5) * 0.45;
      const lonOffset = (Math.random() - 0.5) * 0.45;
      const lat = parseFloat((dist.lat + latOffset).toFixed(4));
      const lon = parseFloat((dist.lon + lonOffset).toFixed(4));

      stationPool.push({
        stationId: stationCode,
        stationName: `${villageName} Dug Well #${randomInt(1, 4)}`,
        agency: 'CGWB',
        state: 'Maharashtra',
        district: dist.name,
        tehsil: `${dist.name} Taluka`,
        block: `${villageName} Block`,
        village: villageName,
        latitude: lat,
        longitude: lon,
        // Baseline water quality profile for station
        basePh: randomFloat(6.8, 8.2, 2),
        baseTds: randomFloat(250, 750, 1),
        riskTendency: Math.random() < 0.28 // ~28% of stations have elevated readings
      });
      stationCounter++;
    }
  }

  console.log(`Generated ${stationPool.length} unique CGWB stations across ${MAHARASHTRA_DISTRICTS.length} districts.`);

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
    'Electrical Conductivity (µS/cm)',
    'Chloride (mg/L)',
    'Fluoride (mg/L)',
    'Nitrate (mg/L)',
    'Sulphate (mg/L)',
    'Hardness Total (mg/L)',
    'Calcium (mg/L)',
    'Magnesium (mg/L)',
    'pH_Flag',
    'TDS_Flag',
    'Needs_Review'
  ];

  const resultsRows = [];
  const alertsRows = [];

  const startYear = 2014;
  const endYear = 2024;

  for (let r = 0; r < targetRecords; r++) {
    // Select station
    const st = stationPool[r % stationPool.length];
    
    // Sampling date spread across years (pre-monsoon May, post-monsoon Nov typical for CGWB)
    const year = randomInt(startYear, endYear);
    const isPreMonsoon = Math.random() < 0.5;
    const month = isPreMonsoon ? 5 : 11;
    const day = randomInt(1, 28);
    const hour = randomInt(8, 16);
    const minute = randomInt(0, 59);
    const samplingTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    // Realistic chemistry generation
    let ph = null;
    let tds = null;
    let ec = null;
    let chloride = null;
    let fluoride = null;
    let nitrate = null;
    let sulphate = null;
    let hardness = null;
    let calcium = null;
    let magnesium = null;

    // Missingness simulation (realistic historical gaps ~4-8%)
    const hasPh = Math.random() > 0.04;
    const hasTds = Math.random() > 0.05;

    if (hasPh) {
      if (st.riskTendency && Math.random() < 0.22) {
        // Elevated or low pH flag
        ph = Math.random() < 0.35 ? randomFloat(5.8, 6.4, 2) : randomFloat(8.55, 9.4, 2);
      } else {
        ph = randomFloat(6.6, 8.4, 2);
      }
    }

    if (hasTds) {
      // Small percentage of unverified zero TDS readings to handle correctly
      if (Math.random() < 0.015) {
        tds = 0; // Unverified / missing marker in original CGWB data
      } else if (st.riskTendency && Math.random() < 0.45) {
        // Elevated TDS flag (> 500 mg/L)
        tds = randomFloat(510, 1650, 1);
      } else {
        tds = randomFloat(120, 490, 1);
      }
    }

    if (tds !== null && tds > 0) {
      ec = Math.round(tds * 1.56 + (Math.random() - 0.5) * 30);
      chloride = Math.round(tds * randomFloat(0.12, 0.28, 3));
      fluoride = randomFloat(0.2, 1.8, 2);
      nitrate = Math.round(randomFloat(5, 75, 1));
      sulphate = Math.round(tds * randomFloat(0.08, 0.22, 2));
      hardness = Math.round(tds * randomFloat(0.35, 0.65, 2));
      calcium = Math.round(hardness * 0.4);
      magnesium = Math.round(hardness * 0.25);
    }

    // Flags computation matching JupyterLab screening logic
    // pH flag: below 6.5 or above 8.5 (only if pH is valid 0-14)
    let phFlag = false;
    if (ph !== null && ph >= 0 && ph <= 14) {
      if (ph < 6.5 || ph > 8.5) {
        phFlag = true;
      }
    }

    // TDS flag: above 500 mg/L (0 is treated as unverified/missing)
    let tdsFlag = false;
    if (tds !== null && tds > 500) {
      tdsFlag = true;
    }

    // Needs review: true if either flag is true
    const needsReview = phFlag || tdsFlag;

    const row = [
      `"${st.stationName}"`,
      `"${st.agency}"`,
      `"${st.state}"`,
      `"${st.district}"`,
      `"${st.tehsil}"`,
      `"${st.block}"`,
      `"${st.village}"`,
      st.latitude,
      st.longitude,
      `"${samplingTime}"`,
      ph !== null ? ph : '',
      tds !== null ? tds : '',
      ec !== null ? ec : '',
      chloride !== null ? chloride : '',
      fluoride !== null ? fluoride : '',
      nitrate !== null ? nitrate : '',
      sulphate !== null ? sulphate : '',
      hardness !== null ? hardness : '',
      calcium !== null ? calcium : '',
      magnesium !== null ? magnesium : '',
      phFlag ? 'TRUE' : 'FALSE',
      tdsFlag ? 'TRUE' : 'FALSE',
      needsReview ? 'TRUE' : 'FALSE'
    ];

    resultsRows.push(row.join(','));
    if (needsReview) {
      alertsRows.push(row.join(','));
    }
  }

  // Write files
  const resultsContent = [headers.join(','), ...resultsRows].join('\n');
  const alertsContent = [headers.join(','), ...alertsRows].join('\n');

  fs.writeFileSync(resultsPath, resultsContent, 'utf8');
  fs.writeFileSync(alertsPath, alertsContent, 'utf8');

  console.log(`Successfully generated:`);
  console.log(`- ${resultsPath}: ${resultsRows.length} records`);
  console.log(`- ${alertsPath}: ${alertsRows.length} flagged alert records`);

  return {
    resultsCount: resultsRows.length,
    alertsCount: alertsRows.length,
    stationsCount: stationPool.length
  };
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('generateData.js')) {
  generateCGWBMaharashtraData(18249);
}
