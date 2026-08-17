// components/layout/Shell.jsx

import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/misc';
import { useMaintenance } from '../../hooks/useMaintenance';
import MaintenancePage from '../../components/MaintenancePage';
import "./shell.css";
import logo from '../../assests/logo.png';

import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  Plane,
  Users,
  Search,
  ChevronDown,
  Settings,
  CreditCard,
  Home
} from 'lucide-react';

const linkClass = ({ isActive }) => `
  shell__link 
  ${isActive ? 'shell__link--active' : ''}
`;

export default function Shell({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { maintenanceMode, maintenanceMessage, isBlocked, loading } = useMaintenance();
  const [unread, setUnread] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return undefined;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await notificationService.unreadCount();
        if (!cancelled) setUnread(res.data.unreadCount);
      } catch {
        // A failed badge count is not worth interrupting anyone over.
      }
    };

    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ✅ Moved navigation config outside conditional logic
  const getNotificationsPath = () => {
    return isAdmin ? '/admin/notifications' : '/notifications';
  };

  const getBookingsPath = () => {
    return isAdmin ? '/admin/bookings' : '/bookings';
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, show: true },
    { to: '/flights', label: 'Flights', icon: Plane, show: true },
    { 
      to: getBookingsPath(),
      label: isAdmin ? 'All Bookings' : 'Bookings',
      icon: Calendar,
      show: isAuthenticated 
    },
    { 
      to: getNotificationsPath(),
      label: 'Notifications', 
      icon: Bell, 
      show: isAuthenticated, 
      badge: unread 
    },
    { to: '/dashboard', label: isAdmin ? 'Overview' : 'My Travel', icon: LayoutDashboard, show: isAuthenticated },
    ...(isAdmin ? [
      { to: '/admin/flights', label: 'Manage Flights', icon: Settings, show: true },
      { to: '/admin/users', label: 'People', icon: Users, show: true },
      { to: '/admin/settings', label: 'Settings', icon: Settings, show: true },
    ] : []),
  ];

  // ✅ NOW we can do conditional rendering AFTER all hooks
  // Show loading state
  if (loading) {
    return (
      <div className="shell">
        <div className="center" style={{ padding: '48px 0' }}>
          <div className="spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ Show maintenance page for non-admin users
  if (isBlocked) {
    return (
      <div className="shell">
        <header className="shell__bar">
          <div className="shell__bar-inner">
            <div className="shell__bar-left">
              <Link to="/" className="shell__brand">
                <div className="shell__brand-icon">
                  <img src={logo} alt="Rohan Travels & Tours" className="shell__brand-logo" />
                </div>
                <div className="shell__brand-text">
                  <span className="shell__brand-name">Rohan Travels</span>
                  <span className="shell__brand-tagline">&amp; Tours</span>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className="shell__main">
          <MaintenancePage message={maintenanceMessage} />
        </main>
        <footer className="shell__foot">
          <div className="shell__foot-inner">
            <div className="shell__foot-brand">
              <span className="shell__foot-name">Rohan Travels &amp; Tours</span>
              <span className="shell__foot-copy">&copy; {new Date().getFullYear()} All rights reserved</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ✅ Show maintenance banner for admin when maintenance is on
  const showMaintenanceBanner = isAdmin && maintenanceMode;

  return (
    <div className="shell">
      {/* Maintenance Banner for Admin */}
      {showMaintenanceBanner && (
        <div className="maintenance-banner">
          ⚠️ Maintenance Mode is ENABLED - Only admins can access the system
          <button 
            className="maintenance-banner-close"
            onClick={() => navigate('/admin/settings')}
          >
            Go to Settings
          </button>
        </div>
      )}

      {/* Header */}
      <header className="shell__bar">
        <div className="shell__bar-inner">
          <div className="shell__bar-left">
            {/* Mobile Menu Toggle */}
            <button
              className="shell__mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Brand with Logo */}
            <Link to="/" className="shell__brand" onClick={closeMobileMenu}>
              <div className="shell__brand-icon">
                <img
                  src={logo}
                  alt="Rohan Travels & Tours"
                  className="shell__brand-logo"
                />
              </div>
              <div className="shell__brand-text">
                <span className="shell__brand-name">Rohan Travels</span>
                <span className="shell__brand-tagline">&amp; Tours</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="shell__nav" aria-label="Main navigation">
            {navItems.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  end={item.end}
                  onClick={closeMobileMenu}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="shell__badge" aria-label={`${item.badge} unread`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="shell__actions">
            {isAuthenticated ? (
              <div className="shell__user-menu">
                <button
                  className="shell__user-trigger"
                  onClick={handleUserMenuToggle}
                  aria-expanded={userMenuOpen}
                >
                  <div className="shell__avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span className="shell__avatar-initial">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="shell__user-info">
                    <span className="shell__user-name">{user?.name}</span>
                    <span className="shell__user-role">
                      {isAdmin ? 'Administrator' : 'Agent'}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shell__chevron ${userMenuOpen ? 'shell__chevron--open' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="shell__dropdown">
                    <div className="shell__dropdown-header">
                      <div className="shell__dropdown-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <span className="shell__dropdown-initial">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="shell__dropdown-user">
                        <div className="shell__dropdown-name">{user?.name}</div>
                        <div className="shell__dropdown-email">{user?.email}</div>
                      </div>
                    </div>

                    <div className="shell__dropdown-divider" />

                    <Link to="/account" className="shell__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={18} />
                      <span>My Account</span>
                    </Link>
                    <Link to="/ledger" className="shell__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <CreditCard size={18} />
                      <span>Ledger</span>
                    </Link>
                    <Link to="/settings" className="shell__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>

                    <div className="shell__dropdown-divider" />

                    <button className="shell__dropdown-item shell__dropdown-item--danger" onClick={handleSignOut}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="shell__auth-buttons">
                <Link to="/login" className="btn btn--ghost btn--sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Fixed Position */}
        <div className={`shell__mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
        <div className={`shell__mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="shell__mobile-nav-inner">
            {navItems.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    shell__mobile-link 
                    ${isActive ? 'shell__mobile-link--active' : ''}
                  `}
                  end={item.end}
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="shell__badge" aria-label={`${item.badge} unread`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {!isAuthenticated && (
              <div className="shell__mobile-auth">
                <Link to="/login" className="btn btn--primary btn--full" onClick={closeMobileMenu}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn--ghost btn--full" onClick={closeMobileMenu}>
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="shell__main">{children}</main>

      {/* Footer */}
      <footer className="shell__foot">
        <div className="shell__foot-inner">
          <div className="shell__foot-brand">
            <span className="shell__foot-name">Rohan Travels &amp; Tours</span>
            <span className="shell__foot-copy">&copy; {new Date().getFullYear()} All rights reserved</span>
          </div>
          <div className="shell__foot-links">
            <Link to="/privacy" className="shell__foot-link">Privacy Policy</Link>
            <Link to="/terms" className="shell__foot-link">Terms of Service</Link>
            <Link to="/contact" className="shell__foot-link">Contact</Link>
          </div>
          <div className="shell__foot-date">
            <span className="mono">
              {new Date().toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}