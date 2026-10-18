import assert from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'node:url';

import cookieParser from 'cookie-parser';
import apiRoutes from '../src/routes/apiRoutes.js';
import authRoutes from '../src/routes/authRoutes.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import inquiryRoutes from '../src/routes/inquiryRoutes.js';
import { dataService } from '../src/services/dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5099';

// Setup Express app instance for test
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

let server;
let baseUrl;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          // not json
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      const payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

test('Pani Safe Test Suite: Data Engine & REST API Verification', async (t) => {
  await t.test('1. Initialize Data Service and verify deterministic metrics', () => {
    dataService.init();
    assert.strictEqual(dataService.isLoaded, true, 'Data service should be loaded');
    assert.strictEqual(dataService.records.length, 18249, 'Should load exactly 18,249 records');
    assert.strictEqual(dataService.stations.size, 1804, 'Should index exactly 1,804 unique stations');
    assert.strictEqual(dataService.districts.size, 36, 'Should cover all 36 Maharashtra districts');
    assert.strictEqual(dataService.summary.needsReviewCount, 2865, 'Should flag exactly 2,865 records');
    assert.strictEqual(dataService.summary.phFlagCount, 1122, 'Should flag exactly 1,122 pH exceedances');
    assert.strictEqual(dataService.summary.tdsFlagCount, 2223, 'Should flag exactly 2,223 TDS exceedances');
    assert.strictEqual(dataService.summary.bothFlagsCount, 480, 'Should have exactly 480 dual-flagged records');
    assert.strictEqual(dataService.metadata.isSynthetic, true, 'Metadata must explicitly indicate synthetic provenance');
  });

  await t.test('2. Start Server on ephemeral test port', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
    assert.ok(baseUrl, 'Server should have a valid base URL');
  });

  await t.test('3. GET /api/health telemetry check', async () => {
    const res = await makeRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.status, 'healthy');
    assert.strictEqual(res.json.eventCode, 'SSF2026');
    assert.strictEqual(res.json.dataEngine.isLoaded, true);
    assert.strictEqual(res.json.dataEngine.totalRecordsLoaded, 18249);
    assert.strictEqual(res.json.dataEngine.stationsIndexed, 1804);
    assert.strictEqual(res.json.dataEngine.isSyntheticData, true);
    assert.ok(res.json.system.architecture, 'Architecture should be reported');
  });

  await t.test('4. GET /api/summary returns complete statistical distributions', async () => {
    const res = await makeRequest('/api/summary');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.data.summary.totalRecords, 18249);
    assert.strictEqual(res.json.data.summary.totalDistricts, 36);
    assert.strictEqual(res.json.data.histograms.ph.length, 8);
    assert.strictEqual(res.json.data.histograms.tds.length, 6);
  });

  await t.test('5. GET /api/records supports search, pagination and filtering', async () => {
    const res = await makeRequest('/api/records?limit=10&page=1&district=Pune');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.records.length, 10);
    assert.strictEqual(res.json.pagination.page, 1);
    assert.strictEqual(res.json.pagination.limit, 10);
    assert.ok(res.json.pagination.total > 0);
  });

  await t.test('6. GET /api/records/:id retrieves single sample', async () => {
    const res = await makeRequest('/api/records/REC-1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.data.id, 'REC-1');
  });

  await t.test('7. GET /api/districts aggregates district figures', async () => {
    const res = await makeRequest('/api/districts');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.count, 36);
  });

  await t.test('8. GET /api/stations retrieves station index for GIS mapping', async () => {
    const res = await makeRequest('/api/stations?onlyValidCoords=true');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.count, 1804);
  });

  await t.test('9. GET /api/stations/:id retrieves station timeline', async () => {
    const stationId = dataService.records[0].stationId;
    const res = await makeRequest(`/api/stations/${stationId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.data.stationId, stationId);
    assert.ok(res.json.data.records.length > 0);
    assert.ok(res.json.data.missingParametersSummary);
  });

  await t.test('10. GET /api/alerts returns screening review queue', async () => {
    const res = await makeRequest('/api/alerts?limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.screeningStats.totalFlagged, 2865);
    res.json.records.forEach(r => {
      assert.strictEqual(r.needsReview, true);
    });
  });

  await t.test('11. GET /api/trends returns yearly trend summaries', async () => {
    const res = await makeRequest('/api/trends');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.data.length > 0);
  });

  await t.test('12. GET /api/metadata confirms IS 10500 standards alignment', async () => {
    const res = await makeRequest('/api/metadata');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.data.isSynthetic, true);
    assert.ok(res.json.data.screeningRules.phStandard.includes('BIS IS 10500:2012'));
  });

  await t.test('13. GET /api/export generates CSV stream with synthetic provenance header', async () => {
    const res = await makeRequest('/api/export?district=Akola');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'text/csv; charset=utf-8');
    assert.ok(res.body.includes('Synthetic Demonstration Dataset'));
    assert.ok(res.body.includes('Data_Provenance'));
  });

  await t.test('14. POST /api/feedback validates and stores feedback entry', async () => {
    const payload = {
      name: 'Dr. Ramesh Patil',
      email: 'ramesh.patil@example.in',
      subject: 'Station Disambiguation Question',
      category: 'Data Methodology',
      message: 'Verified composite key logic against local taluka records.'
    };
    const res = await makeRequest('/api/feedback', { method: 'POST', body: payload });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.referenceId.startsWith('FB-'));
  });

  await t.test('15. POST /api/feedback rejects invalid email format', async () => {
    const payload = {
      name: 'Invalid Test',
      email: 'not-an-email',
      message: 'Test message'
    };
    const res = await makeRequest('/api/feedback', { method: 'POST', body: payload });
    assert.strictEqual(res.status, 400);
  });

  await t.test('16. POST /api/auth/login authenticates demo analyst', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'analyst.demo@panisafe.in',
        password: 'Datathon2026!'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.user.isDemoAccount, true);

    // Test GET /api/auth/me with token
    const meRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${res.json.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.json.user.email, 'analyst.demo@panisafe.in');
  });

  await t.test('17. POST /api/admin/login authenticates Judge account', async () => {
    const res = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: {
        email: 'judge@panisafe.in',
        password: 'judge@159'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.admin.email, 'judge@panisafe.in');
    assert.strictEqual(res.json.admin.role, 'judge');
    assert.strictEqual(res.json.admin.accountType, 'judge');
  });

  await t.test('18. POST /api/admin/login authenticates Admin account', async () => {
    const res = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: {
        email: 'admin@panisafe.in',
        password: 'admin@159'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.admin.email, 'admin@panisafe.in');
    assert.strictEqual(res.json.admin.role, 'admin');
    assert.strictEqual(res.json.admin.accountType, 'primary_admin');
  });

  await t.test('19. POST /api/admin/login rejects invalid credentials', async () => {
    const res = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: {
        email: 'admin@panisafe.in',
        password: 'wrong_password_123'
      }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.json.success, false);
  });

  await t.test('20. POST /api/auth/login authenticates Judge account', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'judge@panisafe.in',
        password: 'judge@159'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.user.email, 'judge@panisafe.in');
  });

  await t.test('21. POST /api/auth/login authenticates Admin account', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@panisafe.in',
        password: 'admin@159'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.token);
    assert.strictEqual(res.json.user.email, 'admin@panisafe.in');
  });

  await t.test('22. GET /api/admin/inquiries retrieves inquiries without crashing', async () => {
    const loginRes = await makeRequest('/api/admin/login', {
      method: 'POST',
      body: {
        email: 'judge@panisafe.in',
        password: 'judge@159'
      }
    });
    const token = loginRes.json.token;
    const inqRes = await makeRequest('/api/admin/inquiries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(inqRes.status, 200);
    assert.strictEqual(inqRes.json.success, true);
    assert.ok(Array.isArray(inqRes.json.data));
  });

  await t.test('23. GET / serves production frontend HTML', async () => {
    const res = await makeRequest('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes('<div id="root">') || res.body.includes('<!DOCTYPE html>'));
  });

  await t.test('Cleanup: Close HTTP Server', async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });
});
