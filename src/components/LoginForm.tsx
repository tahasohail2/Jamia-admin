import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = 'یوزر نیم درج کریں';
    }
    if (!password) {
      errors.password = 'پاس ورڈ درج کریں';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setError(null);
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      // Navigation will be handled by LoginPage useEffect
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'یوزر نیم یا پاس ورڈ غلط ہے');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          یوزر نیم
        </label>
        <input
          type="text"
          id="username"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
          placeholder="یوزر نیم درج کریں"
        />
        {validationErrors.username && (
          <div className="form-error">{validationErrors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          پاس ورڈ
        </label>
        <input
          type="password"
          id="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          placeholder="پاس ورڈ درج کریں"
        />
        {validationErrors.password && (
          <div className="form-error">{validationErrors.password}</div>
        )}
      </div>

      {error && (
        <div className="login-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-login"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            لاگ ان ہو رہا ہے...
          </>
        ) : (
          'لاگ ان'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
