import React, { useEffect } from 'react';

interface DeleteUserDialogProps {
  isOpen: boolean;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  username,
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
          <h2>صارف حذف کریں</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning">
            کیا آپ واقعی <strong>{username}</strong> کو حذف کرنا چاہتے ہیں؟
          </p>
          <p className="delete-note">
            یہ عمل واپس نہیں کیا جا سکتا۔
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            منسوخ
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            حذف کریں
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserDialog;
