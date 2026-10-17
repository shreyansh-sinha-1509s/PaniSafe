import React, { useState } from 'react';
import { submitFeedback } from '../services/api';
import AlertNotice from '../components/AlertNotice';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'Data Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessResponse(null);

    // Client validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, and Message).');
      setLoading(false);
      return;
    }

    try {
      const res = await submitFeedback(form);
      if (res.success) {
        setSuccessResponse(res);
        setForm({
          name: '',
          email: '',
          subject: '',
          category: 'Data Inquiry',
          message: ''
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Mail size={16} />
            <span>Technical Feedback & Inquiries</span>
          </div>
          <h1 className="page-title">Contact & Research Collaboration</h1>
          <p className="page-subtitle">
            Have questions regarding CGWB dataset coverage, screening thresholds, or wish to report a field data discrepancy? Submit technical feedback to the Pani Safe team.
          </p>
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: '36px' }}>
          {/* Success Banner */}
          {successResponse && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '16px 20px',
              marginBottom: '24px',
              color: '#166534'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1rem' }}>
                <CheckCircle2 size={20} color="#16A34A" />
                <span>Feedback Recorded Successfully</span>
              </div>
              <p style={{ marginTop: '6px', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {successResponse.message}
              </p>
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: '#DCFCE7',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontFamily: 'monospace'
              }}>
                Tracking Reference: {successResponse.referenceId}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#15803D' }}>
                Note: {successResponse.note}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <AlertNotice type="danger" title="Submission Error">
              {errorMsg}
            </AlertNotice>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">
                  Your Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Dr. Rajesh Patil"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Official / Academic Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g., r.patil@unipune.ac.in"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className="form-input"
                  placeholder="e.g., Station Coordinates Discrepancy in Nashik"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Data Inquiry">Data Query / Clarification</option>
                  <option value="Discrepancy Report">Station Discrepancy Report</option>
                  <option value="Methodology Question">Methodology & Threshold Query</option>
                  <option value="Research Collaboration">Academic / Research Collaboration</option>
                  <option value="Feature Suggestion">Feature Suggestion for Platform</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Detailed Message <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                name="message"
                className="form-textarea"
                placeholder="Describe your inquiry, station observation, or feedback in detail..."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{
              background: '#F8FAF9',
              border: '1px solid #DDE5E1',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#64748B'
            }}>
              <strong>Backend Data Transparency: </strong>
              Submissions are validated on the Node.js backend and appended to a persistent local JSON repository for research review. No third-party email APIs or external marketing trackers are used.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', gap: '10px' }}
            >
              {loading ? (
                <span>Validating & Recording...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Technical Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
