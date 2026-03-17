import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  studentName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  studentName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>حذف کرنے کی تصدیق</h2>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
            disabled={isDeleting}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning">
            کیا آپ واقعی <strong>{studentName}</strong> کا ریکارڈ حذف کرنا چاہتے ہیں؟
          </p>
          <p className="delete-note">
            یہ عمل واپس نہیں کیا جا سکتا۔
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            منسوخ
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-small"></span>
                حذف ہو رہا ہے...
              </>
            ) : (
              'حذف کریں'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
