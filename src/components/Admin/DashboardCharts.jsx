import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Admin.css';

const DashboardCharts = () => {
  const [trendData, setTrendData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchAllStats();
  }, [timeRange]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [trend, rooms, dept, monthly] = await Promise.all([
        api.get(`/admin/stats/bookings-trend?days=${timeRange}`),
        api.get('/admin/stats/popular-rooms'),
        api.get('/admin/stats/department-usage'),
        api.get('/admin/stats/monthly-stats')
      ]);

      setTrendData(trend.data);
      setRoomData(rooms.data);
      setDeptData(dept.data);
      setMonthlyData(monthly.data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
    } finally {
      setLoading(false);
    }
  };

  // สีตามธีม - โทนสีน้ำเงิน
  const COLORS = [
    '#1e3a8a', // สีน้ำเงินเข้ม (Primary)
    '#3b82f6', // สีน้ำเงินสว่าง
    '#0891b2', // สีฟ้า-เขียว (Cyan)
    '#0284c7', // สีฟ้า
    '#60a5fa'  // สีฟ้าอ่อน
  ];

  if (loading) return <div className="loading">กำลังโหลดกราฟ...</div>;

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>📊 การวิเคราะห์และข้อมูลเชิงลึก</h2>
        <div className="time-range-selector">
          <label>ช่วงเวลา:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
            <option value={7}>7 วันที่ผ่านมา</option>
            <option value={14}>14 วันที่ผ่านมา</option>
            <option value={30}>30 วันที่ผ่านมา</option>
          </select>
        </div>
      </div>

      {/* Bookings Trend Chart */}
      <div className="chart-card">
        <h3>📈 แนวโน้มการจอง</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #1e3a8a',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#1e3a8a" 
              strokeWidth={3} 
              name="ทั้งหมด"
              dot={{ fill: '#1e3a8a', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="approved" 
              stroke="#059669" 
              strokeWidth={3} 
              name="อนุมัติแล้ว"
              dot={{ fill: '#059669', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              name="รออนุมัติ"
              dot={{ fill: '#f59e0b', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              stroke="#dc2626" 
              strokeWidth={3} 
              name="ปฏิเสธ"
              dot={{ fill: '#dc2626', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Stats */}
      <div className="chart-card">
        <h3>📅 การจองรายเดือน (6 เดือนที่ผ่านมา)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #1e3a8a',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="total" 
              fill="#1e3a8a" 
              name="การจองทั้งหมด"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="approved" 
              fill="#059669" 
              name="อนุมัติแล้ว"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        {/* Popular Rooms Chart */}
        <div className="chart-card half">
          <h3>🏨 ห้องที่ได้รับความนิยมสูงสุด</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomData.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #1e3a8a',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#1e3a8a" 
                name="การจองทั้งหมด"
                radius={[0, 8, 8, 0]}
              />
              <Bar 
                dataKey="approved" 
                fill="#059669" 
                name="อนุมัติแล้ว"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Usage Chart */}
        <div className="chart-card half">
          <h3>🏢 การใช้งานตามแผนก</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deptData.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                strokeWidth={2}
                stroke="#fff"
              >
                {deptData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #1e3a8a',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="summary-card">
          <h4>🏆 ห้องยอดนิยม</h4>
          <p className="big-number">{roomData[0]?.name || 'ไม่มีข้อมูล'}</p>
          <small>{roomData[0]?.total || 0} การจอง</small>
        </div>
        <div className="summary-card">
          <h4>🏢 แผนกยอดนิยม</h4>
          <p className="big-number">{deptData[0]?.name || 'ไม่มีข้อมูล'}</p>
          <small>{deptData[0]?.total || 0} การจอง</small>
        </div>
        <div className="summary-card">
          <h4>📊 อัตราการอนุมัติ</h4>
          <p className="big-number">
            {deptData.length > 0
              ? Math.round((deptData.reduce((sum, d) => sum + d.approved, 0) / 
                  deptData.reduce((sum, d) => sum + d.total, 0)) * 100)
              : 0}%
          </p>
          <small>อัตราการอนุมัติโดยรวม</small>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;