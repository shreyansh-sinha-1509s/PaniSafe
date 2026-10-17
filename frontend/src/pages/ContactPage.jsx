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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#14B8A6', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
            <Mail size={16} />
            <span>Community & Researcher Collaboration</span>
          </div>
          <h1 className="page-title">Feedback & Inquiries</h1>
          <p className="page-subtitle">
            Submit questions, methodology feedback, or requests regarding station coordinates and parameter screening rules. All submissions are stored in an auditable local repository.
          </p>
        </div>

        {/* Persistence Notice */}
        <AlertNotice type="disclaimer" title="Data Privacy & Storage Audit Notice">
          Submissions through this form are validated, sanitized, and stored directly into the local persistent repository (<code>backend/data/feedback.json</code>). No external third-party tracking scripts, advertising trackers, or marketing endpoints are contacted.
        </AlertNotice>

        {successResponse && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}>
            <CheckCircle2 size={22} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem', marginBottom: '4px' }}>
                Feedback Submitted Successfully
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5, marginBottom: '8px' }}>
                {successResponse.message}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#14B8A6', fontFamily: 'var(--font-mono)' }}>
                Reference Ticket ID: <strong>{successResponse.ticketId}</strong>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <AlertNotice type="danger" title="Validation Error">
            {errorMsg}
          </AlertNotice>
        )}

        {/* Feedback Form Card */}
        <div className="card rounded-2xl" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="name">Your Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="e.g., Dr. Ramesh Patil"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="e.g., ramesh.patil@example.in"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="subject">Subject / Inquiry Title</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="input"
                  placeholder="e.g., Station Disambiguation Question"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Data Inquiry">Data Inquiry</option>
                  <option value="Methodology Feedback">Methodology Feedback</option>
                  <option value="Station Suggestion">Station Suggestion</option>
                  <option value="Technical Question">Technical Question</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="message">Detailed Note / Observation *</label>
              <textarea
                id="message"
                name="message"
                className="input"
                rows="5"
                placeholder="Describe your inquiry, observations regarding regional Maharashtra groundwater, or suggestions..."
                value={form.message}
                onChange={handleChange}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ minWidth: '180px' }}
              >
                <Send size={16} />
                <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
