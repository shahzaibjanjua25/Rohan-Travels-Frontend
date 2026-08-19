// frontend/src/components/layout/Shell.jsx

import { useEffect, useRef, useState } from 'react';
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
  Home,
  Phone,
  Mail,
  Clock,
  Globe,
} from 'lucide-react';
// Import FaFacebook, FaWhatsapp, FaTiktok from react-icons
import { FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';

const MOBILE_BREAKPOINT = 768;

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
      label: isAdmin ? 'Bookings' : 'Bookings',
      icon: Calendar,
      show: isAuthenticated
    },
    {
      to: isAdmin ? '/admin/notifications' : '/notifications',
      label: 'Alerts',
      icon: Bell,
      show: isAuthenticated,
      badge: unread
    },
    {
      to: '/dashboard',
      label: isAdmin ? 'Overview' : 'Dashboard',
      icon: LayoutDashboard,
      show: isAuthenticated
    },
    ...(isAdmin
      ? [
        { to: '/admin/flights', label: 'Add or Edit Flights', icon: Plane, show: true },
        { to: '/admin/users', label: 'Users', icon: Users, show: true },
        { to: '/admin/settings', label: 'Settings', icon: Settings, show: true }
      ]
      : [])
  ];

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
          TOP NAVBAR
          ============================================================ */}
      <header className="shell__bar">
        <div className="shell__bar-inner">
          {/* Left: Logo + Hamburger */}
          <div className="shell__bar-left">
            {isMobile && (
              <button
                type="button"
                className="shell__mobile-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                      <Icon />
                      <span className="shell__nav-label">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="shell__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              <NavLink to="/contact" className={linkClass}>
                <Phone />
                <span className="shell__nav-label">Contact</span>
              </NavLink>
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
                      {isAdmin ? 'Admin' : 'Agent'}
                    </span>
                  </div>
                  <ChevronDown
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
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE SIDEBAR
          ============================================================ */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="shell__mobile-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
          role="button"
          aria-label="Close menu"
        />
      )}

      <div className={`shell__mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="shell__mobile-sidebar-inner">
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
            <NavLink
              to="/contact"
              className={mobileLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Phone size={20} />
              <span>Contact Us</span>
            </NavLink>
          </nav>

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
          {/* Brand Column */}
          <div className="shell__foot-brand">
            <div className="shell__foot-brand-header">
              <img src={logo} alt="Rohan Travels" className="shell__foot-logo" />
              <span className="shell__foot-name">Rohan Travels &amp; Tours</span>
            </div>
            <p className="shell__foot-description">
              Your trusted partner for seamless flight bookings and unforgettable travel experiences across the globe.
            </p>
            <div className="shell__foot-social">
              <a
                href="https://www.facebook.com/share/1GccNRa3SP/"
                target="_blank"
                rel="noopener noreferrer"
                className="shell__foot-social-link"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@m_rohan_travels_tours?_r=1&_t=ZN-98xOcwAp770"
                target="_blank"
                rel="noopener noreferrer"
                className="shell__foot-social-link"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a>
              <a
                href="https://wa.me/qr/Y5PW7NQXWGTLP1"
                target="_blank"
                rel="noopener noreferrer"
                className="shell__foot-social-link shell__foot-social-link--whatsapp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="shell__foot-links-column">
            <h4 className="shell__foot-heading">Quick Links</h4>
            <ul className="shell__foot-links-list">
              <li><Link to="/flights" className="shell__foot-link">Search Flights</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link to="/bookings" className="shell__foot-link">My Bookings</Link></li>
                  <li><Link to="/dashboard" className="shell__foot-link">Dashboard</Link></li>
                </>
              )}
              <li><Link to="/contact" className="shell__foot-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="shell__foot-contact">
            <h4 className="shell__foot-heading">Get In Touch</h4>
            <div className="shell__foot-contact-item">
              <FaWhatsapp size={16} />
              <a href="https://wa.me/qr/Y5PW7NQXWGTLP1" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
            <div className="shell__foot-contact-item">
              <FaFacebook size={16} />
              <a href="https://www.facebook.com/share/1GccNRa3SP/" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </div>
            <div className="shell__foot-contact-item">
              <Mail size={16} />
              <a href="mailto:mrohantraveltour@gmail.com">mrohantraveltour@gmail.com</a>
            </div>
          </div>

          {/* Hours Column */}
          <div className="shell__foot-hours">
            <h4 className="shell__foot-heading">Support Hours</h4>
            <div className="shell__foot-hours-item">
              <Clock size={16} />
              <span>24/7 Customer Support</span>
            </div>
            <div className="shell__foot-hours-item">
              <Globe size={16} />
              <span>Available Worldwide</span>
            </div>
            <div className="shell__foot-copy">
              &copy; {new Date().getFullYear()} Rohan Travels &amp; Tours
              <br />
              <span className="shell__foot-rights">All rights reserved</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="shell__foot-bottom">
          <div className="shell__foot-bottom-inner">
            <span className="shell__foot-bottom-text">
              Made with <span className="shell__foot-heart">❤️</span> for travelers everywhere
            </span>
            <span className="shell__foot-date">
              <span className="mono">{new Date().toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* ============================================================
          FLOATING WHATSAPP BUTTON
          ============================================================ */}
      <a
        href="https://wa.me/qr/Y5PW7NQXWGTLP1"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={30} />
        <span className="whatsapp-float-tooltip">Chat with us!</span>
      </a>
    </div>
  );
}