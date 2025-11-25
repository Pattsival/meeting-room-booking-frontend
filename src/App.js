import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './components/Booking/MyBookings';
import AllBookings from './components/Booking/AllBookings';
import AdminDashboard from './components/Admin/AdminDashboard';
import RoomCalendar from './components/Booking/RoomCalendar';
import Home from './pages/Home';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/bookings" element={<AllBookings />} />
        <Route path="/rooms/:roomId/calendar" element={<RoomCalendar />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;