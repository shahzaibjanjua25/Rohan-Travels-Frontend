// frontend/src/App.jsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Shell from './components/layout/Shell';

// Public Pages
import Home from './pages/Home';
import FlightSearch from './pages/FlightSearch';
import FlightDetail from './pages/FlightDetail';
import UserFlights from './pages/UserFlights';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import About from './pages/About';  // ← ADD THIS

// Authenticated Pages
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Ledger from './pages/Ledger';
import BookingForm from './pages/BookingForm';

// Admin Pages
import AdminFlights from './pages/admin/AdminFlights';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import CreateFlight from './pages/admin/CreateFlight';
import EditFlight from './pages/admin/EditFlight';

import UmrahPackages from './pages/UmrahPackages';
import UmrahBookingForm from './pages/UmrahBookingForm';
import UmrahBookings from './pages/UmrahBookings';
import UmrahBookingDetail from './pages/UmrahBookingDetail';
import AdminUmrahPackages from './pages/admin/AdminUmrahPackages';
import AdminUmrahCreatePackage from './pages/admin/AdminUmrahCreatePackage';
import AdminUmrahEditPackage from './pages/admin/AdminUmrahEditPackage';
import AdminUmrahBookings from './pages/admin/AdminUmrahBookings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell>
          <Routes>
            {/* ============================================
                PUBLIC ROUTES
                ============================================ */}
            <Route path="/" element={<Home />} />
            <Route path="/flights" element={<UserFlights />} />
            <Route path="/flights/:id" element={<FlightDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />  {/* ← ADD THIS */}

            {/* ============================================
                PROTECTED ROUTES (Require Authentication)
                ============================================ */}
            <Route
              path="/flights/:id/book"
              element={
                <ProtectedRoute>
                  <BookingForm />
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
            <Route path="/umrah" element={<UmrahPackages />} />
            <Route path="/umrah/packages/:id/book" element={
              <ProtectedRoute>
                <UmrahBookingForm />
              </ProtectedRoute>
            } />
            <Route path="/umrah/bookings" element={
              <ProtectedRoute>
                <UmrahBookings />
              </ProtectedRoute>
            } />
            <Route path="/umrah/bookings/:id" element={
              <ProtectedRoute>
                <UmrahBookingDetail />
              </ProtectedRoute>
            } />

// Admin routes
            <Route path="/admin/umrah" element={<Navigate to="/admin/umrah/packages" replace />} />
            <Route path="/admin/umrah/packages" element={
              <ProtectedRoute adminOnly>
                <AdminUmrahPackages />
              </ProtectedRoute>
            } />
            <Route path="/admin/umrah/packages/create" element={
              <ProtectedRoute adminOnly>
                <AdminUmrahCreatePackage />
              </ProtectedRoute>
            } />
            <Route path="/admin/umrah/packages/:id/edit" element={
              <ProtectedRoute adminOnly>
                <AdminUmrahEditPackage />
              </ProtectedRoute>
            } />
            <Route path="/admin/umrah/bookings" element={
              <ProtectedRoute adminOnly>
                <AdminUmrahBookings />
              </ProtectedRoute>
            } />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <Ledger />
                </ProtectedRoute>
              }
            />

            {/* ============================================
                ADMIN ROUTES (Require Admin Role)
                ============================================ */}
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

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute adminOnly>
                  <AdminNotifications />
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
              path="/admin"
              element={<Navigate to="/admin/flights" replace />}
            />

            {/* ============================================
                404 - NOT FOUND
                ============================================ */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </AuthProvider>
    </BrowserRouter>
  );
}