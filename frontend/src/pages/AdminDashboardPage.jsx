import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminInquiries,
  fetchAdminInquiryById,
  updateAdminInquiryStatus,
  recordAdminInquiryReply
} from '../services/api';
import AlertNotice from '../components/AlertNotice';
import MetricCard from '../components/MetricCard';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Mail,
  MapPin,
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
  Activity
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
        <p style={{ color: 'var(--color-text-secondary)' }}>Verifying Administrator Credentials...</p>
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
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <ShieldAlert size={30} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
              Administrator Authentication Required
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
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
      <div className="container">
        {/* Top Header Bar */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#14B8A6', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              <Database size={15} />
              <span>MongoDB Atlas Persistent Inquiries</span>
            </div>
            <h1 className="page-title">
              {user?.role === 'judge' || user?.accountType === 'judge' || user?.email === 'judge@panisafe.in'
                ? 'Judge Evaluation — Inquiries Portal'
                : 'Admin Inquiries Dashboard'}
            </h1>
            <p className="page-subtitle">
              Logged in as <strong style={{ color: '#14B8A6' }}>{user?.email || 'admin@panisafe.in'}</strong> • {user?.role === 'judge' || user?.accountType === 'judge' || user?.email === 'judge@panisafe.in' ? 'Judge Evaluation Session' : 'Administrator Session'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => loadInquiries(pagination.page)}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Sign out of administrative session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Inquiries"
            value={counts.total}
            subtext="Persistent in MongoDB"
            icon={Database}
            accent="#0D9488"
          />
          <MetricCard
            title="New Inquiries"
            value={counts.new}
            subtext="Pending triage / review"
            icon={Clock}
            accent="#D97706"
          />
          <MetricCard
            title="In Progress"
            value={counts.inProgress}
            subtext="Under active investigation"
            icon={Activity}
            accent="#38BDF8"
          />
          <MetricCard
            title="Resolved"
            value={counts.resolved}
            subtext="Reviewed & reply saved"
            icon={CheckCircle2}
            accent="#10B981"
          />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="filter-bar">
          {/* Search */}
          <div className="filter-group" style={{ flex: 2, minWidth: '220px' }}>
            <label className="filter-label">Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="filter-control"
                style={{ width: '100%', paddingLeft: '34px' }}
                placeholder="ID, name, email, subject, text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadInquiries(1)}
              />
              <Search size={15} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group" style={{ minWidth: '140px' }}>
            <label className="filter-label">Status</label>
            <select
              className="filter-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group" style={{ minWidth: '150px' }}>
            <label className="filter-label">Category</label>
            <select
              className="filter-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Date Range: Start */}
          <div className="filter-group" style={{ minWidth: '140px' }}>
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="filter-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Date Range: End */}
          <div className="filter-group" style={{ minWidth: '140px' }}>
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="filter-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '8px' }}>
            <button
              onClick={() => loadInquiries(1)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
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

        {/* Global Error Banner */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <AlertNotice type="danger" title="Database Access Notice">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span>{error}</span>
                <span style={{ fontSize: '0.8rem', color: '#FCA5A5' }}>
                  If MongoDB Atlas is not yet configured, verify that MONGODB_URI and MONGODB_DB_NAME are set in your deployment environment variables.
                </span>
              </div>
            </AlertNotice>
          </div>
        )}

        {/* Inquiries Table Card */}
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
              Inquiries Records ({pagination.total})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Querying MongoDB Atlas collection...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquare size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1rem' }}>No Inquiries Found</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '6px auto 0 auto' }}>
                {search || selectedCategory !== 'All' || selectedStatus !== 'All' || startDate || endDate
                  ? 'No records match your selected search or filter criteria.'
                  : 'No inquiries have been recorded yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '780px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '190px' }}>Tracking ID & Date</th>
                    <th style={{ width: '200px' }}>Submitter</th>
                    <th style={{ width: '170px' }}>Category & Location</th>
                    <th>Subject</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => {
                    return (
                      <tr key={inq.inquiryId || inq._id}>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14B8A6', fontSize: '0.85rem' }}>
                            {inq.inquiryId}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{inq.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{inq.email}</div>
                        </td>

                        <td>
                          <span className="badge badge-neutral">
                            {inq.category}
                          </span>
                          {inq.location && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} className="shrink-0 text-slate-400" />
                              <span>{inq.location}</span>
                            </div>
                          )}
                        </td>

                        <td style={{ maxWidth: '320px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '3px', wordBreak: 'break-word', lineHeight: 1.4 }}>
                            {inq.subject}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', wordBreak: 'break-word', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {inq.message}
                          </div>
                          {inq.adminReply && (
                            <div style={{ fontSize: '0.725rem', color: '#34D399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} />
                              <span>Has internal reply</span>
                            </div>
                          )}
                        </td>

                        <td>
                          {inq.status === 'Resolved' ? (
                            <span className="badge badge-green">
                              <CheckCircle2 size={11} />
                              <span>Resolved</span>
                            </span>
                          ) : inq.status === 'In Progress' ? (
                            <span className="badge badge-cyan">
                              <Clock size={11} />
                              <span>In Progress</span>
                            </span>
                          ) : (
                            <span className="badge badge-amber">
                              <AlertTriangle size={11} />
                              <span>New</span>
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenDetail(inq.inquiryId)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            title="Review and update inquiry"
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
          <div className="pagination-bar">
            <div>
              Showing <strong style={{ color: 'var(--color-text-main)' }}>{inquiries.length}</strong> of{' '}
              <strong style={{ color: 'var(--color-text-main)' }}>{pagination.total}</strong> inquiries
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => loadInquiries(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="pagination-btn"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', padding: '0 8px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => loadInquiries(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="pagination-btn"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Detail & Reply Modal Drawer */}
        {selectedInquiry && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-elevated)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              color: 'var(--color-text-main)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: 'var(--color-bg-surface)',
                zIndex: 10
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: '#14B8A6' }}>
                      {selectedInquiry.inquiryId}
                    </span>
                    {selectedInquiry.status === 'Resolved' ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={11} />
                        <span>Resolved</span>
                      </span>
                    ) : selectedInquiry.status === 'In Progress' ? (
                      <span className="badge badge-cyan">
                        <Clock size={11} />
                        <span>In Progress</span>
                      </span>
                    ) : (
                      <span className="badge badge-amber">
                        <AlertTriangle size={11} />
                        <span>New</span>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Submitted {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
                  aria-label="Close dialog"
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitter Name</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                      {selectedInquiry.name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      <a href={`mailto:${selectedInquiry.email}`} style={{ color: '#14B8A6' }}>
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
                    <div style={{ marginTop: '2px' }}>
                      <span className="badge badge-neutral">{selectedInquiry.category}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>District / Location</div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} className="text-slate-400" />
                      <span>{selectedInquiry.location || 'Not Specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Subject & Message */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Subject
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '14px' }}>
                    {selectedInquiry.subject}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Full Inquiry Message
                  </div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--color-text-body)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Quick Status Update Selector */}
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      Change Investigation Status
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Update the triage phase for this inquiry
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['New', 'In Progress', 'Resolved'].map((st) => {
                      const isActive = selectedInquiry.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          disabled={updating || isActive}
                          className={isActive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                        >
                          {st === 'Resolved' && <CheckCircle2 size={12} />}
                          {st === 'In Progress' && <Clock size={12} />}
                          {st === 'New' && <AlertTriangle size={12} />}
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Internal Reply Form */}
                <form onSubmit={handleSaveReply}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Internal Recorded Reply & Audit Notes
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        MongoDB Persistent Record
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(217, 119, 6, 0.1)',
                      border: '1px solid rgba(217, 119, 6, 0.25)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '0.75rem',
                      color: 'var(--color-status-amber-text)',
                      marginBottom: '12px',
                      lineHeight: 1.5
                    }}>
                      <strong>Notice: </strong>
                      External SMTP email delivery is not configured. Replies saved here are strictly recorded internally in the persistent MongoDB Atlas database for administrative logging and audit tracking.
                    </div>

                    <textarea
                      className="filter-control"
                      rows={4}
                      style={{ width: '100%', resize: 'vertical', lineHeight: 1.5 }}
                      placeholder="Record investigation findings, resolution notes, or administrative reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>

                  {selectedInquiry.adminReply && selectedInquiry.repliedAt && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '16px',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px'
                    }}>
                      Last recorded reply saved by <strong style={{ color: '#14B8A6' }}>{selectedInquiry.repliedBy || 'Administrator'}</strong> on {new Date(selectedInquiry.repliedAt).toLocaleString('en-IN')}.
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
