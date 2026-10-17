import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'panisafe-ibm-z-datathon-secret-key-2026';

// Initialize users file with demo analyst account if not present
function initializeUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    // Salt & hash demo password
    const salt = bcrypt.genSaltSync(10);
    const demoHashedPassword = bcrypt.hashSync('Datathon2026!', salt);

    const initialUsers = [
      {
        id: 'usr_demo_01',
        fullName: 'Dr. Ananya Deshmukh (Demo)',
        email: 'analyst.demo@panisafe.in',
        passwordHash: demoHashedPassword,
        role: 'Environmental Analyst',
        organization: 'Independent Water Quality Researcher',
        isDemoAccount: true,
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf8');
  }
}

initializeUsers();

function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export const register = async (req, res) => {
  try {
    const { fullName, email, password, organization } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'Research Practitioner',
      organization: (organization || 'Academic / Environmental Citizen').trim(),
      isDemoAccount: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName, isDemoAccount: newUser.isDemoAccount },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        organization: newUser.organization,
        isDemoAccount: newUser.isDemoAccount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, isDemoAccount: user.isDemoAccount },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization,
        isDemoAccount: user.isDemoAccount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
};

export const getMe = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization,
        isDemoAccount: user.isDemoAccount,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token', message: err.message });
  }
};
