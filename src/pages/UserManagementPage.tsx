import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../services/adminApi';
import { AdminUser } from '../types';
// User management components
import CreateUserModal from '../components/CreateUserModal';
import DeleteUserDialog from '../components/DeleteUserDialog';
import '../styles/UserManagementPage.css';

const UserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await adminApi.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showToast('صارفین لوڈ نہیں ہو سکے', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      showToast(
        user.isActive ? 'صارف غیر فعال ہو گیا' : 'صارف فعال ہو گیا',
        'success'
      );
      loadUsers();
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      showToast(error.message || 'صارف کی حیثیت تبدیل نہیں ہو سکی', 'error');
    }
  };

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await adminApi.deleteUser(userToDelete.id);
      showToast('صارف کامیابی سے حذف ہو گیا', 'success');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showToast(error.message || 'صارف حذف نہیں ہو سکا', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'کبھی نہیں';
    const date = new Date(dateString);
    return date.toLocaleString('ur-PK', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="user-management-page">
        <div className="page-header">
          <div>
            <h2 className="page-title">صارفین کا انتظام</h2>
            <p className="page-subtitle">تمام ایڈمن صارفین</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            نیا صارف بنائیں
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>صارفین لوڈ ہو رہے ہیں...</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>صارف نام</th>
                  <th>کردار</th>
                  <th>حیثیت</th>
                  <th>آخری لاگ ان</th>
                  <th>بنایا گیا</th>
                  <th>اعمال</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-badge ${user.isSuperAdmin ? 'super-admin' : 'admin'}`}>
                        {user.isSuperAdmin ? 'سپر ایڈمن' : 'ایڈمن'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'فعال' : 'غیر فعال'}
                      </span>
                    </td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn-action ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'غیر فعال کریں' : 'فعال کریں'}
                        >
                          {user.isActive ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteClick(user)}
                          title="حذف کریں"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadUsers}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        username={userToDelete?.username || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      />
    </DashboardLayout>
  );
};

export default UserManagementPage;
