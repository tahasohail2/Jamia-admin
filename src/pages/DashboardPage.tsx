import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { adminApi } from '../services/adminApi';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalEntries: number;
  approvedEntries: number;
  disapprovedEntries: number;
  pendingEntries: number;
  recentEntries: Array<{ date: string; count: number }>;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    approvedEntries: 0,
    disapprovedEntries: 0,
    pendingEntries: 0,
    recentEntries: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      // Fetch all records to calculate stats
      const response = await adminApi.getRecords({ pageSize: 1000 });
      const records = response.data;

      const approved = records.filter(r => r.approvalStatus === 'approved').length;
      const disapproved = records.filter(r => r.approvalStatus === 'disapproved').length;
      const pending = records.filter(r => !r.approvalStatus).length;

      // Calculate entries by date (last 7 days)
      const dateMap = new Map<string, number>();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      last7Days.forEach(date => dateMap.set(date, 0));

      records.forEach(record => {
        const date = new Date(record.submittedAt).toISOString().split('T')[0];
        if (dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      });

      const recentEntries = Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));

      setStats({
        totalEntries: records.length,
        approvedEntries: approved,
        disapprovedEntries: disapproved,
        pendingEntries: pending,
        recentEntries,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approvalPercentage = stats.totalEntries > 0
    ? Math.round((stats.approvedEntries / stats.totalEntries) * 100)
    : 0;

  const disapprovalPercentage = stats.totalEntries > 0
    ? Math.round((stats.disapprovedEntries / stats.totalEntries) * 100)
    : 0;

  const maxCount = Math.max(...stats.recentEntries.map(e => e.count), 1);

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2 className="dashboard-title">ڈیش بورڈ</h2>
          <p className="dashboard-subtitle">تجزیاتی جائزہ</p>
        </div>

        {isLoading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>ڈیٹا لوڈ ہو رہا ہے...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon total">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">کل اندراجات</p>
                  <h3 className="kpi-value">{stats.totalEntries}</h3>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon approved">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">منظور شدہ</p>
                  <h3 className="kpi-value">{stats.approvedEntries}</h3>
                  <span className="kpi-badge approved">{approvalPercentage}%</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon disapproved">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">مسترد شدہ</p>
                  <h3 className="kpi-value">{stats.disapprovedEntries}</h3>
                  <span className="kpi-badge disapproved">{disapprovalPercentage}%</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">زیر التواء</p>
                  <h3 className="kpi-value">{stats.pendingEntries}</h3>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Bar Chart - Entries Over Time */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">حالیہ اندراجات</h3>
                  <p className="chart-subtitle">آخری 7 دن</p>
                </div>
                <div className="chart-content">
                  <div className="bar-chart">
                    {stats.recentEntries.map((entry, index) => {
                      const height = (entry.count / maxCount) * 100;
                      const date = new Date(entry.date);
                      const dayName = date.toLocaleDateString('ur-PK', { weekday: 'short' });
                      
                      return (
                        <div key={index} className="bar-item">
                          <div className="bar-wrapper">
                            <div 
                              className="bar" 
                              style={{ height: `${height}%` }}
                              title={`${entry.count} entries`}
                            >
                              <span className="bar-value">{entry.count}</span>
                            </div>
                          </div>
                          <span className="bar-label">{dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Donut Chart - Approval Status */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">منظوری کی شرح</h3>
                  <p className="chart-subtitle">کل اندراجات کا تناسب</p>
                </div>
                <div className="chart-content">
                  <div className="donut-chart">
                    <svg viewBox="0 0 200 200" className="donut-svg">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="30"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#28a745"
                        strokeWidth="30"
                        strokeDasharray={`${approvalPercentage * 5.03} 503`}
                        strokeDashoffset="0"
                        transform="rotate(-90 100 100)"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#dc3545"
                        strokeWidth="30"
                        strokeDasharray={`${disapprovalPercentage * 5.03} 503`}
                        strokeDashoffset={`-${approvalPercentage * 5.03}`}
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                    <div className="donut-center">
                      <span className="donut-total">{stats.totalEntries}</span>
                      <span className="donut-label">کل</span>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="legend-item">
                      <span className="legend-dot approved"></span>
                      <span className="legend-label">منظور شدہ ({stats.approvedEntries})</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot disapproved"></span>
                      <span className="legend-label">مسترد شدہ ({stats.disapprovedEntries})</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot pending"></span>
                      <span className="legend-label">زیر التواء ({stats.pendingEntries})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
