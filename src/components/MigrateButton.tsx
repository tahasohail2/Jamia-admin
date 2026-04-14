import React, { useState } from 'react';
import { migrateAllRecords, MigrationProgress, cancelMigration } from '../services/migrationApi';
import { useToast } from '../context/ToastContext';
import { useSession } from '../context/SessionContext';
import MigrationModal from './MigrationModal';
import CancelConfirmDialog from './CancelConfirmDialog';

const MigrateButton: React.FC<{ onMigrationComplete?: () => void }> = ({ onMigrationComplete }) => {
  const { showToast } = useToast();
  const { sessionYear } = useSession();
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isRunning = progress?.status === 'fetching' || progress?.status === 'migrating';

  const handleOpenModal = () => {
    // Reset progress state when opening modal for a fresh start
    if (progress?.status === 'error' || progress?.status === 'done') {
      setProgress(null);
    }
    setIsModalOpen(true);
    setIsMinimized(false);
  };

  const handleCloseModal = () => {
    if (isRunning) {
      // Show cancel confirmation modal
      setShowCancelConfirm(true);
    } else {
      setIsModalOpen(false);
      setIsMinimized(false);
      setProgress(null);
    }
  };

  const handleConfirmCancel = () => {
    cancelMigration();
    showToast('منتقلی منسوخ کر دی گئی', 'warning');
    setShowCancelConfirm(false);
    setIsModalOpen(false);
    setIsMinimized(false);
    setProgress(null);
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
  };

  const handleMinimize = () => {
    setIsModalOpen(false);
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsModalOpen(true);
    setIsMinimized(false);
  };

  const handleCancelModal = () => {
    if (!isRunning) {
      setIsModalOpen(false);
      setIsMinimized(false);
      setProgress(null);
    }
  };

  const handleConfirmMigration = async () => {
    const result = await migrateAllRecords(setProgress, sessionYear);

    if (result.status === 'done') {
      const admitted = result.admitted || 0;
      const denied = result.denied || 0;
      const vFailed = result.validationFailed || 0;
      if (vFailed > 0) {
        showToast(`منتقلی مکمل: ${admitted} داخل، ${denied} مسترد، ${vFailed} توثیق ناکام`, 'warning');
      } else {
        showToast(`منتقلی مکمل: ${admitted} داخل، ${denied} مسترد`, 'success');
      }
      onMigrationComplete?.();
    } else if (result.status === 'error') {
      // Don't show toast if it was cancelled (already shown in handleConfirmCancel)
      if (result.errorMessage !== 'منتقلی منسوخ کر دی گئی') {
        showToast(result.errorMessage || 'منتقلی ناکام ہو گئی', 'error');
      }
    }
  };

  const percentage =
    progress && progress.totalBatches > 0
      ? Math.round((progress.completedBatches / progress.totalBatches) * 100)
      : 0;

  return (
    <>
      <button
        className="migrate-btn"
        onClick={handleOpenModal}
        disabled={isRunning}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
        منظور شدہ منتقل کریں
      </button>

      <MigrationModal
        isOpen={isModalOpen}
        progress={progress}
        sessionYear={sessionYear}
        onConfirm={handleConfirmMigration}
        onCancel={handleCancelModal}
        onClose={handleCloseModal}
        onMinimize={handleMinimize}
      />

      <CancelConfirmDialog
        isOpen={showCancelConfirm}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelCancel}
      />

      {isMinimized && progress && (
        <div className="migration-minimized-indicator" onClick={handleMaximize}>
          <div className="migration-minimized-content">
            <div className="migration-minimized-icon">
              {isRunning ? (
                <span className="migration-minimized-spinner"></span>
              ) : (
                <span className="migration-minimized-check">✓</span>
              )}
            </div>
            <div className="migration-minimized-text">
              <span className="migration-minimized-title">منظور شدہ منتقلی</span>
              {isRunning ? (
                <span className="migration-minimized-status">{percentage}% مکمل</span>
              ) : (
                <span className="migration-minimized-status">مکمل</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MigrateButton;
