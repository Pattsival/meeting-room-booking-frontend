import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Booking.css';

const BookingForm = ({ bookingId = null, onClose = null }) => {
  const [formData, setFormData] = useState({
    roomId: '',
    fullName: '',
    department: '',
    customDepartment: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!bookingId);
  const [hasTimeConflict, setHasTimeConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // สำหรับอัปโหลดรูปภาพ
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null); // Base64 data
  const [existingImage, setExistingImage] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/rooms'),
      api.get('/departments')
    ]).then(([roomRes, deptRes]) => {
      setRooms(roomRes.data.rooms || roomRes.data);
      setDepartments(deptRes.data);
    }).catch(err => console.error('Error loading rooms/departments:', err));

    if (isEditing && bookingId) {
      api.get(`/bookings/${bookingId}`).then((res) => {
        const booking = res.data;
        
        setFormData({
          roomId: booking.roomId._id || booking.roomId,
          fullName: booking.fullName,
          department: booking.department,
          customDepartment: '',
          bookingDate: booking.bookingDate.split('T')[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose
        });
        
        // ถ้ามีรูปภาพเดิม
        if (booking.bookingImage && booking.bookingImage.data) {
          setExistingImage(booking.bookingImage);
        }
      }).catch(err => console.error('Error loading booking:', err));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName,
        department: user.department
      }));
    }
  }, [bookingId, isEditing, user]);

  // ตรวจสอบเวลาซ้อน
  useEffect(() => {
    if (formData.roomId && formData.bookingDate && formData.startTime && formData.endTime) {
      checkTimeConflicts();
    } else {
      setHasTimeConflict(false);
      setConflictMessage('');
      setAvailableSlots([]);
    }
  }, [formData.roomId, formData.bookingDate, formData.startTime, formData.endTime]);

  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const checkTimeConflicts = async () => {
    try {
      setCheckingAvailability(true);
      
      if (!validateTimeFormat(formData.startTime) || !validateTimeFormat(formData.endTime)) {
        setHasTimeConflict(true);
        setConflictMessage('⚠️ กรุณากรอกเวลาในรูปแบบ HH:MM (เช่น 09:00, 13:30)');
        setAvailableSlots([]);
        return;
      }

      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;

      const workStartMinutes = 8 * 60;
      const workEndMinutes = 18 * 60;

      if (startTimeInMinutes < workStartMinutes || endTimeInMinutes > workEndMinutes) {
        setHasTimeConflict(true);
        setConflictMessage('⚠️ เวลาทำการคือ 08:00 - 18:00 เท่านั้น');
        setAvailableSlots([]);
        return;
      }

      if (startTimeInMinutes >= endTimeInMinutes) {
        setHasTimeConflict(true);
        setConflictMessage('⚠️ เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
        setAvailableSlots([]);
        return;
      }

      const res = await api.get('/bookings', {
        params: {
          roomId: formData.roomId,
          date: formData.bookingDate
        }
      });

      let bookings = res.data.bookings || res.data || [];
      
      if (isEditing && bookingId) {
        bookings = bookings.filter(b => b._id !== bookingId);
      }

      const conflicts = bookings.filter(booking => {
        const [existingStartHour, existingStartMin] = booking.startTime.split(':').map(Number);
        const [existingEndHour, existingEndMin] = booking.endTime.split(':').map(Number);
        
        const existingStartTime = existingStartHour * 60 + existingStartMin;
        const existingEndTime = existingEndHour * 60 + existingEndMin;

        return startTimeInMinutes < existingEndTime && endTimeInMinutes > existingStartTime;
      });

      if (conflicts.length > 0) {
        const conflictTimes = conflicts.map(b => `${b.startTime} - ${b.endTime}`);
        setHasTimeConflict(true);
        setConflictMessage(`❌ ห้องนี้มีการจองในเวลา: ${conflictTimes.join(', ')}`);
      } else {
        setHasTimeConflict(false);
        setConflictMessage('');
      }

      generateAvailableSlots(bookings);
    } catch (err) {
      console.error('Error checking conflicts:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const generateAvailableSlots = (bookings) => {
    const availableHours = [];
    
    for (let hour = 8; hour < 18; hour++) {
      const hourStart = hour * 60;
      const hourEnd = (hour + 1) * 60;

      const isAvailable = !bookings.some(booking => {
        const [bStartHour, bStartMin] = booking.startTime.split(':').map(Number);
        const [bEndHour, bEndMin] = booking.endTime.split(':').map(Number);
        
        const bStart = bStartHour * 60 + bStartMin;
        const bEnd = bEndHour * 60 + bEndMin;

        return hourStart < bEnd && hourEnd > bStart;
      });

      if (isAvailable) {
        availableHours.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }

    setAvailableSlots(availableHours);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // แปลงรูปเป็น Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        setError('❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('❌ ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setError('');
      
      // แปลงเป็น Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setImageData({
          data: base64String,
          contentType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setImagePreview(null);
  };

  const handleRemoveExistingImage = () => {
    setExistingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (hasTimeConflict) {
      setError('❌ ไม่สามารถจองได้ เพราะเวลาซ้อนกับการจองอื่น กรุณาเลือกเวลาอื่น');
      setLoading(false);
      return;
    }

    try {
      // ถ้าเลือก "อื่นๆ" ให้ใช้ค่าจาก customDepartment
      const finalDepartment = formData.department === 'other' 
        ? formData.customDepartment 
        : formData.department;

      const submitData = {
        roomId: formData.roomId,
        fullName: formData.fullName,
        department: finalDepartment,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose
      };

      // เพิ่มรูปภาพถ้ามี
      if (imageData) {
        submitData.bookingImage = imageData;
      }
      
      // ถ้าลบรูปเดิม
      if (isEditing && !existingImage && !imageData) {
        submitData.removeImage = true;
      }

      if (isEditing) {
        await api.put(`/bookings/${bookingId}`, submitData);
        alert('✅ อัปเดตการจองสำเร็จ');
      } else {
        await api.post('/bookings', submitData);
        alert('✅ สร้างการจองสำเร็จ');
        setFormData({
          roomId: '',
          fullName: '',
          department: '',
          customDepartment: '',
          bookingDate: '',
          startTime: '',
          endTime: '',
          purpose: ''
        });
        setImageData(null);
        setImagePreview(null);
      }

      if (onClose) {
        onClose();
      } else {
        navigate('/bookings/my-bookings');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก';
      setError('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <h2>{isEditing ? '✏️ แก้ไขการจอง' : '➕ สร้างการจอง'}</h2>

        {error && <div className="error-message">{error}</div>}
        {conflictMessage && <div className="warning-message">{conflictMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>ห้อง: *</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
              >
                <option value="">เลือกห้อง</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber} - {room.roomName} ({room.capacity} คน)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>ชื่อ-นามสกุล: *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="สมชาย ใจดี"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>สังกัด/กอง: *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">เลือกสังกัด/กอง</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
                <option value="other">อื่นๆ (ระบุเอง)</option>
              </select>
            </div>

            {formData.department === 'other' ? (
              <div className="form-group">
                <label>ระบุสังกัด/กอง: *</label>
                <input
                  type="text"
                  name="customDepartment"
                  value={formData.customDepartment}
                  onChange={handleChange}
                  required
                  placeholder="กรอกชื่อสังกัด/กอง"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>วันที่: *</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                  min={getTodayDate()}
                />
              </div>
            )}
          </div>

          {formData.department === 'other' && (
            <div className="form-row">
              <div className="form-group">
                <label>วันที่: *</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                  min={getTodayDate()}
                />
              </div>
              <div className="form-group"></div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>เวลาเริ่มประชุม: *</label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                placeholder="เช่น 09:00"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                title="กรุณากรอกเวลาในรูปแบบ HH:MM"
              />
              <small style={{color: '#666', fontSize: '0.85rem'}}>
                เวลาทำการ 08:00-18:00
              </small>
            </div>

            <div className="form-group">
              <label>เวลาสิ้นสุด: *</label>
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                placeholder="เช่น 12:00"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                title="กรุณากรอกเวลาในรูปแบบ HH:MM"
              />
              <small style={{color: '#666', fontSize: '0.85rem'}}>
                เวลาทำการ 08:00-18:00
              </small>
            </div>
          </div>
          {checkingAvailability && (
            <div className="checking-message">
              <p>🔄 กำลังตรวจสอบเวลา...</p>
            </div>
          )}

          <div className="form-group full-width">
            <label>วัตถุประสงค์: *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="หัวข้อการประชุม / วัตถุประสงค์"
              required
              rows="3"
            />
          </div>

          {/* อัปโหลดรูปภาพหนังสือการจอง */}
          <div className="form-group full-width">
            <label>📎 แนบหนังสือการจอง (ถ้ามี):</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="bookingImage"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
              <label htmlFor="bookingImage" className="image-upload-btn">
                📷 เลือกรูปภาพ
              </label>
              <small className="upload-hint">รองรับไฟล์ JPG, PNG, GIF (ไม่เกิน 5MB)</small>
            </div>

            {/* แสดงรูปที่มีอยู่แล้ว (กรณีแก้ไข) */}
            {existingImage && existingImage.data && !imagePreview && (
              <div className="image-preview-container">
                <p className="preview-label">📄 รูปภาพปัจจุบัน:</p>
                <img 
                  src={existingImage.data} 
                  alt="หนังสือการจอง" 
                  className="image-preview"
                />
                <button 
                  type="button" 
                  onClick={handleRemoveExistingImage}
                  className="btn-remove-image"
                >
                  🗑️ ลบรูปภาพ
                </button>
              </div>
            )}

            {/* แสดง preview รูปใหม่ */}
            {imagePreview && (
              <div className="image-preview-container">
                <p className="preview-label">📄 รูปภาพใหม่:</p>
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="btn-remove-image"
                >
                  🗑️ ลบรูปภาพ
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || hasTimeConflict} 
              className="btn-submit"
            >
              {loading ? 'กำลังบันทึก...' : isEditing ? '🔄 อัปเดตการจอง' : '✅ สร้างการจอง'}
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn-cancel">
                ❌ ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;