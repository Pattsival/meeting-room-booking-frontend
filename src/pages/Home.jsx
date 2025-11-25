import { useNavigate } from 'react-router-dom';
import './Pages.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>📅 ระบบจองห้องประชุม</h1>
        <p>จัดการการจองห้องประชุมของคุณอย่างมีประสิทธิภาพ</p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/login')} className="btn-primary">
            เริ่มต้นใช้งาน
          </button>
          <button onClick={() => navigate('/bookings')} className="btn-secondary">
            ดูการจอง
          </button>
        </div>
      </div>

      <div className="features">
        <div className="feature">
          <h3>📝 จองง่าย</h3>
          <p>จองห้องประชุมได้ในไม่กี่คลิก</p>
        </div>
        <div className="feature">
          <h3>👥 หลายผู้ใช้</h3>
          <p>รองรับผู้ใช้และแผนกหลายแผนก</p>
        </div>
        <div className="feature">
          <h3>👨‍💼 ควบคุมโดยผู้ดูแล</h3>
          <p>อนุมัติหรือปฏิเสธการจองผ่านแผงผู้ดูแล</p>
        </div>
      </div>
    </div>
  );
};

export default Home;