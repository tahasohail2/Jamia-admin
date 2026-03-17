import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';

/* ── Inline icons (no extra deps) ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ── Islamic geometric SVG pattern ── */
const GeometricPattern = () => (
  <svg
    className="login-geo-svg"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    style={{ position: 'absolute', inset: 0, opacity: 0.13 }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="star8" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        {/* Eight-pointed star */}
        <polygon
          points="50,5 61,35 93,35 67,57 77,88 50,70 23,88 33,57 7,35 39,35"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="white" strokeWidth="0.8" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="0.8" />
        {/* Connecting lines */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="0.4" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="white" strokeWidth="0.4" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#star8)" />
  </svg>
);

/* ── Main Component ── */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) errors.username = 'یوزر نیم درج کریں';
    if (!password)        errors.password = 'پاس ورڈ درج کریں';
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }

    setValidationErrors({});
    setError(null);
    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'یوزر نیم یا پاس ورڈ غلط ہے');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ══ LEFT PANEL ══ */}
      <div className="login-left-panel">
        <GeometricPattern />
        <div className="login-panel-geo-accent" />
        <div className="login-panel-geo-accent2" />

        <div className="login-panel-content">
          <img src="/1.png" alt="Logo" className="login-panel-logo" />
          <h1 className="login-panel-title">ایڈمن پینل</h1>
          <p className="login-panel-subtitle">طلبہ داخلہ مینجمنٹ سسٹم</p>
          <div className="login-panel-divider" />

          <div className="login-panel-badges">
            <div className="login-panel-badge">
              <IconUsers />
              <span>طلبہ کا مکمل ریکارڈ</span>
            </div>
            <div className="login-panel-badge">
              <IconChart />
              <span>رپورٹس اور تجزیہ</span>
            </div>
            <div className="login-panel-badge">
              <IconShield />
              <span>محفوظ اور قابل اعتماد</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="login-right-panel">
        <div className="login-right-inner">
          <div className="login-form-accent" />
          <h2 className="login-form-heading">خوش آمدید</h2>
          <p className="login-form-sub">جاری رکھنے کے لیے لاگ ان کریں</p>

          {error && (
            <div className="login-alert">
              <IconAlert />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="login-input-group">
              <label htmlFor="username" className="login-input-label">یوزر نیم</label>
              <div className="login-input-wrapper">
                <input
                  id="username"
                  type="text"
                  className={`login-field${validationErrors.username ? ' login-field-error' : ''}`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setValidationErrors(v => ({ ...v, username: undefined })); }}
                  placeholder="یوزر نیم درج کریں"
                  disabled={isLoading}
                  autoComplete="username"
                />
                <span className="login-input-icon"><IconUser /></span>
              </div>
              {validationErrors.username && (
                <div className="login-error-msg">{validationErrors.username}</div>
              )}
            </div>

            {/* Password */}
            <div className="login-input-group">
              <label htmlFor="password" className="login-input-label">پاس ورڈ</label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-field${validationErrors.password ? ' login-field-error' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setValidationErrors(v => ({ ...v, password: undefined })); }}
                  placeholder="پاس ورڈ درج کریں"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-input-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'پاس ورڈ چھپائیں' : 'پاس ورڈ دکھائیں'}
                >
                  <IconLock />
                </button>
              </div>
              {validationErrors.password && (
                <div className="login-error-msg">{validationErrors.password}</div>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="login-spinner" />
                  لاگ ان ہو رہا ہے...
                </>
              ) : (
                'لاگ ان'
              )}
            </button>
          </form>

          <p className="login-copyright">© {new Date().getFullYear()} جامعہ مینجمنٹ سسٹم</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
