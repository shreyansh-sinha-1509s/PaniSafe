import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dataService } from '../services/dataService.js';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FEEDBACK_FILE = path.join(__dirname, '../../data/feedback.json');

// Ensure feedback storage exists
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf8');
}

export const getHealth = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      architecture: process.arch, // s390x, x64, arm64
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime())
    },
    dataEngine: {
      isLoaded: dataService.isLoaded,
      loadError: dataService.loadError,
      benchmarkMode: dataService.isSimulatedBenchmark,
      totalRecordsLoaded: dataService.records.length,
      stationsIndexed: dataService.stations.size,
      districtsCovered: dataService.districts.size
    }
  });
};

export const getSummary = (req, res) => {
  try {
    if (!dataService.isLoaded) {
      return res.status(503).json({ error: 'Data engine not loaded', details: dataService.loadError });
    }
    res.json({
      success: true,
      data: {
        summary: dataService.summary,
        histograms: {
          ph: dataService.phHistogram,
          tds: dataService.tdsHistogram
        },
        metadata: dataService.metadata
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve summary', message: err.message });
  }
};

export const getRecords = (req, res) => {
  try {
    const result = dataService.queryRecords(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query records', message: err.message });
  }
};

export const getRecordById = (req, res) => {
  try {
    const record = dataService.records.find(r => r.id === req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found', id: req.params.id });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve record', message: err.message });
  }
};

export const getDistricts = (req, res) => {
  try {
    res.json({
      success: true,
      count: dataService.districtList.length,
      data: dataService.districtList
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve districts', message: err.message });
  }
};

export const getStations = (req, res) => {
  try {
    const stations = dataService.getStationsList(req.query);
    res.json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stations', message: err.message });
  }
};

export const getStationDetails = (req, res) => {
  try {
    const station = dataService.getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found', stationId: req.params.id });
    }
    res.json({ success: true, data: station });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve station details', message: err.message });
  }
};

export const getAlerts = (req, res) => {
  try {
    const result = dataService.getAlerts(req.query);
    res.json({
      success: true,
      ...result,
      screeningStats: {
        totalFlagged: dataService.summary.needsReviewCount,
        phFlags: dataService.summary.phFlagCount,
        tdsFlags: dataService.summary.tdsFlagCount,
        bothFlags: dataService.summary.bothFlagsCount,
        totalRecords: dataService.summary.totalRecords
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve alerts', message: err.message });
  }
};

export const getTrends = (req, res) => {
  try {
    res.json({
      success: true,
      data: dataService.trends
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve trends', message: err.message });
  }
};

export const getMetadata = (req, res) => {
  try {
    res.json({
      success: true,
      data: dataService.metadata
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve metadata', message: err.message });
  }
};

export const exportCsv = (req, res) => {
  try {
    const csvContent = dataService.exportCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pani_safe_export.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Export failed', message: err.message });
  }
};

export const submitFeedback = (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Name, email, and message are required fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Please provide a valid email address.'
      });
    }

    const feedbackEntry = {
      id: `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      category: category || 'General',
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'Received',
      storedLocally: true
    };

    let entries = [];
    if (fs.existsSync(FEEDBACK_FILE)) {
      try {
        entries = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
      } catch {
        entries = [];
      }
    }

    entries.push(feedbackEntry);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), 'utf8');

    res.status(201).json({
      success: true,
      message: 'Feedback received and securely logged for technical review.',
      referenceId: feedbackEntry.id,
      note: 'Stored in local audit repository. No mock external email was transmitted.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Feedback submission failed', message: err.message });
  }
};
