import { MongoClient } from 'mongodb';

/**
 * Safely clean environment variable string (stripping whitespace and outer quotes if user copy-pasted them)
 */
function cleanEnvValue(val) {
  if (!val) return '';
  let str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Redacts database credentials from MongoDB connection URI for secure server logging.
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  return rawUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

/**
 * Safely inspects MONGODB_URI format anomalies without exposing sensitive characters.
 */
function inspectUriFormat(rawUri) {
  if (!rawUri) return;
  if (/<[^>]+>/.test(rawUri)) {
    console.warn('[DB CONFIG WARNING] MONGODB_URI contains angle brackets ("<" or ">"). If you retained placeholder syntax like <password>, replace it with your actual password (without angle brackets).');
  }
  const atCount = (rawUri.split('@').length - 1);
  if (atCount > 1) {
    console.warn('[DB CONFIG WARNING] MONGODB_URI contains multiple "@" symbols. If your database password contains "@", it must be URL-encoded as "%40".');
  }
}

/**
 * Automatically normalizes common copy-paste issues in MONGODB_URI:
 * 1. Strips angle brackets if user literally typed mongodb+srv://user:<password>@...
 * 2. Strips whitespace and outer quotes
 */
export function autoFixMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  let fixed = cleanEnvValue(rawUri);
  const match = fixed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (match) {
    let [, proto, user, pass, rest] = match;
    if (user.startsWith('<') && user.endsWith('>')) {
      user = user.slice(1, -1);
    }
    if (pass.startsWith('<') && pass.endsWith('>')) {
      pass = pass.slice(1, -1);
    }
    fixed = `${proto}${user}:${pass}@${rest}`;
  }
  return fixed;
}

let client = null;
let clientPromise = null;

/**
 * Returns true if the MongoDB connection URI is configured in environment variables.
 */
export function isDbConfigured() {
  const uri = autoFixMongoUri(process.env.MONGODB_URI);
  return Boolean(uri && uri.length > 0);
}

/**
 * Reusable MongoDB client promise configured for Vercel Serverless & Node.js.
 * Caches the connection promise across lambda invocations to avoid exhausting connection pools.
 */
function getClientPromise() {
  const currentUri = autoFixMongoUri(process.env.MONGODB_URI);
  if (!currentUri || currentUri.length === 0) {
    throw new Error('DatabaseConfigurationError: MONGODB_URI environment variable is not configured. Please configure your MongoDB Atlas connection string in your environment.');
  }

  if (global._mongoClientPromise && global._mongoClientUri === currentUri) {
    return global._mongoClientPromise;
  }

  inspectUriFormat(currentUri);
  const sanitized = sanitizeMongoUri(currentUri);
  console.log(`[DB] Initializing MongoDB client connection to: ${sanitized}`);

  client = new MongoClient(currentUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  global._mongoClientUri = currentUri;
  global._mongoClientPromise = client.connect().catch((err) => {
    // Reset cached promise on failure so subsequent requests can retry cleanly
    global._mongoClientPromise = null;
    const sanitizedMsg = sanitizeMongoUri(err.message || String(err));
    if (sanitizedMsg.includes('bad auth') || sanitizedMsg.includes('authentication failed')) {
      console.error('[DB ERROR] Failed to connect to MongoDB Atlas (bad auth: authentication failed). Verify: 1) The database username and password in Atlas -> Database Access. 2) Ensure special characters in password are URL-encoded (e.g. @ -> %40, # -> %23). 3) Ensure no angle brackets < > surround the password.');
    } else {
      console.error('[DB ERROR] Failed to connect to MongoDB Atlas:', sanitizedMsg);
    }
    throw new Error(`MongoDB connection failed: ${sanitizedMsg}`);
  });

  return global._mongoClientPromise;
}

/**
 * Get active MongoDB database instance
 */
export async function getDb() {
  const connectedClient = await getClientPromise();
  const currentDbName = cleanEnvValue(process.env.MONGODB_DB_NAME) || 'panisafe';
  return connectedClient.db(currentDbName);
}

/**
 * Get the dedicated 'inquiries' collection with background index verification
 */
export async function getInquiriesCollection() {
  const db = await getDb();
  const collection = db.collection('inquiries');

  // Ensure useful indexes in background
  try {
    collection.createIndex({ createdAt: -1 });
    collection.createIndex({ status: 1 });
    collection.createIndex({ category: 1 });
    collection.createIndex({ inquiryId: 1 }, { unique: true, sparse: true });
  } catch (idxErr) {
    // Non-fatal index creation warning
    console.warn('[DB WARNING] Could not ensure indexes:', idxErr.message);
  }

  return collection;
}

/**
 * Graceful close for process termination or testing
 */
export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    global._mongoClientPromise = null;
  }
}
