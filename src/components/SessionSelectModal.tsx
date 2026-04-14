import React from 'react';
import { useSession } from '../context/SessionContext';

interface SessionSelectModalProps {
  isOpen: boolean;
  selectedYear: number | null;
  onSelect: (year: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const SessionSelectModal: React.FC<SessionSelectModalProps> = ({
  isOpen,
  selectedYear,
  onSelect,
  onConfirm,
  onClose,
}) => {
  const { sessionYears } = useSession();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>سیشن منتخب کریں</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: 16, color: '#555', fontSize: 14 }}>
            طالب علم کا اندراج کس سیشن میں کرنا ہے؟
          </p>
          <div className="edit-field">
            <label>سیشن / سال</label>
            <select
              value={selectedYear ?? ''}
              onChange={(e) => onSelect(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="" disabled>-- سیشن منتخب کریں --</option>
              {sessionYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>منسوخ</button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={selectedYear === null}
          >
            جاری رکھیں
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSelectModal;
