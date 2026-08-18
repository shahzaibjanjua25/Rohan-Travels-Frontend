// components/layout/Shell.jsx

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/misc';
import { useMaintenance } from '../../hooks/useMaintenance';
import MaintenancePage from '../../components/MaintenancePage';
import './shell.css';
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
  ChevronDown,
  Settings,
  CreditCard,
  Home
} from 'lucide-react';

const MOBILE_BREAKPOINT = 1024;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

const linkClass = ({ isActive }) =>
  `shell__link${isActive ? ' shell__link--active' : ''}`;

const mobileLinkClass = ({ isActive }) =>
  `shell__mobile-link${isActive ? ' shell__mobile-link--active' : ''}`;

export default function Shell({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { maintenanceMode, maintenanceMessage, isBlocked, loading } = useMaintenance();

  const [unread, setUnread] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // Viewport tracking
  // ============================================================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Close menu when going to desktop
      if (!mobile) setIsMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================
  // Close mobile menu when navigating
  // ============================================================
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ============================================================
  // Lock body scroll when mobile menu is open
  // ============================================================
  useEffect(() => {
    if (!isMobile || !isMobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileMenuOpen]);

  // ============================================================
  // ESC key closes menus
  // ============================================================
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      setUserMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ============================================================
  // Click outside user menu closes it
  // ============================================================
  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [userMenuOpen]);

  // ============================================================
  // Unread badge polling
  // ============================================================
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await notificationService.unreadCount();
        if (!cancelled) setUnread(res.data.unreadCount);
      } catch {
        // Ignore
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
    setUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // ============================================================
  // Navigation config
  // ============================================================
  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, show: true },
    { to: '/flights', label: 'Flights', icon: Plane, show: true },
    {
      to: isAdmin ? '/admin/bookings' : '/bookings',
      label: isAdmin ? 'All Bookings' : 'Bookings',
      icon: Calendar,
      show: isAuthenticated
    },
    {
      to: isAdmin ? '/admin/notifications' : '/notifications',
      label: 'Notifications',
      icon: Bell,
      show: isAuthenticated,
      badge: unread
    },
    {
      to: '/dashboard',
      label: isAdmin ? 'Overview' : 'My Travel',
      icon: LayoutDashboard,
      show: isAuthenticated
    },
    ...(isAdmin
      ? [
        { to: '/admin/flights', label: 'Manage Flights', icon: Settings, show: true },
        { to: '/admin/users', label: 'People', icon: Users, show: true },
        { to: '/admin/settings', label: 'Settings', icon: Settings, show: true }
      ]
      : [])
  ];

  const getCurrentTitle = () => {
    if (isBlocked) return 'Maintenance';
    const match = navItems
      .filter((item) => item.show)
      .filter((item) =>
        item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
      )
      .sort((a, b) => b.to.length - a.to.length)[0];
    return match?.label || 'Dashboard';
  };

  if (loading) {
    return (
      <div className="shell">
        <div className="shell__loading">Loading…</div>
      </div>
    );
  }

  const showMaintenanceBanner = isAdmin && maintenanceMode;
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="shell">
      {/* ============================================================
          TOP NAVBAR (ALWAYS VISIBLE)
          ============================================================ */}
      <header className="shell__bar">
        <div className="shell__bar-inner">
          {/* Left: Logo + Hamburger */}
          <div className="shell__bar-left">
            {/* Hamburger button - ONLY on mobile */}
            {isMobile && (
              <button
                type="button"
                className="shell__mobile-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            <Link to="/" className="shell__brand">
              <div className="shell__brand-icon">
                <img src={logo} alt="" className="shell__brand-logo" />
              </div>
              <div className="shell__brand-text">
                <span className="shell__brand-name">Rohan Travels</span>
                <span className="shell__brand-tagline">&amp; Tours</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          {/* Center: Desktop Navigation - Responsive with overflow handling */}
          <nav className="shell__nav">
            <div className="shell__nav-scroll">
              {navItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={linkClass}
                      end={item.end}
                    >
                      <Icon size={16} />
                      <span className="shell__nav-label">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="shell__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          </nav>

          {/* Right: User Actions */}
          <div className="shell__actions">
            {isAuthenticated ? (
              <div className="shell__user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="shell__user-trigger"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="shell__avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" />
                    ) : (
                      <span className="shell__avatar-initial">{initial}</span>
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
                    className={`shell__chevron${userMenuOpen ? ' shell__chevron--open' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="shell__dropdown" role="menu">
                    <div className="shell__dropdown-header">
                      <div className="shell__dropdown-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="" />
                        ) : (
                          <span className="shell__dropdown-initial">{initial}</span>
                        )}
                      </div>
                      <div className="shell__dropdown-user">
                        <div className="shell__dropdown-name">{user?.name}</div>
                        <div className="shell__dropdown-email">{user?.email}</div>
                      </div>
                    </div>

                    <div className="shell__dropdown-divider" />

                    <Link to="/account" className="shell__dropdown-item" role="menuitem">
                      <User size={18} />
                      <span>My account</span>
                    </Link>
                    <Link to="/ledger" className="shell__dropdown-item" role="menuitem">
                      <CreditCard size={18} />
                      <span>Ledger</span>
                    </Link>

                    <div className="shell__dropdown-divider" />

                    <button
                      type="button"
                      className="shell__dropdown-item shell__dropdown-item--danger"
                      onClick={handleSignOut}
                      role="menuitem"
                    >
                      <LogOut size={18} />
                      <span>Sign out</span>
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
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE SIDEBAR (Slide-in panel)
          ============================================================ */}
      {/* Mobile Overlay (backdrop) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="shell__mobile-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
          role="button"
          aria-label="Close menu"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`shell__mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="shell__mobile-sidebar-inner">
          {/* Sidebar Header */}
          <div className="shell__mobile-sidebar-header">
            <Link to="/" className="shell__mobile-brand" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logo} alt="" className="shell__mobile-brand-logo" />
              <span className="shell__mobile-brand-name">Rohan Travels</span>
            </Link>
            <button
              type="button"
              className="shell__mobile-sidebar-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="shell__mobile-sidebar-nav">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={mobileLinkClass}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="shell__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
          </nav>

          {/* Sidebar Footer */}
          <div className="shell__mobile-sidebar-footer">
            {isAuthenticated ? (
              <>
                <Link to="/account" className="shell__mobile-sidebar-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={18} />
                  My account
                </Link>
                <button type="button" className="shell__mobile-sidebar-link shell__mobile-sidebar-link--danger" onClick={handleSignOut}>
                  <LogOut size={18} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--primary btn--full" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn btn--ghost btn--full" onClick={() => setIsMobileMenuOpen(false)}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <main className="shell__main">
        {showMaintenanceBanner && (
          <div className="maintenance-banner">
            <span>Maintenance mode is on. Only admins can reach the system.</span>
            <button
              type="button"
              className="maintenance-banner-close"
              onClick={() => navigate('/admin/settings')}
            >
              Go to settings
            </button>
          </div>
        )}

        {isBlocked ? <MaintenancePage message={maintenanceMessage} /> : children}
      </main>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="shell__foot">
        <div className="shell__foot-inner">
          <div className="shell__foot-brand">
            <span className="shell__foot-name">Rohan Travels &amp; Tours</span>
            <span className="shell__foot-copy">
              &copy; {new Date().getFullYear()} All rights reserved
            </span>
          </div>
          <div className="shell__foot-links">
            <Link to="/privacy" className="shell__foot-link">Privacy</Link>
            <Link to="/terms" className="shell__foot-link">Terms</Link>
            <Link to="/contact" className="shell__foot-link">Contact</Link>
          </div>
          <span className="shell__foot-date">
            <span className="mono">{new Date().toLocaleDateString()}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}