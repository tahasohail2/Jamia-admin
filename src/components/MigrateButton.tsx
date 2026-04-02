import React, { useState } from 'react';
import { migrateAllRecords, MigrationProgress } from '../services/migrationApi';
import { useToast } from '../context/ToastContext';

const MigrateButton: React.FC = () => {
  const { showToast } = useToast();
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [showResults, setShowResults] = useState(false);

  const isRunning = progress?.status === 'fetching' || progress?.status === 'migrating';

  const handleMigrate = async () => {
    if (isRunning) return;

    const confirmed = window.confirm(
      'کیا آپ تمام ریکارڈز کو نئے ڈیٹابیس میں منتقل کرنا چاہتے ہیں؟'
    );
    if (!confirmed) return;

    setShowResults(true);
    const result = await migrateAllRecords(setProgress);

    if (result.status === 'done') {
      showToast(
        `منتقلی مکمل: ${result.inserted} داخل، ${result.skipped} چھوڑے گئے`,
        result.skipped > 0 ? 'warning' : 'success'
      );
    } else if (result.status === 'error') {
      showToast(result.errorMessage || 'منتقلی ناکام ہو گئی', 'error');
    }
  };

  const percentage =
    progress && progress.totalBatches > 0
      ? Math.round((progress.completedBatches / progress.totalBatches) * 100)
      : 0;

  return (
    <div className="migrate-section">
      <button
        className="migrate-btn"
        onClick={handleMigrate}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <span className="migrate-spinner" />
            منتقلی جاری ہے...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
            ڈیٹا منتقل کریں
          </>
        )}
      </button>

      {showResults && progress && (
        <div className="migrate-progress-card">
          <p className="migrate-status-text">
            {progress.status === 'fetching' && 'ریکارڈز لوڈ ہو رہے ہیں...'}
            {progress.status === 'migrating' && `بیچ ${progress.completedBatches}/${progress.totalBatches} بھیجا جا رہا ہے`}
            {progress.status === 'done' && 'منتقلی مکمل ہو گئی'}
            {progress.status === 'error' && (progress.errorMessage || 'خرابی')}
          </p>

          {progress.status === 'migrating' && (
            <div className="migrate-progress-bar-bg">
              <div className="migrate-progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
          )}

          {(progress.status === 'migrating' || progress.status === 'done') && (
            <div className="migrate-stats">
              <span>کل: {progress.totalRecords}</span>
              <span className="migrate-stat-success">داخل: {progress.inserted}</span>
              <span className="migrate-stat-fail">چھوڑے گئے: {progress.skipped}</span>
            </div>
          )}

          {progress.status === 'done' && progress.skippedList.length > 0 && (
            <div className="migrate-failures">
              <p className="migrate-failures-title">چھوڑے گئے ریکارڈز:</p>
              <ul>
                {progress.skippedList.map((r, i) => (
                  <li key={r.originalId ?? i}>
                    {r.originalId ? `ID ${r.originalId}` : `#${i + 1}`}
                    {r.reason ? `: ${r.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(progress.status === 'done' || progress.status === 'error') && (
            <button className="migrate-close-btn" onClick={() => setShowResults(false)}>
              بند کریں
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MigrateButton;
