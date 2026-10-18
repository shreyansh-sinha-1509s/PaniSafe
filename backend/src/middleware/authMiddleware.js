import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) return 'panisafe-ibm-z-datathon-secret-key-2026';
  let str = String(raw).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str || 'panisafe-ibm-z-datathon-secret-key-2026';
}

/**
 * Middleware to protect admin-only endpoints.
 * Extracts token from HTTP-only cookie 'panisafe_admin_token' or Authorization header.
 * Rejects unauthenticated requests with HTTP 401.
 */
export function verifyAdmin(req, res, next) {
  let token = null;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.panisafe_admin_token) {
    token = req.cookies.panisafe_admin_token;
  }

  // 2. Fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access denied: Administrator authentication required to access this endpoint.'
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const isAuthorized = decoded && (
      decoded.role === 'admin' ||
      decoded.role === 'judge' ||
      decoded.accountType === 'judge' ||
      decoded.accountType === 'primary_admin' ||
      decoded.email === 'admin@panisafe.in' ||
      decoded.email === 'judge@panisafe.in'
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Admin or Judge role authorization required.'
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token Expired',
        message: 'Your administrator session has expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Authentication failed: Invalid credentials token provided.'
    });
  }
}
