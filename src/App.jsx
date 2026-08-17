import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Shell from './components/layout/Shell';
import Ledger from './pages/Ledger';
import Home from './pages/Home';
// Test import first
// import AdminBookingsTest from './pages/admin/AdminBookingsTest';
// Then your real component
import AdminBookings from './pages/admin/AdminBookings';
import AdminSettings from './pages/admin/AdminSettings';
import FlightSearch from './pages/FlightSearch';
import FlightDetail from './pages/FlightDetail';
import UserFlights from './pages/UserFlights';
import BookingForm from './pages/BookingForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminFlights from './pages/admin/AdminFlights';
import AdminUsers from './pages/admin/AdminUsers';
import CreateFlight from './pages/admin/CreateFlight';
import EditFlight from './pages/admin/EditFlight';

export default function App() {
  console.log('🔴 App.jsx rendering');
  console.log('🔴 AdminBookings imported:', typeof AdminBookings);
  // console.log('🔴 AdminBookingsTest imported:', typeof AdminBookingsTest);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Shell>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/flights" element={<UserFlights />} />
            <Route path="/flights/:id" element={<FlightDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Ledger Route */}
            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <Ledger />
                </ProtectedRoute>
              }
            />

            {/* Admin Notifications Route */}
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute adminOnly>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />

            {/* TEST ROUTE - Put this FIRST to test
            <Route
              path="/admin/bookings-test"
              element={
                <ProtectedRoute adminOnly>
                  <AdminBookingsTest />
                </ProtectedRoute>
              }
            /> */}

            {/* Protected routes - require authentication */}
            <Route
              path="/flights/:id/book"
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            {/* Admin routes - require admin role */}
            <Route
              path="/admin/flights"
              element={
                <ProtectedRoute adminOnly>
                  <AdminFlights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/flights/create"
              element={
                <ProtectedRoute adminOnly>
                  <CreateFlight />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/flights/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <EditFlight />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* REAL ADMIN BOOKINGS ROUTE */}
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/flights" replace />} />

            {/* 404 - Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </AuthProvider>
    </BrowserRouter>
  );
}