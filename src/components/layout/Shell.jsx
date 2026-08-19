// frontend/src/components/layout/Shell.jsx

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
  Home,
  Phone,
  Facebook,
  MessageCircle,
  Globe,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
} from 'lucide-react';

const MOBILE_BREAKPOINT = 1024;

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

  // Contact page link
  const contactLink = { to: '/contact', label: 'Contact', icon: Phone, show: true };

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
              {/* Contact link in nav */}
              <NavLink to="/contact" className={linkClass}>
                <Phone size={16} />
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
                    <Link to="/contact" className="shell__dropdown-item" role="menuitem">
                      <Phone size={18} />
                      <span>Contact Us</span>
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
          FOOTER - BEAUTIFIED
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
                <Facebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@m_rohan_travels_tours?_r=1&_t=ZN-98xOcwAp770"
                target="_blank"
                rel="noopener noreferrer"
                className="shell__foot-social-link"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.518 2 2 6.518 2 12.006c0 1.735.463 3.437 1.342 4.918L2 22l5.129-1.341c1.446.798 3.081 1.222 4.758 1.222h.004c5.487 0 10.006-4.518 10.006-10.006 0-2.675-1.041-5.188-2.93-7.076l.11-.071zM12.006 20.416h-.003c-1.47 0-2.922-.392-4.2-1.133l-.301-.178-3.045.796.812-2.969-.196-.317c-.79-1.246-1.208-2.667-1.208-4.122 0-4.632 3.77-8.402 8.405-8.402 2.243 0 4.351.875 5.937 2.461s2.462 3.695 2.462 5.938c-.001 4.632-3.771 8.403-8.402 8.403l-.001-.001z" />
                  <path d="M16.999 13.273c-.305-.152-1.795-.874-2.073-.974-.278-.1-.481-.149-.685.15-.204.299-.78.966-.956 1.166-.176.2-.352.226-.65.128-.299-.099-1.271-.467-2.418-1.482-.893-.789-1.497-1.761-1.671-2.058-.174-.297-.019-.457.128-.605.136-.132.303-.345.455-.519.151-.174.202-.297.303-.496.101-.198.051-.37-.025-.519-.076-.149-.681-1.611-.932-2.205-.247-.579-.498-.5-.683-.511-.185-.011-.378-.011-.583-.011-.205 0-.532.076-.812.373-.281.297-1.071 1.017-1.071 2.479 0 1.462 1.086 2.874 1.237 3.073.151.198 2.135 3.197 5.174 4.484.723.306 1.287.489 1.727.625.728.226 1.39.194 1.913.118.584-.086 1.793-.718 2.046-1.412.253-.694.253-1.289.176-1.413-.076-.124-.277-.198-.583-.347z" />
                </svg>
              </a>
              <a
                href="https://wa.me/qr/Y5PW7NQXWGTLP1"
                target="_blank"
                rel="noopener noreferrer"
                className="shell__foot-social-link shell__foot-social-link--whatsapp"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
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
              <MessageCircle size={16} />
              <a href="https://wa.me/qr/Y5PW7NQXWGTLP1" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
            <div className="shell__foot-contact-item">
              <Facebook size={16} />
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
        <MessageCircle size={32} />
        <span className="whatsapp-float-tooltip">Chat with us!</span>
      </a>
    </div>
  );
}
