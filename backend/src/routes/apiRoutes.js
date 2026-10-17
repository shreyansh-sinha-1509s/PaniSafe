import express from 'express';
import {
  getHealth,
  getSummary,
  getRecords,
  getRecordById,
  getDistricts,
  getStations,
  getStationDetails,
  getAlerts,
  getTrends,
  getMetadata,
  exportCsv,
  submitFeedback
} from '../controllers/apiController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/summary', getSummary);
router.get('/records', getRecords);
router.get('/records/:id', getRecordById);
router.get('/districts', getDistricts);
router.get('/stations', getStations);
router.get('/stations/:id', getStationDetails);
router.get('/alerts', getAlerts);
router.get('/trends', getTrends);
router.get('/metadata', getMetadata);
router.get('/export', exportCsv);
router.post('/feedback', submitFeedback);

export default router;
