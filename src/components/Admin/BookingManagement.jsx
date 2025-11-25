import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      let url = '/admin/bookings';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const res = await api.get(url);
      setBookings(res.data.bookings || res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      alert(`✅ Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/admin/bookings/${bookingId}`);
        alert('✅ Booking deleted');
        fetchBookings();
      } catch (err) {
        alert('❌ Error: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleViewImage = (booking) => {
    if (booking.bookingImage && booking.bookingImage.data) {
      setSelectedImage({
        data: booking.bookingImage.data,
        fileName: booking.bookingImage.fileName || 'หนังสือการจอง',
        booking: booking
      });
      setShowImageModal(true);
    } else {
      alert('ℹ️ ไม่มีรูปภาพหนังสือการจอง');
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="booking-management">
      <div className="management-header">
        <h2>📋 Manage Bookings</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            ✅ Approved
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">No bookings found</div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Date</th>
                <th>Time</th>
                <th>User</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Image</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td data-label="Room">
                    <strong>{booking.roomId.roomNumber}</strong>
                    <br />
                    <small>{booking.roomId.roomName}</small>
                  </td>
                  <td data-label="Date">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td data-label="Time">{booking.startTime} - {booking.endTime}</td>
                  <td data-label="User">{booking.userId.fullName}</td>
                  <td data-label="Department">{booking.department}</td>
                  <td data-label="Purpose">{booking.purpose}</td>
                  <td data-label="Image">
                    {booking.bookingImage && booking.bookingImage.data ? (
                      <button
                        onClick={() => handleViewImage(booking)}
                        className="btn-view-image"
                        title="ดูหนังสือการจอง"
                      >
                        🖼️ ดูรูป
                      </button>
                    ) : (
                      <span className="no-image-badge">ไม่มีรูป</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td data-label="Actions" className="action-buttons">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking._id, 'approved')}
                          className="btn-approve"
                          title="Approve"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking._id, 'rejected')}
                          className="btn-reject"
                          title="Reject"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="btn-delete-row"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>📄 หนังสือการจอง</h3>
              <button onClick={closeImageModal} className="btn-close-modal">
                ✕
              </button>
            </div>
            
            <div className="image-modal-body">
              <div className="booking-info-section">
                <p><strong>ห้อง:</strong> {selectedImage.booking.roomId.roomNumber} - {selectedImage.booking.roomId.roomName}</p>
                <p><strong>ผู้จอง:</strong> {selectedImage.booking.userId.fullName}</p>
                <p><strong>แผนก:</strong> {selectedImage.booking.department}</p>
                <p><strong>วันที่:</strong> {new Date(selectedImage.booking.bookingDate).toLocaleDateString('th-TH')}</p>
                <p><strong>เวลา:</strong> {selectedImage.booking.startTime} - {selectedImage.booking.endTime}</p>
              </div>
              
              <div className="image-container">
                <img 
                  src={selectedImage.data} 
                  alt={selectedImage.fileName}
                  className="booking-image-preview"
                />
              </div>
              
              <div className="image-modal-actions">
                <a 
                  href={selectedImage.data} 
                  download={selectedImage.fileName}
                  className="btn-download"
                >
                  💾 ดาวน์โหลด
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;