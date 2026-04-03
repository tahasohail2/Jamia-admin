import React, { useEffect } from 'react';

interface CancelConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelConfirmDialog: React.FC<CancelConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
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

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1001 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>منتقلی منسوخ کریں</h2>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning">
            کیا آپ منتقلی کو منسوخ کرنا چاہتے ہیں؟
          </p>
          <p className="delete-note">
            اب تک کی منتقل شدہ ڈیٹا محفوظ رہے گا۔
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            واپس جائیں
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
          >
            منسوخ کریں
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmDialog;
