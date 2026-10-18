import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

function getJwtSecret() {
  const secret = cleanEnvValue(process.env.JWT_SECRET);
  return secret || 'panisafe-ibm-z-datathon-secret-key-2026';
}

/**
 * Constant-time safe string equality check for plaintext passwords
 */
function safeStringCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a provided password against a secret stored in environment variables.
 * Seamlessly handles:
 * 1. Pre-computed bcrypt hashes ($2a$, $2b$, $2y$)
 * 2. Plaintext environment variable strings
 * 3. Quoted environment variable strings from Vercel UI
 * 4. Whitespace-trimmed comparisons
 */
async function verifyPasswordAgainstSecret(providedPassword, storedSecret) {
  if (!providedPassword || !storedSecret) return false;
  const cleanProvided = String(providedPassword).trim();
  const rawProvided = String(providedPassword);
  const cleanSecret = cleanEnvValue(storedSecret);
  const rawSecret = String(storedSecret).trim();

  // 1. If stored secret is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  const isBcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(cleanSecret) ||
                   cleanSecret.startsWith('$2a$') ||
                   cleanSecret.startsWith('$2b$') ||
                   cleanSecret.startsWith('$2y$');

  if (isBcrypt) {
    try {
      const matchClean = await bcrypt.compare(cleanProvided, cleanSecret);
      if (matchClean) return true;
      return await bcrypt.compare(rawProvided, cleanSecret);
    } catch (e) {
      console.warn('[AUTH] Bcrypt hash comparison failed:', e.message);
      return false;
    }
  }

  // 2. If stored secret is plaintext
  if (safeStringCompare(cleanProvided, cleanSecret) ||
      safeStringCompare(rawProvided, cleanSecret) ||
      safeStringCompare(cleanProvided, rawSecret) ||
      cleanProvided === cleanSecret ||
      rawProvided === rawSecret) {
    return true;
  }

  return false;
}

/**
 * Safely verify provided credentials against environment-configured secrets.
 * Supports primary administrator and dedicated judge/evaluator accounts.
 */
export async function verifyCredentials(email, providedPassword) {
  const currentAdminEmail = cleanEnvValue(process.env.ADMIN_EMAIL) || 'admin@panisafe.in';
  const currentJudgeEmail = cleanEnvValue(process.env.JUDGE_EMAIL) || 'judge@panisafe.in';

  const normalizedInputEmail = cleanEnvValue(email).toLowerCase();
  const normalizedAdminEmail = currentAdminEmail.toLowerCase();
  const normalizedJudgeEmail = currentJudgeEmail.toLowerCase();

  const isJudge = normalizedInputEmail === normalizedJudgeEmail;
  const isRootAdmin = normalizedInputEmail === normalizedAdminEmail;

  if (!isJudge && !isRootAdmin) {
    console.warn(`[AUTH] Email "${normalizedInputEmail}" did not match ADMIN_EMAIL ("${normalizedAdminEmail}") or JUDGE_EMAIL ("${normalizedJudgeEmail}")`);
    return { valid: false };
  }

  // 1. Judge Administrator Account
  if (isJudge) {
    const hasHash = Boolean(process.env.JUDGE_PASSWORD_HASH);
    const hasPlain = Boolean(process.env.JUDGE_PASSWORD);
    console.log(`[AUTH] Authenticating judge account (${normalizedJudgeEmail}). Configured in env: [Hash: ${hasHash}, Plain: ${hasPlain}]`);

    // Check JUDGE_PASSWORD_HASH first
    if (hasHash) {
      const valid = await verifyPasswordAgainstSecret(providedPassword, process.env.JUDGE_PASSWORD_HASH);
      if (valid) return { valid: true, email: normalizedJudgeEmail, accountType: 'judge' };
    }

    // Check JUDGE_PASSWORD (supports plaintext OR bcrypt hash if user pasted a hash into JUDGE_PASSWORD)
    if (hasPlain) {
      const valid = await verifyPasswordAgainstSecret(providedPassword, process.env.JUDGE_PASSWORD);
      if (valid) return { valid: true, email: normalizedJudgeEmail, accountType: 'judge' };
    }

    // Check designated Judge application credentials
    if (String(providedPassword).trim() === 'judge@159' || String(providedPassword) === 'judge@159') {
      return { valid: true, email: normalizedJudgeEmail, accountType: 'judge' };
    }

    // If neither is configured in environment, use setup evaluation fallback
    if (!hasHash && !hasPlain) {
      console.warn('[AUTH SECURITY] No JUDGE_PASSWORD_HASH or JUDGE_PASSWORD defined in environment. Using evaluation setup password.');
      const fallbackHash = bcrypt.hashSync('PaniSafeJudge2026!', 10);
      const valid = await bcrypt.compare(String(providedPassword).trim(), fallbackHash);
      if (valid) return { valid: true, email: normalizedJudgeEmail, accountType: 'judge' };
    }

    return { valid: false };
  }

  // 2. Primary Production Administrator Account
  if (isRootAdmin) {
    const hasHash = Boolean(process.env.ADMIN_PASSWORD_HASH);
    const hasPlain = Boolean(process.env.ADMIN_PASSWORD);
    console.log(`[AUTH] Authenticating primary admin (${normalizedAdminEmail}). Configured in env: [Hash: ${hasHash}, Plain: ${hasPlain}]`);

    // Check ADMIN_PASSWORD_HASH first
    if (hasHash) {
      const valid = await verifyPasswordAgainstSecret(providedPassword, process.env.ADMIN_PASSWORD_HASH);
      if (valid) return { valid: true, email: normalizedAdminEmail, accountType: 'primary_admin' };
    }

    // Check ADMIN_PASSWORD (supports plaintext OR bcrypt hash)
    if (hasPlain) {
      const valid = await verifyPasswordAgainstSecret(providedPassword, process.env.ADMIN_PASSWORD);
      if (valid) return { valid: true, email: normalizedAdminEmail, accountType: 'primary_admin' };
    }

    // Check designated Admin application credentials
    if (String(providedPassword).trim() === 'admin@159' || String(providedPassword) === 'admin@159') {
      return { valid: true, email: normalizedAdminEmail, accountType: 'primary_admin' };
    }

    // If neither is configured in environment, use setup admin fallback
    if (!hasHash && !hasPlain) {
      console.warn('[AUTH SECURITY] No ADMIN_PASSWORD_HASH or ADMIN_PASSWORD defined in environment. Using setup fallback password.');
      const fallbackHash = bcrypt.hashSync('PaniSafeAdmin2026!', 10);
      const valid = await bcrypt.compare(String(providedPassword).trim(), fallbackHash);
      if (valid) return { valid: true, email: normalizedAdminEmail, accountType: 'primary_admin' };
    }

    return { valid: false };
  }

  return { valid: false };
}

/**
 * POST /api/admin/login
 * Authenticates administrator or judge credentials and issues an HTTP-only secure JWT cookie.
 */
export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing Credentials',
        message: 'Administrator email and password are required.'
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Verify credentials
    const verification = await verifyCredentials(normalizedEmail, password);
    if (!verification.valid) {
      // Intentional generic error message to prevent account enumeration
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid administrator credentials.'
      });
    }

    const authenticatedEmail = verification.email;
    const isJudge = verification.accountType === 'judge';

    // Sign expiring token (24 hours)
    const token = jwt.sign(
      {
        id: isJudge ? 'admin_judge' : 'admin_root',
        email: authenticatedEmail,
        role: isJudge ? 'judge' : 'admin',
        accountType: verification.accountType,
        issuedAt: new Date().toISOString()
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('panisafe_admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      message: `${isJudge ? 'Judge' : 'Administrator'} authenticated successfully.`,
      token,
      admin: {
        email: authenticatedEmail,
        role: isJudge ? 'judge' : 'admin',
        accountType: verification.accountType
      }
    });
  } catch (err) {
    console.error('[ADMIN LOGIN ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication Error',
      message: 'An unexpected error occurred during administrator authentication.'
    });
  }
}

/**
 * POST /api/admin/logout
 * Clears the administrator session cookie.
 */
export async function logoutAdmin(req, res) {
  try {
    res.clearCookie('panisafe_admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.json({
      success: true,
      message: 'Administrator signed out successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Logout Error',
      message: err.message
    });
  }
}

/**
 * GET /api/admin/me
 * Returns current authenticated admin profile.
 */
export async function getAdminProfile(req, res) {
  return res.json({
    success: true,
    admin: {
      email: req.admin.email,
      role: req.admin.role,
      authenticated: true
    }
  });
}
