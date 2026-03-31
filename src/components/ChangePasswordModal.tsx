import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { adminApi } from '../services/adminApi';
import { AdminUser } from '../types';
import '../styles/ChangePasswordModal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

  const isSuperAdmin = user?.isSuperAdmin || false;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (isSuperAdmin) {
        loadUsers();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSuperAdmin]);

  const loadUsers = async () => {
    try {
      const allUsers = await adminApi.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSuperAdmin) {
      // Super admin changing another user's password
      if (!selectedUserId) {
        setError('صارف منتخب کریں');
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
        await adminApi.changeUserPassword(Number(selectedUserId), newPassword);
        showToast('پاس ورڈ کامیابی سے تبدیل ہو گیا', 'success');
        handleClose();
      } catch (error: any) {
        console.error('Password change failed:', error);
        setError(error.message || 'پاس ورڈ تبدیل نہیں ہو سکا');
        showToast('پاس ورڈ تبدیل نہیں ہو سکا', 'error');
      } finally {
        setIsChanging(false);
      }
    } else {
      // Regular admin changing own password
      if (!currentPassword || !newPassword || !confirmPassword) {
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

      if (currentPassword === newPassword) {
        setError('نیا پاس ورڈ موجودہ پاس ورڈ سے مختلف ہونا چاہیے');
        return;
      }

      try {
        setIsChanging(true);
        await adminApi.changePassword(currentPassword, newPassword);
        showToast('پاس ورڈ کامیابی سے تبدیل ہو گیا', 'success');
        handleClose();
      } catch (error: any) {
        console.error('Password change failed:', error);
        setError(error.message || 'پاس ورڈ تبدیل نہیں ہو سکا');
        showToast('پاس ورڈ تبدیل نہیں ہو سکا', 'error');
      } finally {
        setIsChanging(false);
      }
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSelectedUserId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-password" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isSuperAdmin ? 'صارف کا پاس ورڈ تبدیل کریں' : 'پاس ورڈ تبدیل کریں'}</h2>
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

            {isSuperAdmin ? (
              <>
                <div className="form-group">
                  <label className="form-label">صارف منتخب کریں</label>
                  <select
                    className="form-input"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                    disabled={isChanging}
                  >
                    <option value="">صارف منتخب کریں</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} {u.isSuperAdmin ? '(سپر ایڈمن)' : '(ایڈمن)'}
                      </option>
                    ))}
                  </select>
                </div>

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
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">موجودہ پاس ورڈ</label>
                  <input
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isChanging}
                    autoComplete="current-password"
                  />
                </div>

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
              </>
            )}
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
