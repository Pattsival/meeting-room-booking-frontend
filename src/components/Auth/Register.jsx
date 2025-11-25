import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // โหลดข้อมูลแผนก
  useState(() => {
    api.get('/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.department
      );
      alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'การสมัครสมาชิกล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo Section */}
        <div className="auth-logo">
          <img src="/logo1.webp" alt="Logo" className="logo-image" />
          <h1>สมัครสมาชิก</h1>
          <p className="auth-subtitle">ระบบจองห้องประชุมเทศบาลนครสวรรค์</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่อ-นามสกุล:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="--"
            />
          </div>

          <div className="form-group">
            <label>อีเมล:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="--"
            />
          </div>

          <div className="form-group">
            <label>รหัสผ่าน:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="------"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>แผนก:</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">เลือกแผนก</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'กำลังโหลด...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="auth-link">
          มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  );
};

export default Register;