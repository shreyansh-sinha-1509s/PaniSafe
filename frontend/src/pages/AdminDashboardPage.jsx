import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminInquiries,
  fetchAdminInquiryById,
  updateAdminInquiryStatus,
  recordAdminInquiryReply
} from '../services/api';
import AlertNotice from '../components/AlertNotice';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  User,
  FileText,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Data Issue',
  'Groundwater Concern',
  'Technical Problem',
  'General Question'
];

const STATUSES = ['All', 'New', 'In Progress', 'Resolved'];

export default function AdminDashboardPage({ navigate }) {
  const { isAuthenticated, isAdmin, loading: authLoading, logout, token, user } = useAuth();

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Inquiry for Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch inquiries from backend
  const loadInquiries = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await fetchAdminInquiries(params, token);

      if (res.success) {
        setInquiries(res.data || []);
        if (res.counts) setCounts(res.counts);
        if (res.pagination) setPagination(res.pagination);
      } else {
        throw new Error(res.message || 'Failed to load inquiries.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with inquiry database.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, search, selectedCategory, selectedStatus, startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInquiries(1);
    }
  }, [isAuthenticated, loadInquiries]);

  // Open inquiry detail modal
  const handleOpenDetail = async (inquiryId) => {
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);
    setSelectedInquiry(null);

    try {
      const res = await fetchAdminInquiryById(inquiryId, token);
      if (res.success && res.data) {
        setSelectedInquiry(res.data);
        setNewStatus(res.data.status || 'New');
        setReplyText(res.data.adminReply || '');
      } else {
        throw new Error(res.message || 'Could not load inquiry details.');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to load inquiry record.');
    } finally {
      setModalLoading(false);
    }
  };

  // Update inquiry status
  const handleStatusChange = async (targetStatus) => {
    if (!selectedInquiry) return;
    setUpdating(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await updateAdminInquiryStatus(selectedInquiry.inquiryId, targetStatus, token);
      if (res.success) {
        setModalSuccess(`Status updated to "${targetStatus}".`);
        setSelectedInquiry(prev => ({ ...prev, status: targetStatus, updatedAt: new Date().toISOString() }));
        loadInquiries(pagination.page);
      } else {
        throw new Error(res.message || 'Status update failed.');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  // Record internal reply
  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    if (!replyText.trim()) {
      setModalError('Please enter a reply note before saving.');
      return;
    }

    setUpdating(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await recordAdminInquiryReply(
        selectedInquiry.inquiryId,
        replyText.trim(),
        newStatus,
        token
      );

      if (res.success) {
        setModalSuccess('Internal reply saved to database successfully.');
        const updatedDoc = res.data || {};
        setSelectedInquiry(prev => ({
          ...prev,
          adminReply: replyText.trim(),
          status: newStatus,
          repliedAt: new Date().toISOString(),
          repliedBy: updatedDoc.repliedBy || user?.email || 'admin@panisafe.in',
          updatedAt: new Date().toISOString()
        }));
        loadInquiries(pagination.page);
      } else {
        throw new Error(res.message || 'Failed to save reply.');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to record reply.');
    } finally {
      setUpdating(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setStartDate('');
    setEndDate('');
  };

  // Render unauthorized guard
  if (authLoading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <p style={{ color: '#64748B' }}>Verifying Administrator Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="page-container">
        <div className="container" style={{ maxWidth: '520px', paddingTop: '50px' }}>
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <ShieldAlert size={30} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F382A', marginBottom: '8px' }}>
              Administrator Authentication Required
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
              The inquiries management portal is strictly restricted to authenticated administrators. Unauthenticated access is denied on both the client and server.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', gap: '8px' }}
            >
              <ShieldAlert size={16} />
              <span>Sign In as Administrator</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0D9488', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              <Database size={16} />
              <span>MongoDB Atlas Persistent Inquiries</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0F382A', margin: 0 }}>
              {user?.role === 'judge' || user?.accountType === 'judge' || user?.email === 'judge@panisafe.in'
                ? 'Judge Evaluation — Inquiries Portal'
                : 'Admin Inquiries Dashboard'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px', margin: 0 }}>
              Logged in as <strong style={{ color: '#0F766E' }}>{user?.email || 'admin@panisafe.in'}</strong> • {user?.role === 'judge' || user?.accountType === 'judge' || user?.email === 'judge@panisafe.in' ? 'Judge Evaluation Session' : 'Administrator Session'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => loadInquiries(pagination.page)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Refresh database records"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626' }}
              title="Sign out of administrative session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Total Inquiries
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F382A', marginTop: '6px' }}>
              {counts.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0D9488', marginTop: '4px' }}>
              Persistent in MongoDB
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #EAB308' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#854D0E', textTransform: 'uppercase' }}>
              New Inquiries
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A16207', marginTop: '6px' }}>
              {counts.new}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Pending triage / review
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF', textTransform: 'uppercase' }}>
              In Progress
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1D4ED8', marginTop: '6px' }}>
              {counts.inProgress}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Under active investigation
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065F46', textTransform: 'uppercase' }}>
              Resolved
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', marginTop: '6px' }}>
              {counts.resolved}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Reviewed & reply saved
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end'
          }}>
            {/* Search */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                  placeholder="ID, name, email, subject, text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadInquiries(1)}
                />
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Status</label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Date Range: Start */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>From Date</label>
              <input
                type="date"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Date Range: End */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>To Date</label>
              <input
                type="date"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Filter Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => loadInquiries(1)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, gap: '6px' }}
              >
                <Filter size={14} />
                <span>Apply</span>
              </button>
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                title="Reset filters"
              >
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <AlertNotice type="danger" title="Database Access Notice">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span>{error}</span>
                <span style={{ fontSize: '0.8rem', color: '#B91C1C' }}>
                  If MongoDB Atlas is not yet configured, verify that MONGODB_URI and MONGODB_DB_NAME are set in your deployment environment variables.
                </span>
              </div>
            </AlertNotice>
          </div>
        )}

        {/* Inquiries Table Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAF9'
          }}>
            <div style={{ fontWeight: 700, color: '#0F382A', fontSize: '0.95rem' }}>
              Inquiries Records ({pagination.total})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Querying MongoDB Atlas collection...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquare size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '1rem' }}>No Inquiries Found</div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '400px', margin: '6px auto 0 auto' }}>
                {search || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'No records match your selected search or filter criteria.'
                  : 'No customer inquiries have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tracking ID & Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Submitter</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category & Location</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => {
                    const statusColor =
                      inq.status === 'Resolved' ? { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' } :
                      inq.status === 'In Progress' ? { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' } :
                      { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };

                    return (
                      <tr
                        key={inq.inquiryId || inq._id}
                        style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F766E' }}>
                            {inq.inquiryId}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0F382A' }}>{inq.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{inq.email}</div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#F1F5F9',
                            color: '#334155',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {inq.category}
                          </span>
                          {inq.location && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} />
                              <span>{inq.location}</span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {inq.subject}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {inq.message}
                          </div>
                          {inq.adminReply && (
                            <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={11} />
                              <span>Has internal reply</span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {inq.status || 'New'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenDetail(inq.inquiryId)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Eye size={13} />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAF9'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Showing {inquiries.length} of {pagination.total} inquiries
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => loadInquiries(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 12px', gap: '4px' }}
              >
                <ChevronLeft size={15} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => loadInquiries(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 12px', gap: '4px' }}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Detail & Reply Modal Drawer */}
        {selectedInquiry && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: '#0F766E' }}>
                      {selectedInquiry.inquiryId}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: selectedInquiry.status === 'Resolved' ? '#DCFCE7' : selectedInquiry.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7',
                      color: selectedInquiry.status === 'Resolved' ? '#166534' : selectedInquiry.status === 'In Progress' ? '#1E40AF' : '#92400E'
                    }}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    Submitted {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px' }}>
                {modalError && (
                  <div style={{ marginBottom: '16px' }}>
                    <AlertNotice type="danger" title="Action Error">
                      {modalError}
                    </AlertNotice>
                  </div>
                )}

                {modalSuccess && (
                  <div style={{ marginBottom: '16px' }}>
                    <AlertNotice type="success" title="Success">
                      {modalSuccess}
                    </AlertNotice>
                  </div>
                )}

                {/* Submitter Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: '#F8FAF9',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Submitter Name</div>
                    <div style={{ fontWeight: 600, color: '#0F382A', marginTop: '2px' }}>
                      {selectedInquiry.name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Email Address</div>
                    <div style={{ fontWeight: 600, color: '#0F382A', marginTop: '2px' }}>
                      <a href={`mailto:${selectedInquiry.email}`} style={{ color: '#0D9488', textDecoration: 'none' }}>
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category</div>
                    <div style={{ fontWeight: 600, color: '#0F382A', marginTop: '2px' }}>
                      {selectedInquiry.category}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>District / Location</div>
                    <div style={{ fontWeight: 600, color: '#0F382A', marginTop: '2px' }}>
                      {selectedInquiry.location || 'Not Specified'}
                    </div>
                  </div>
                </div>

                {/* Subject & Message */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Subject
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F382A', marginBottom: '12px' }}>
                    {selectedInquiry.subject}
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Inquiry Message
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #DDE5E1',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#334155',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Quick Status Update Selector */}
                <div style={{
                  padding: '16px',
                  background: '#F1F5F9',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>
                      Change Investigation Status
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Update the triage phase for this inquiry
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['New', 'In Progress', 'Resolved'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        disabled={updating || selectedInquiry.status === st}
                        className={selectedInquiry.status === st ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Internal Reply Form */}
                <form onSubmit={handleSaveReply}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Internal Recorded Reply & Audit Notes
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        MongoDB Persistent Record
                      </span>
                    </div>

                    <div style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.75rem',
                      color: '#92400E',
                      marginBottom: '10px'
                    }}>
                      <strong>Notice: </strong>
                      External SMTP email delivery is not configured. Replies saved here are strictly recorded internally in the persistent MongoDB Atlas database for administrative logging and audit tracking.
                    </div>

                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Record investigation findings, resolution notes, or administrative reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>

                  {selectedInquiry.adminReply && selectedInquiry.repliedAt && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748B',
                      marginBottom: '16px',
                      padding: '8px 12px',
                      background: '#F8FAF9',
                      borderRadius: '6px'
                    }}>
                      Last recorded reply saved by <strong>{selectedInquiry.repliedBy || 'Administrator'}</strong> on {new Date(selectedInquiry.repliedAt).toLocaleString('en-IN')}.
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updating}
                      style={{ gap: '6px' }}
                    >
                      <Send size={15} />
                      <span>{updating ? 'Saving to Database...' : 'Save Internal Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
