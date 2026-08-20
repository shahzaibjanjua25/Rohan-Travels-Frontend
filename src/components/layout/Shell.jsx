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
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';

const MOBILE_BREAKPOINT = 768;

const linkClass = ({ isActive }) =>
  `nav-link${isActive ? ' active' : ''}`;

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

  // Business Contact Info
  const BUSINESS_INFO = {
    phone: '+92 348 7839237',
    email: 'mrohantraveltour@gmail.com',
    address: 'Old Rasul Road, Usmania Mohallah Usmani Mohalla, Mandi Bahauddin, Pakistan',
    facebook: 'https://www.facebook.com/share/1GccNRa3SP/',
    tiktok: 'https://www.tiktok.com/@m_rohan_travels_tours?_r=1&_t=ZN-98xOcwAp770',
    whatsapp: 'https://wa.me/qr/Y5PW7NQXWGTLP1',
  };

  // Viewport tracking
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
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

  // ESC key closes menus
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      setUserMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Click outside user menu closes it
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

  // Unread badge polling
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

  // Navigation config
  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, show: true },
    { to: '/flights', label: 'Explore Flights', icon: Plane, show: true },
    { to: '/umrah', label: 'Umrah Packages', icon: Calendar, show: true }, // ADD THIS

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
        { to: '/admin/flights', label: 'Manage Flights', icon: Plane, show: true },
        { to: '/admin/users', label: 'Users', icon: Users, show: true },
        { to: '/admin/settings', label: 'Settings', icon: Settings, show: true }
      ]
      : [])
  ];

  // Check if maintenance banner should be shown
  const showMaintenanceBanner = isAdmin && maintenanceMode;

  if (loading) {
    return (
      <div className="shell">
        <div className="shell__loading">Loading…</div>
      </div>
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="marketing-shell flex min-h-screen flex-col bg-canvas">
      {/* ============================================================
          MARKETING STRIP - Top Bar
          ============================================================ */}
      <div className="marketing-strip">
        <div className="marketing-strip-inner">
          <div className="marketing-strip-left">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} className="hidden sm:inline-flex group">
              <Phone className="icon" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <span className="marketing-strip-divider"></span>
            <a href={`mailto:${BUSINESS_INFO.email}`} className="inline-flex group">
              <Mail className="icon" />
              <span className="truncate">{BUSINESS_INFO.email}</span>
            </a>
          </div>
          <div className="marketing-strip-right">
            <a href="/contact">Support Desk</a>
            <a href="/about">About Us</a>
            <span className="marketing-strip-divider"></span>
            <a href="/login">Login</a>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN NAVBAR
          ============================================================ */}
      <header className="main-navbar">
        <div className="main-navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Rohan Travels & Tours" />
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links">
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
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="shell__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            <NavLink to="/contact" className={linkClass}>
              <Phone size={16} />
              <span>Contact</span>
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
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
              <>
                <Link to="/login" className="btn-outline-light">
                  Login
                </Link>
                <Link to="/register" className="btn-gold">
                  Join Portal
                  <ArrowRight className="arrow" size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
      <main className="relative flex-grow">
        {/* Maintenance Banner */}
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
          FOOTER - UPDATED WITH BUSINESS INFO
          ============================================================ */}
      <footer className="footer">
        <div className="footer-top-border"></div>
        <div className="footer-inner">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="logo">
                <img src={logo} alt="Rohan Travels & Tours" />
              </Link>
              <p>
                Your trusted partner for seamless flight bookings and unforgettable
                travel experiences across the globe.
              </p>
              <div className="tags">
                <span>Rohan Travels</span>
                <span>&amp; Tours</span>
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="footer-heading">Services</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/flights">
                    <span className="dot"></span>
                    Explore Flights
                  </Link>
                </li>
                <li>
                  <Link to="/flights?travelType=umrah">
                    <span className="dot"></span>
                    Umrah Packages
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/about">
                    <span className="dot"></span>
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link to="/blogs">
                    <span className="dot"></span>
                    Blogs &amp; Guides
                  </Link>
                </li> */}
                <li>
                  <Link to="/contact">
                    <span className="dot"></span>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Access Column */}
            <div>
              <h3 className="footer-heading">Access</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/login">
                    <span className="dot"></span>
                    Agent Login
                  </Link>
                </li>
                <li>
                  <Link to="/register">
                    <span className="dot"></span>
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Column - UPDATED WITH BUSINESS INFO */}
            <div>
              <h3 className="footer-heading">Contact Info</h3>
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <div className="icon">
                    <MapPin size={16} />
                  </div>
                  <span className="text-xs">{BUSINESS_INFO.address}</span>
                </div>
                <div className="footer-contact-item">
                  <div className="icon">
                    <Phone size={16} />
                  </div>
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} className="text-xs font-semibold">
                    {BUSINESS_INFO.phone}
                  </a>
                </div>
                <div className="footer-contact-item">
                  <div className="icon">
                    <Mail size={16} />
                  </div>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-xs font-semibold">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>

              {/* Social Links in Footer */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={BUSINESS_INFO.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Facebook"
                  >
                    <FaFacebook size={18} />
                  </a>
                  <a
                    href={BUSINESS_INFO.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="TikTok"
                  >
                    <FaTiktok size={18} />
                  </a>
                  <a
                    href={BUSINESS_INFO.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div>
              <p>Copyright © {new Date().getFullYear()} Rohan Travels &amp; Tours. All rights reserved.</p>
              <p className="dev-by">
                Developed by <a href="https://www.linkedin.com/in/shah-zaib-sajid-204461203/" target="_blank" rel="noopener noreferrer">Shah Zaib Sajid</a> · 0313-2677570
              </p>
            </div>
            <div className="footer-bottom-links">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
              <button
                className="scroll-top-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
              >
                <ArrowRight size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================
          FLOATING WHATSAPP BUTTON
          ============================================================ */}
      <a
        href={BUSINESS_INFO.whatsapp}
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