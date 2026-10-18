const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${BASE_URL}/summary`);
  if (!res.ok) throw new Error('Failed to load summary stats');
  return res.json();
}

export async function fetchRecords(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const res = await fetch(`${BASE_URL}/records?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load records');
  return res.json();
}

export async function fetchRecordById(id) {
  const res = await fetch(`${BASE_URL}/records/${id}`);
  if (!res.ok) throw new Error('Failed to load record');
  return res.json();
}

export async function fetchDistricts() {
  const res = await fetch(`${BASE_URL}/districts`);
  if (!res.ok) throw new Error('Failed to load districts');
  return res.json();
}

export async function fetchStations(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const res = await fetch(`${BASE_URL}/stations?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load stations');
  return res.json();
}

export async function fetchStationById(id) {
  const res = await fetch(`${BASE_URL}/stations/${id}`);
  if (!res.ok) throw new Error('Failed to load station details');
  return res.json();
}

export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load alerts');
  return res.json();
}

export async function fetchTrends() {
  const res = await fetch(`${BASE_URL}/trends`);
  if (!res.ok) throw new Error('Failed to load trends');
  return res.json();
}

export async function fetchMetadata() {
  const res = await fetch(`${BASE_URL}/metadata`);
  if (!res.ok) throw new Error('Failed to load metadata');
  return res.json();
}

export function getExportUrl(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && key !== 'page' && key !== 'limit') {
      query.append(key, val);
    }
  });
  return `${BASE_URL}/export?${query.toString()}`;
}

export async function submitFeedback(payload) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.details || data.error || 'Failed to submit feedback');
  return data;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function registerUser(fullName, email, password, organization) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, organization })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load user');
  return data;
}

// Admin Authentication & Session API
export async function adminLogin(email, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Admin authentication failed');
  return data;
}

export async function adminLogout() {
  const res = await fetch(`${BASE_URL}/admin/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Logout failed');
  return data;
}

export async function fetchAdminMe(token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/admin/me`, {
    credentials: 'include',
    headers
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to verify admin session');
  return data;
}

// Protected Admin Inquiries Management API
export async function fetchAdminInquiries(params = {}, token) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/admin/inquiries?${query.toString()}`, {
    credentials: 'include',
    headers
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to load inquiries');
  return data;
}

export async function fetchAdminInquiryById(id, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/admin/inquiries/${encodeURIComponent(id)}`, {
    credentials: 'include',
    headers
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to load inquiry details');
  return data;
}

export async function updateAdminInquiryStatus(id, status, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/admin/inquiries/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update inquiry status');
  return data;
}

export async function recordAdminInquiryReply(id, replyMessage, status, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/admin/inquiries/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ replyMessage, status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to record reply');
  return data;
}

