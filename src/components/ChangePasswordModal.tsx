import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/adminApi';
import '../styles/ChangePasswordModal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  username: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, userId, username }) => {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('صارف منتخب نہیں ہوا');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('تمام فیلڈز ضروری ہیں');
      return;
    }

    if (newPassword.length < 6) {
      setError('نیا پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('نیا پاس ورڈ اور تصدیقی پاس ورڈ مماثل نہیں ہیں');
      return;
    }

    try {
      setIsChanging(true);
      await adminApi.changeUserPassword(userId, newPassword);
      showToast('پاس ورڈ کامیابی سے تبدیل ہو گیا', 'success');
      handleClose();
    } catch (error: any) {
      console.error('Password change failed:', error);
      setError(error.message || 'پاس ورڈ تبدیل نہیں ہو سکا');
      showToast('پاس ورڈ تبدیل نہیں ہو سکا', 'error');
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-password" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{username} کا پاس ورڈ تبدیل کریں</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isChanging}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="password-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">نیا پاس ورڈ</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChanging}
                autoComplete="new-password"
              />
              <small className="form-hint">کم از کم 6 حروف</small>
            </div>

            <div className="form-group">
              <label className="form-label">نیا پاس ورڈ دوبارہ درج کریں</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChanging}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isChanging}
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isChanging}
            >
              {isChanging ? (
                <>
                  <span className="spinner-small"></span>
                  تبدیل ہو رہا ہے...
                </>
              ) : (
                'پاس ورڈ تبدیل کریں'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
