import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo-wrapper">
          <img src="/1.png" alt="Logo" className="login-logo" />
        </div>
        <div className="login-card">
          <div className="login-header">
            <h1>ایڈمن پینل</h1>
            <p>طلبہ داخلہ مینجمنٹ سسٹم</p>
          </div>
          <LoginForm />
          <div className="login-footer">
            {/* <p className="login-note">
              ڈیفالٹ اسناد: <strong>admin</strong> / <strong>admin123</strong>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
