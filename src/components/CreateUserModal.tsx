import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/adminApi';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

    // Validation
    if (!username || !password || !confirmPassword) {
      setError('تمام فیلڈز ضروری ہیں');
      return;
    }

    if (username.length < 3) {
      setError('صارف نام کم از کم 3 حروف کا ہونا چاہیے');
      return;
    }

    if (password.length < 6) {
      setError('پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے');
      return;
    }

    if (password !== confirmPassword) {
      setError('پاس ورڈ اور تصدیقی پاس ورڈ مماثل نہیں ہیں');
      return;
    }

    try {
      setIsCreating(true);
      await adminApi.createUser(username, password, isSuperAdmin);
      showToast('صارف کامیابی سے بنایا گیا', 'success');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('User creation failed:', error);
      setError(error.message || 'صارف نہیں بنایا جا سکا');
      showToast('صارف نہیں بنایا جا سکا', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setIsSuperAdmin(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-password" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>نیا صارف بنائیں</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isCreating}
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
              <label className="form-label">صارف نام</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isCreating}
                autoComplete="username"
              />
              <small className="form-hint">کم از کم 3 حروف</small>
            </div>

            <div className="form-group">
              <label className="form-label">پاس ورڈ</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isCreating}
                autoComplete="new-password"
              />
              <small className="form-hint">کم از کم 6 حروف</small>
            </div>

            <div className="form-group">
              <label className="form-label">پاس ورڈ دوبارہ درج کریں</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isCreating}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isSuperAdmin}
                  onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  disabled={isCreating}
                />
                <span>سپر ایڈمن بنائیں؟</span>
              </label>
              <small className="form-hint">سپر ایڈمن تمام صارفین کا انتظام کر سکتا ہے</small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="spinner-small"></span>
                  بنایا جا رہا ہے...
                </>
              ) : (
                'صارف بنائیں'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
