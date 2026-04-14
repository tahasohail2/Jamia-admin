import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SessionProvider } from './context/SessionContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResultsPage from './pages/ResultsPage';
import UserManagementPage from './pages/UserManagementPage';
import BatchWiseListPage from './pages/BatchWiseListPage';
import SettingsPage from './pages/SettingsPage';
import AddStudentPage from './pages/AddStudentPage';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SessionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
           
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/batch-list"
              element={
                <ProtectedRoute>
                  <BatchWiseListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-student"
              element={
                <ProtectedRoute>
                  <AddStudentPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect old dashboard route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer />
        </Router>
        </SessionProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
