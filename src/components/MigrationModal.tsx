import React, { useEffect, useState } from 'react';
import { MigrationProgress } from '../services/migrationApi';
import { adminApi } from '../services/adminApi';
import { formatDateTimeCompact } from '../utils/formatters';

interface MigrationModalProps {
  isOpen: boolean;
  progress: MigrationProgress | null;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  onMinimize: () => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  progress,
  onConfirm,
  onCancel,
  onClose,
  onMinimize,
}) => {
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch approved count when modal opens at step 1
  useEffect(() => {
    if (isOpen && !progress) {
      setLoadingCount(true);
      adminApi
        .getRecords({ approvalStatus: 'approved', migrationBatchId: 'not_migrated', pageSize: 1 })
        .then((res) => {
          setApprovedCount(res.pagination.totalRecords);
        })
        .catch(() => {
          setApprovedCount(null);
        })
        .finally(() => setLoadingCount(false));
    }
  }, [isOpen, progress]);

  if (!isOpen) return null;

  const isRunning = progress?.status === 'fetching' || progress?.status === 'migrating';
  const isDone = progress?.status === 'done' || progress?.status === 'error';
  const showConfirmation = !progress;

  // Determine current step: 1 = review, 2 = in-progress, 3 = done
  const currentStep = showConfirmation ? 1 : isDone ? 3 : 2;

  const percentage =
    progress && progress.totalBatches > 0
      ? Math.round((progress.completedBatches / progress.totalBatches) * 100)
      : 0;

  const submissionDateTime = formatDateTimeCompact(new Date());

  const steps = [
    { number: 1, label: 'جائزہ' },
    { number: 2, label: 'منتقلی' },
    { number: 3, label: 'نتیجہ' },
  ];

  return (
    <div className="modal-overlay" onClick={showConfirmation ? onCancel : undefined}>
      <div className="modal-content migration-stepper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>منظور شدہ ریکارڈز کی منتقلی</h2>
          <div className="modal-header-actions">
            {!showConfirmation && isRunning && (
              <button
                className="modal-minimize"
                onClick={onMinimize}
                aria-label="Minimize"
                title="چھوٹا کریں"
              >
                −
              </button>
            )}
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
              title={isRunning ? 'منتقلی منسوخ کریں' : 'بند کریں'}
            >
              ×
            </button>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="stepper-header">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className={`stepper-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {currentStep > step.number ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className="stepper-label">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`stepper-line ${currentStep > step.number ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="modal-body">
          {/* Step 1: Review */}
          {currentStep === 1 && (
            <div className="migration-review-step">
              <div className="migration-info-card">
                <div className="migration-info-row">
                  <span className="migration-info-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#28a745" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                  <span className="migration-info-label">منظور شدہ طلباء کی تعداد</span>
                  <span className="migration-info-value approved-count">
                    {loadingCount ? '...' : approvedCount ?? '—'}
                  </span>
                </div>
                <div className="migration-info-row">
                  <span className="migration-info-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#667eea" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <span className="migration-info-label">جمع کرانے کی تاریخ/وقت</span>
                  <span className="migration-info-value" dir="ltr">{submissionDateTime}</span>
                </div>
              </div>
              <p className="migration-review-note">
                صرف منظور شدہ ریکارڈز نئے ڈیٹابیس میں منتقل کیے جائیں گے۔ یہ عمل کچھ وقت لے سکتا ہے۔
              </p>
            </div>
          )}

          {/* Step 2: In Progress */}
          {currentStep === 2 && (
            <div className="migration-progress-content">
              <p className="migration-status-text">
                {progress?.status === 'fetching' && `ریکارڈز لوڈ ہو رہے ہیں... (${progress.fetchedRecords || 0}/${progress.totalRecords})`}
                {progress?.status === 'migrating' && `بیچ ${progress.completedBatches}/${progress.totalBatches} بھیجا جا رہا ہے`}
              </p>

              {progress?.status === 'fetching' && progress.totalRecords > 0 && (
                <div className="migration-progress-bar-container">
                  <div className="migration-progress-bar-bg">
                    <div
                      className="migration-progress-bar-fill"
                      style={{ width: `${Math.round(((progress.fetchedRecords || 0) / progress.totalRecords) * 100)}%` }}
                    />
                  </div>
                  <span className="migration-progress-percentage">
                    {Math.round(((progress.fetchedRecords || 0) / progress.totalRecords) * 100)}%
                  </span>
                </div>
              )}

              {progress?.status === 'migrating' && (
                <div className="migration-progress-bar-container">
                  <div className="migration-progress-bar-bg">
                    <div
                      className="migration-progress-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="migration-progress-percentage">{percentage}%</span>
                </div>
              )}

              {progress?.status === 'migrating' && (
                <div className="migration-stats">
                  <div className="migration-stat-item">
                    <span className="migration-stat-label">کل:</span>
                    <span className="migration-stat-value">{progress.totalRecords || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-success">
                    <span className="migration-stat-label">داخلہ:</span>
                    <span className="migration-stat-value">{progress.admitted || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-fail">
                    <span className="migration-stat-label">مسترد:</span>
                    <span className="migration-stat-value">{progress.denied || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-warning">
                    <span className="migration-stat-label">توثیق ناکام:</span>
                    <span className="migration-stat-value">{progress.validationFailed || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {currentStep === 3 && (
            <div className="migration-progress-content">
              <p className={`migration-status-text ${progress?.status === 'done' ? 'success' : 'error'}`}>
                {progress?.status === 'done' && '✓ منتقلی مکمل ہو گئی'}
                {progress?.status === 'error' && `✕ ${progress.errorMessage || 'خرابی'}`}
              </p>

              {progress?.batchId && progress?.status === 'done' && (
                <div className="migration-batch-id-display">
                  <span className="migration-batch-id-label">بیچ آئی ڈی:</span>
                  <span className="migration-batch-id-value" dir="ltr">{progress.batchId}</span>
                </div>
              )}

              {progress?.status === 'done' && (
                <div className="migration-stats">
                  <div className="migration-stat-item">
                    <span className="migration-stat-label">کل:</span>
                    <span className="migration-stat-value">{progress.totalRecords || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-success">
                    <span className="migration-stat-label">داخلہ:</span>
                    <span className="migration-stat-value">{progress.admitted || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-fail">
                    <span className="migration-stat-label">مسترد:</span>
                    <span className="migration-stat-value">{progress.denied || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-warning">
                    <span className="migration-stat-label">توثیق ناکام:</span>
                    <span className="migration-stat-value">{progress.validationFailed || 0}</span>
                  </div>
                </div>
              )}

              {progress?.status === 'done' && progress.validationFailedList.length > 0 && (
                <div className="migration-failures">
                  <p className="migration-failures-title">توثیق ناکام ریکارڈز ({progress.validationFailedList.length}):</p>
                  <table className="migration-failures-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>شناختی کارڈ</th>
                        <th>وجہ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.validationFailedList.map((item, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td dir="ltr">{item.cnic}</td>
                          <td dir="ltr">{item.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep === 1 && (
            <>
              <button className="btn btn-secondary" onClick={onCancel}>
                منسوخ
              </button>
              <button
                className="btn btn-primary"
                onClick={onConfirm}
                disabled={loadingCount || approvedCount === 0}
              >
                منظور شدہ منتقل کریں
              </button>
            </>
          )}
          {currentStep === 3 && (
            <button className="btn btn-primary" onClick={onClose}>
              بند کریں
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationModal;
