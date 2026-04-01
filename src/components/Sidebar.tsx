import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ChangePasswordModal from './ChangePasswordModal';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import '../styles/Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('لاگ آؤٹ ناکام ہوا', 'error');
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}
      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <img src="/1.png" alt="Logo" className="sidebar-logo" />
          {!isCollapsed && <h2 className="sidebar-title">ایڈمن پینل</h2>}
          
          {/* Close button for mobile */}
          <button className="sidebar-close-btn" onClick={onToggle} aria-label="Close sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
               <path d="M15 18l-6-6 6-6" />
             
            ) : (
              <path d="M9 18l6-6-6-6" />
            )}
          </svg>
        </button>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="ڈیش بورڈ"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {!isCollapsed && <span>ڈیش بورڈ</span>}
          </NavLink>

          <NavLink 
            to="/results" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="داخلہ جات"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path d="M9 12h6m-6 4h6" />
            </svg>
            {!isCollapsed && <span>داخلہ جات</span>}
          </NavLink>

          {user?.isSuperAdmin && (
            <NavLink 
              to="/users" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="صارفین کا انتظام"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {!isCollapsed && <span>صارفین کا انتظام</span>}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {user?.isSuperAdmin && (
            <button 
              className="sidebar-profile-btn" 
              onClick={() => setIsPasswordModalOpen(true)} 
              title="پروفائل"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {!isCollapsed && <span>پروفائل</span>}
            </button>
          )}
          
          <button className="sidebar-logout-btn" onClick={handleLogoutClick} title="لاگ آؤٹ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!isCollapsed && <span>لاگ آؤٹ</span>}
          </button>
        </div>
      </aside>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        isLoggingOut={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  );
};

export default Sidebar;
