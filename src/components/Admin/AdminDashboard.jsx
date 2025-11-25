import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardCharts from './DashboardCharts';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/statistics');
      setStats(res.data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">กำลังโหลด...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👨‍💼 เมนูแอดมิน</h1>
        <p>จัดการระบบจองห้องประชุม</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 ภาพรวม
        </button>
        <button
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          📈 วิเคราะห์ข้อมูล
        </button>
        <button
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          🏨 ห้องประชุม
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🎫 การจอง
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card users">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>ผู้ใช้ทั้งหมด</h3>
                <p className="stat-number">{stats.users.total}</p>
                <small>ผู้ดูแล: {stats.users.admins} | ผู้ใช้: {stats.users.regularUsers}</small>
              </div>
            </div>

            <div className="stat-card rooms">
              <div className="stat-icon">🏨</div>
              <div className="stat-content">
                <h3>ห้องประชุมทั้งหมด</h3>
                <p className="stat-number">{stats.rooms.total}</p>
                <small>ห้องประชุมที่พร้อมใช้งาน</small>
              </div>
            </div>

            <div className="stat-card bookings">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>การจองทั้งหมด</h3>
                <p className="stat-number">{stats.bookings.total}</p>
                <small>การจองตลอดเวลา</small>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>รออนุมัติ</h3>
                <p className="stat-number">{stats.bookings.pending}</p>
                <small>รอการอนุมัติ</small>
              </div>
            </div>

            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>อนุมัติแล้ว</h3>
                <p className="stat-number">{stats.bookings.approved}</p>
                <small>การจองที่ได้รับการยืนยัน</small>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>ปฏิเสธ</h3>
                <p className="stat-number">{stats.bookings.rejected}</p>
                <small>การจองที่ถูกปฏิเสธ</small>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2>⚡ เมนูด่วน</h2>
            <div className="quick-actions-admin">
              <button onClick={() => setActiveTab('bookings')} className="action-btn">
                <span className="action-icon">🎫</span>
                <div>
                  <strong>จัดการการจอง</strong>
                  <small>{stats.bookings.pending} รออนุมัติ</small>
                </div>
              </button>
              <button onClick={() => setActiveTab('rooms')} className="action-btn">
                <span className="action-icon">🏨</span>
                <div>
                  <strong>จัดการห้องประชุม</strong>
                  <small>{stats.rooms.total} ห้อง</small>
                </div>
              </button>
              <button onClick={() => setActiveTab('charts')} className="action-btn">
                <span className="action-icon">📈</span>
                <div>
                  <strong>ดูข้อมูลวิเคราะห์</strong>
                  <small>กราफและรายงาน</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'charts' && <DashboardCharts />}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && <RoomManagement />}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && <BookingManagement />}
    </div>
  );
};

export default AdminDashboard;