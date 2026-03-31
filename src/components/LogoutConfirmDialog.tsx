import React, { useEffect } from 'react';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  isLoggingOut,
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>لاگ آؤٹ کی تصدیق</h2>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
            disabled={isLoggingOut}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning">
            کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟
          </p>
          <p className="delete-note">
            آپ کو دوبارہ لاگ ان کرنا ہوگا۔
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoggingOut}
          >
            منسوخ
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <span className="spinner-small"></span>
                لاگ آؤٹ ہو رہا ہے...
              </>
            ) : (
              'لاگ آؤٹ کریں'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmDialog;
