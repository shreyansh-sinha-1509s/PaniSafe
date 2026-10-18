import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInquiriesCollection, isDbConfigured, sanitizeMongoUri } from '../config/db.js';
import { ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FEEDBACK_FILE = path.join(__dirname, '../../data/feedback.json');

const VALID_CATEGORIES = [
  'Data Issue',
  'Groundwater Concern',
  'Technical Problem',
  'General Question'
];

const VALID_STATUSES = ['New', 'In Progress', 'Resolved'];

/**
 * Generate human-readable unique inquiry tracking ID
 * Format: INQ-YYYYMMDD-XXXXX
 */
function generateInquiryId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INQ-${dateStr}-${rand}`;
}

/**
 * Safe database diagnostic hint for administrators without exposing secrets.
 */
function getSafeDbErrorHint(err) {
  if (!err) return undefined;
  const msg = String(err.message || err);
  if (msg.includes('bad auth') || msg.includes('authentication failed')) {
    return 'Database authentication failed: verify username/password in MongoDB Atlas Database Access and check for unencoded special characters in MONGODB_URI.';
  }
  if (msg.includes('SSL') || msg.includes('alert number 80') || msg.includes('Server selection timed out')) {
    return 'Database network connection failed: verify MongoDB Atlas Network Access IP Access List (0.0.0.0/0).';
  }
  return undefined;
}

/**
 * Helper to retrieve local feedback items formatted as standard inquiries
 */
function getLocalFeedbackInquiries() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
      if (Array.isArray(data)) {
        return data.map((item, idx) => ({
          _id: item.id || `local_${idx}`,
          inquiryId: item.id || `INQ-LOCAL-${idx}`,
          name: item.name || 'Citizen Inquirer',
          email: item.email || 'feedback@panisafe.in',
          category: item.category || 'General Question',
          location: item.location || 'Maharashtra',
          subject: item.subject || 'Groundwater Feedback',
          message: item.message || '',
          createdAt: item.submittedAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.submittedAt || new Date().toISOString(),
          status: item.status === 'Received' ? 'New' : (item.status || 'New'),
          adminReply: item.adminReply || null,
          repliedAt: item.repliedAt || null,
          repliedBy: item.repliedBy || null
        }));
      }
    }
  } catch (e) {
    console.warn('[INQUIRY CONTROLLER] Could not read local feedback backup:', e.message);
  }
  return [];
}

/**
 * Helper to update local feedback items
 */
function saveLocalFeedbackInquiry(inquiryDoc) {
  try {
    const list = getLocalFeedbackInquiries();
    const existingIndex = list.findIndex(i => i.inquiryId === inquiryDoc.inquiryId);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...inquiryDoc };
    } else {
      list.unshift(inquiryDoc);
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('[INQUIRY CONTROLLER] Could not save local feedback backup:', e.message);
  }
}

/**
 * POST /api/inquiries (and /api/feedback alias)
 * Public endpoint to submit a groundwater technical inquiry.
 * Validates inputs, filters spam honeypots, and persists to MongoDB Atlas inquiries collection
 * with resilient local backup storage.
 */
export async function createInquiry(req, res) {
  try {
    const { name, email, category, location, subject, message, honeypot, website } = req.body;

    // 1. Spam Honeypot Protection
    if ((honeypot && String(honeypot).trim().length > 0) || (website && String(website).trim().length > 0)) {
      console.warn('[SPAM DETECTED] Honeypot field was populated. Rejecting inquiry submission.');
      return res.status(400).json({
        success: false,
        error: 'Spam Detected',
        message: 'Automated submission rejected by security filter.'
      });
    }

    // 2. Strict Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Name is required and must be between 2 and 100 characters.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please provide a valid email address.'
      });
    }

    if (!category || !VALID_CATEGORIES.includes(category.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Inquiry category must be one of: ${VALID_CATEGORIES.join(', ')}.`
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Subject is required and must be between 3 and 150 characters.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Message is required and must be between 10 and 3,000 characters.'
      });
    }

    const cleanLocation = location && typeof location === 'string' ? location.trim().slice(0, 100) : null;
    const inquiryId = generateInquiryId();
    const nowIso = new Date().toISOString();

    const inquiryDoc = {
      id: inquiryId,
      inquiryId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category.trim(),
      location: cleanLocation,
      subject: subject.trim(),
      message: message.trim(),
      createdAt: nowIso,
      submittedAt: nowIso,
      updatedAt: nowIso,
      status: 'New',
      adminReply: null,
      repliedAt: null,
      repliedBy: null
    };

    // Save to local backup store
    saveLocalFeedbackInquiry(inquiryDoc);

    // Attempt persistence in MongoDB Atlas if configured
    let persistedInAtlas = false;
    if (isDbConfigured()) {
      try {
        const collection = await getInquiriesCollection();
        const insertResult = await collection.insertOne(inquiryDoc);
        if (insertResult.acknowledged) {
          persistedInAtlas = true;
        }
      } catch (dbErr) {
        console.warn('[INQUIRY WARNING] Could not persist to Atlas, saved in local backup:', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been successfully recorded in the PaniSafe database.',
      inquiryId,
      referenceId: inquiryId,
      status: 'New',
      createdAt: nowIso,
      isPersistent: persistedInAtlas
    });
  } catch (err) {
    const safeErrorMsg = sanitizeMongoUri(err.message || String(err));
    console.error('[CREATE INQUIRY ERROR]', safeErrorMsg);
    return res.status(500).json({
      success: false,
      error: 'Submission Error',
      message: 'Failed to record inquiry. Please try again later.'
    });
  }
}

/**
 * GET /api/admin/inquiries
 * Protected endpoint for administrators to list, filter, search, and paginate saved inquiries.
 */
export async function listInquiries(req, res) {
  try {
    const { status, category, search, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

    // Try querying MongoDB Atlas first
    if (isDbConfigured()) {
      try {
        const collection = await getInquiriesCollection();
        const filter = {};

        if (status && status !== 'all' && VALID_STATUSES.includes(status)) {
          filter.status = status;
        }

        if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
          filter.category = category;
        }

        if (search && String(search).trim().length > 0) {
          const q = String(search).trim();
          const regex = new RegExp(q, 'i');
          filter.$or = [
            { inquiryId: regex },
            { name: regex },
            { email: regex },
            { subject: regex },
            { location: regex },
            { message: regex }
          ];
        }

        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate).toISOString();
          if (endDate) {
            const endD = new Date(endDate);
            endD.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = endD.toISOString();
          }
        }

        const total = await collection.countDocuments(filter);
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;

        const inquiries = await collection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const [newCount, inProgressCount, resolvedCount, allTotal] = await Promise.all([
          collection.countDocuments({ status: 'New' }),
          collection.countDocuments({ status: 'In Progress' }),
          collection.countDocuments({ status: 'Resolved' }),
          collection.countDocuments({})
        ]);

        return res.json({
          success: true,
          data: inquiries,
          pagination: { page, limit, total, totalPages },
          counts: {
            total: allTotal,
            new: newCount,
            inProgress: inProgressCount,
            resolved: resolvedCount
          },
          isPersistent: true
        });
      } catch (atlasErr) {
        console.warn('[INQUIRIES LIST] MongoDB Atlas query failed, falling back to local records:', atlasErr.message);
      }
    }

    // Fallback: Query local backup inquiries
    let localList = getLocalFeedbackInquiries();

    if (status && status !== 'all') {
      localList = localList.filter(i => i.status === status);
    }
    if (category && category !== 'all') {
      localList = localList.filter(i => i.category === category);
    }
    if (search && String(search).trim().length > 0) {
      const q = String(search).trim().toLowerCase();
      localList = localList.filter(i =>
        (i.inquiryId && i.inquiryId.toLowerCase().includes(q)) ||
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.subject && i.subject.toLowerCase().includes(q)) ||
        (i.message && i.message.toLowerCase().includes(q))
      );
    }
    if (startDate) {
      localList = localList.filter(i => new Date(i.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      localList = localList.filter(i => new Date(i.createdAt) <= endD);
    }

    localList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = localList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const paged = localList.slice(skip, skip + limit);

    const allLocal = getLocalFeedbackInquiries();
    const newCount = allLocal.filter(i => i.status === 'New').length;
    const inProgressCount = allLocal.filter(i => i.status === 'In Progress').length;
    const resolvedCount = allLocal.filter(i => i.status === 'Resolved').length;

    return res.json({
      success: true,
      data: paged,
      pagination: { page, limit, total, totalPages },
      counts: {
        total: allLocal.length,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      },
      isPersistent: false
    });
  } catch (err) {
    console.error('[LIST INQUIRIES FATAL]', err);
    return res.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      counts: { total: 0, new: 0, inProgress: 0, resolved: 0 },
      isPersistent: false
    });
  }
}

/**
 * GET /api/admin/inquiries/:id
 * Protected endpoint to fetch full inquiry details.
 */
export async function getInquiryById(req, res) {
  try {
    const { id } = req.params;

    if (isDbConfigured()) {
      try {
        const collection = await getInquiriesCollection();
        let query = { inquiryId: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ inquiryId: id }, { _id: new ObjectId(id) }] };
        }
        const inquiry = await collection.findOne(query);
        if (inquiry) {
          return res.json({ success: true, data: inquiry, isPersistent: true });
        }
      } catch (atlasErr) {
        console.warn('[GET INQUIRY] Atlas query failed, checking local backup:', atlasErr.message);
      }
    }

    const localList = getLocalFeedbackInquiries();
    const localInquiry = localList.find(i => i.inquiryId === id || i._id === id);
    if (localInquiry) {
      return res.json({ success: true, data: localInquiry, isPersistent: false });
    }

    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Inquiry with ID '${id}' was not found.`
    });
  } catch (err) {
    console.error('[GET INQUIRY ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch inquiry', message: err.message });
  }
}

/**
 * PATCH /api/admin/inquiries/:id/status
 * Protected endpoint to update inquiry status ('New', 'In Progress', 'Resolved').
 */
export async function updateInquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`
      });
    }

    const nowIso = new Date().toISOString();
    let updatedDoc = null;

    if (isDbConfigured()) {
      try {
        const collection = await getInquiriesCollection();
        let query = { inquiryId: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ inquiryId: id }, { _id: new ObjectId(id) }] };
        }
        updatedDoc = await collection.findOneAndUpdate(
          query,
          { $set: { status, updatedAt: nowIso } },
          { returnDocument: 'after' }
        );
      } catch (atlasErr) {
        console.warn('[UPDATE INQUIRY STATUS] Atlas update failed, updating local backup:', atlasErr.message);
      }
    }

    // Also update in local backup
    const localList = getLocalFeedbackInquiries();
    const localIndex = localList.findIndex(i => i.inquiryId === id || i._id === id);
    if (localIndex >= 0) {
      localList[localIndex].status = status;
      localList[localIndex].updatedAt = nowIso;
      saveLocalFeedbackInquiry(localList[localIndex]);
      if (!updatedDoc) updatedDoc = localList[localIndex];
    }

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Inquiry with ID '${id}' was not found.`
      });
    }

    return res.json({
      success: true,
      message: `Inquiry status updated to '${status}'.`,
      data: updatedDoc
    });
  } catch (err) {
    console.error('[UPDATE INQUIRY STATUS ERROR]', err);
    return res.status(500).json({ success: false, error: 'Update Failed', message: err.message });
  }
}

/**
 * POST /api/admin/inquiries/:id/reply
 * Protected endpoint to save an internal recorded reply for an inquiry.
 */
export async function recordInquiryReply(req, res) {
  try {
    const { id } = req.params;
    const { replyMessage, status } = req.body;

    if (!replyMessage || typeof replyMessage !== 'string' || replyMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Reply message cannot be empty.'
      });
    }

    const nowIso = new Date().toISOString();
    let updatedDoc = null;

    if (isDbConfigured()) {
      try {
        const collection = await getInquiriesCollection();
        let query = { inquiryId: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ inquiryId: id }, { _id: new ObjectId(id) }] };
        }
        const existing = await collection.findOne(query);
        const newStatus = status && VALID_STATUSES.includes(status)
          ? status
          : (existing?.status === 'New' ? 'In Progress' : (existing?.status || 'In Progress'));

        updatedDoc = await collection.findOneAndUpdate(
          query,
          {
            $set: {
              adminReply: replyMessage.trim(),
              repliedAt: nowIso,
              repliedBy: req.admin?.email || 'admin@panisafe.in',
              status: newStatus,
              updatedAt: nowIso
            }
          },
          { returnDocument: 'after' }
        );
      } catch (atlasErr) {
        console.warn('[RECORD INQUIRY REPLY] Atlas reply failed, updating local backup:', atlasErr.message);
      }
    }

    // Also update in local backup
    const localList = getLocalFeedbackInquiries();
    const localIndex = localList.findIndex(i => i.inquiryId === id || i._id === id);
    if (localIndex >= 0) {
      const existing = localList[localIndex];
      const newStatus = status && VALID_STATUSES.includes(status)
        ? status
        : (existing.status === 'New' ? 'In Progress' : existing.status);

      localList[localIndex] = {
        ...existing,
        adminReply: replyMessage.trim(),
        repliedAt: nowIso,
        repliedBy: req.admin?.email || 'admin@panisafe.in',
        status: newStatus,
        updatedAt: nowIso
      };
      saveLocalFeedbackInquiry(localList[localIndex]);
      if (!updatedDoc) updatedDoc = localList[localIndex];
    }

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Inquiry with ID '${id}' was not found.`
      });
    }

    return res.json({
      success: true,
      message: 'Internal reply recorded successfully.',
      note: 'Internal recorded reply — external email delivery is not configured.',
      data: updatedDoc
    });
  } catch (err) {
    console.error('[RECORD INQUIRY REPLY ERROR]', err);
    return res.status(500).json({ success: false, error: 'Reply Failed', message: err.message });
  }
}
