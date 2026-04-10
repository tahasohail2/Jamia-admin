import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { adminApi } from '../services/adminApi';
import { useToast } from '../context/ToastContext';
import '../styles/SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adminApi
      .getAdmissionStatus()
      .then((data) => {
        setIsOpen(data.is_admission_open);
        setStatusMessage(data.message);
      })
      .catch(() => showToast('داخلہ کی حیثیت لوڈ کرنے میں ناکامی', 'error'))
      .finally(() => setInitialLoading(false));
  }, []);

  // Focus textarea when modal opens
  useEffect(() => {
    if (showModal) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [showModal]);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      submitUpdate(true, null);
    } else {
      setReason('');
      setModalError('');
      setShowModal(true);
    }
  };

  const submitUpdate = async (isAdmissionOpen: boolean, closureReason: string | null) => {
    setLoading(true);
    try {
      await adminApi.updateAdmissionStatus(isAdmissionOpen, closureReason);
      setIsOpen(isAdmissionOpen);
      setStatusMessage(
        isAdmissionOpen ? 'Registration is currently open.' : closureReason ?? ''
      );
      setShowModal(false);
      showToast(isAdmissionOpen ? 'داخلہ کامیابی سے کھول دیا گیا' : 'داخلہ کامیابی سے بند کر دیا گیا', isAdmissionOpen ? 'success' : 'error');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'کچھ غلط ہو گیا';
      if (!isAdmissionOpen) {
        // Keep modal open, show error inside it
        setModalError(msg);
      } else {
        setIsOpen(false); // revert
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = () => {
    setModalError('');
    submitUpdate(false, reason.trim());
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setIsOpen(true);
  };

  const charCount = reason.trim().length;
  const canConfirm = charCount >= 10 && !loading;

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h2 className="settings-title">ترتیبات</h2>
          <p className="settings-subtitle">سسٹم کی ترتیبات کا انتظام کریں</p>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h3 className="settings-card-title">داخلہ کی حیثیت</h3>
              <p className="settings-card-desc">
                کنٹرول کریں کہ آیا طلباء نئی رجسٹریشن جمع کر سکتے ہیں
              </p>
            </div>
          </div>

          {initialLoading ? (
            <div className="settings-skeleton" />
          ) : (
            <div className="toggle-block">
              <div className="toggle-row">
                <button
                  role="switch"
                  aria-checked={isOpen}
                  aria-label="داخلہ کی حیثیت ٹوگل کریں"
                  className={`toggle-switch ${isOpen ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => !loading && handleToggle(!isOpen)}
                  disabled={loading}
                >
                  <span className="toggle-thumb">
                    {loading && <span className="toggle-spinner" />}
                  </span>
                </button>
                <span className={`toggle-state-label ${isOpen ? 'label-open' : 'label-closed'}`}>
                  {isOpen ? 'کھلا' : 'بند'}
                </span>
              </div>

              <div className={`status-pill ${isOpen ? 'status-pill-open' : 'status-pill-closed'}`}>
                <span className={`status-dot ${isOpen ? 'dot-open' : 'dot-closed'}`} />
                <span className="status-pill-text">
                  {isOpen
                    ? 'رجسٹریشن فی الحال کھلی ہے'
                    : <>{`بند`} &mdash; <em>{statusMessage}</em></>
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="settings-modal">
            <div className="modal-header">
              <h4 id="modal-title" className="modal-title">رجسٹریشن بند کریں</h4>
              <button
                className="modal-close-btn"
                onClick={handleCancelModal}
                aria-label="بند کریں"
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="modal-desc">
              ایک وجہ فراہم کریں جو رجسٹریشن کرنے کی کوشش کرنے والے طلباء کو دکھائی جائے گی۔
            </p>

            <label className="modal-label" htmlFor="closure-reason">
              بند کرنے کی وجہ <span className="required-star">*</span>
            </label>
            <textarea
              id="closure-reason"
              ref={textareaRef}
              className="modal-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: نشستوں کی گنجائش کی وجہ سے رجسٹریشن یکم ستمبر تک بند ہے۔"
              rows={4}
              disabled={loading}
            />
            <small className={`char-count ${charCount >= 10 ? 'char-ok' : ''}`}>
              {charCount} / کم از کم 10 حروف
            </small>

            {modalError && (
              <p className="modal-error" role="alert">{modalError}</p>
            )}

            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={handleCancelModal}
                disabled={loading}
              >
                منسوخ کریں
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleConfirmClose}
                disabled={!canConfirm}
              >
                {loading ? (
                  <span className="btn-spinner" />
                ) : (
                  'غیر فعال کریں'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
