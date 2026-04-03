import React, { useEffect } from 'react';
import { MigrationProgress } from '../services/migrationApi';

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

  if (!isOpen) return null;

  const isRunning = progress?.status === 'fetching' || progress?.status === 'migrating';
  const isDone = progress?.status === 'done' || progress?.status === 'error';
  const showConfirmation = !progress;

  const percentage =
    progress && progress.totalBatches > 0
      ? Math.round((progress.completedBatches / progress.totalBatches) * 100)
      : 0;

  return (
    <div className="modal-overlay" onClick={showConfirmation ? onCancel : undefined}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showConfirmation ? 'ڈیٹا منتقلی کی تصدیق' : 'ڈیٹا منتقلی'}</h2>
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

        <div className="modal-body">
          {showConfirmation ? (
            <>
              <p className="delete-warning">
                کیا آپ تمام ریکارڈز کو نئے ڈیٹابیس میں منتقل کرنا چاہتے ہیں؟
              </p>
              <p className="delete-note">
                یہ عمل کچھ وقت لے سکتا ہے۔
              </p>
            </>
          ) : (
            <div className="migration-progress-content">
              <p className="migration-status-text">
                {progress?.status === 'fetching' && `ریکارڈز لوڈ ہو رہے ہیں... (${progress.fetchedRecords || 0}/${progress.totalRecords})`}
                {progress?.status === 'migrating' && `بیچ ${progress.completedBatches}/${progress.totalBatches} بھیجا جا رہا ہے`}
                {progress?.status === 'done' && 'منتقلی مکمل ہو گئی'}
                {progress?.status === 'error' && (progress.errorMessage || 'خرابی')}
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

              {(progress?.status === 'migrating' || progress?.status === 'done') && (
                <div className="migration-stats">
                  <div className="migration-stat-item">
                    <span className="migration-stat-label">کل:</span>
                    <span className="migration-stat-value">{progress.totalRecords || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-success">
                    <span className="migration-stat-label">داخل:</span>
                    <span className="migration-stat-value">{progress.inserted || 0}</span>
                  </div>
                  <div className="migration-stat-item migration-stat-fail">
                    <span className="migration-stat-label">چھوڑے گئے:</span>
                    <span className="migration-stat-value">{progress.skipped || 0}</span>
                  </div>
                </div>
              )}

              {progress?.status === 'done' && progress.skippedList.length > 0 && (
                <div className="migration-failures">
                  <p className="migration-failures-title">چھوڑے گئے ریکارڈز (CNIC):</p>
                  <ul className="migration-failures-list">
                    {progress.skippedList.map((cnic, i) => (
                      <li key={i}>{cnic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {showConfirmation ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={onCancel}
              >
                منسوخ
              </button>
              <button
                className="btn btn-primary"
                onClick={onConfirm}
              >
                منتقل کریں
              </button>
            </>
          ) : isDone ? (
            <button className="btn btn-primary" onClick={onClose}>
              بند کریں
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MigrationModal;
