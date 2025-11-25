import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบล้มเหลว');
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
          <h1>เข้าสู่ระบบ</h1>
          <p className="auth-subtitle">ระบบจองห้องประชุมเทศบาลนครสวรรค์</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              placeholder="--"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="auth-link">
          ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
        </p>
      </div>
    </div>
  );
};

export default Login;