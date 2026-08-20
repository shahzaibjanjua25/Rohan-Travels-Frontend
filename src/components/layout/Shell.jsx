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
  Info,
  ArrowRight,
  MapPin,
  Ticket,
  Package,
} from 'lucide-react';
import { FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';

const DESKTOP_BREAKPOINT = 1024;

const mobileLinkClass = ({ isActive }) =>
  `shell__mobile-link${isActive ? ' shell__mobile-link--active' : ''}`;

export default function Shell({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { maintenanceMode, maintenanceMessage, isBlocked, loading } = useMaintenance();

  const [unread, setUnread] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= DESKTOP_BREAKPOINT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      if (desktop && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Close sidebar when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (!isDesktop && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, isSidebarOpen]);

  // ESC key closes menus
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsSidebarOpen(false);
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
    setIsSidebarOpen(false);
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Navigation config
  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, show: true },
    { to: '/flights', label: 'Explore Flights', icon: Plane, show: true },
    { to: '/umrah', label: 'Umrah Packages', icon: Calendar, show: true },
    {
      to: isAdmin ? '/admin/bookings' : '/bookings',
      label: 'Bookings',
      icon: Ticket,
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
          { to: '/admin/umrah/packages', label: 'Umrah Packages', icon: Calendar, show: true },
          { to: '/admin/umrah/bookings', label: 'Umrah Bookings', icon: Ticket, show: true },
          { to: '/admin/users', label: 'Users', icon: Users, show: true },
          { to: '/admin/settings', label: 'Settings', icon: Settings, show: true }
        ]
      : [])
  ];

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
    <div className="marketing-shell">
      {/* ============================================================
          MARKETING STRIP - Top Bar
          ============================================================ */}
      <div className="marketing-strip">
        <div className="marketing-strip-inner">
          <div className="marketing-strip-left">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} className="hidden sm:inline-flex group">
              <Phone className="icon" size={14} />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <span className="marketing-strip-divider"></span>
            <a href={`mailto:${BUSINESS_INFO.email}`} className="inline-flex group">
              <Mail className="icon" size={14} />
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
          MAIN NAVBAR - Hamburger on LEFT
          ============================================================ */}
      <header className="main-navbar">
        <div className="main-navbar-inner">
          {/* LEFT: Hamburger + Logo */}
          <div className="navbar-left">
            {/* Hamburger Button - ALWAYS VISIBLE */}
            <button
              type="button"
              className="hamburger-btn"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
            >
              <Menu size={28} />
            </button>

            {/* Logo + Company Name */}
            <Link to="/" className="navbar-logo">
              <img src={logo} alt="Rohan Travels & Tours" />
              <span className="navbar-company-name">M Rohan Travels & Tours</span>
            </Link>
          </div>

          {/* RIGHT: User Actions */}
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
                    size={16}
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

                    {isAdmin && (
                      <>
                        <div className="shell__dropdown-divider" />
                        <Link to="/admin/flights" className="shell__dropdown-item" role="menuitem">
                          <Plane size={18} />
                          <span>Manage Flights</span>
                        </Link>
                        <Link to="/admin/umrah/packages" className="shell__dropdown-item" role="menuitem">
                          <Package size={18} />
                          <span>Umrah Packages</span>
                        </Link>
                        <Link to="/admin/users" className="shell__dropdown-item" role="menuitem">
                          <Users size={18} />
                          <span>Users</span>
                        </Link>
                        <Link to="/admin/settings" className="shell__dropdown-item" role="menuitem">
                          <Settings size={18} />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}

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
        </div>
      </header>

      {/* ============================================================
          SIDEBAR - Desktop pushes content, Mobile overlays
          ============================================================ */}
      <div className={`app-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
          <div className="sidebar-inner">
            {/* Sidebar Header with Close Button */}
            <div className="sidebar-header">
              <Link to="/" className="sidebar-brand" onClick={closeSidebar}>
                <img src={logo} alt="" className="sidebar-brand-logo" />
                <span className="sidebar-brand-name">M Rohan Travels</span>
              </Link>
              {/* Close Button INSIDE Sidebar */}
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={closeSidebar}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="sidebar-nav">
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
                      onClick={closeSidebar}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              <NavLink
                to="/contact"
                className={mobileLinkClass}
                onClick={closeSidebar}
              >
                <Phone size={20} />
                <span>Contact Us</span>
              </NavLink>
              <NavLink
                to="/about"
                className={mobileLinkClass}
                onClick={closeSidebar}
              >
                <Info size={20} />
                <span>About Us</span>
              </NavLink>
            </nav>

            <div className="sidebar-footer">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="sidebar-footer-link" onClick={closeSidebar}>
                    <User size={18} />
                    My account
                  </Link>
                  <button type="button" className="sidebar-footer-link sidebar-footer-link--danger" onClick={handleSignOut}>
                    <LogOut size={18} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn--primary btn--full" onClick={closeSidebar}>
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn--ghost btn--full" onClick={closeSidebar}>
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay - only on mobile */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
            role="button"
            aria-label="Close menu"
          />
        )}

        {/* Main Content */}
        <main className={`main-content ${isSidebarOpen ? 'main-content--pushed' : ''}`}>
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
      </div>

      {/* ============================================================
          FOOTER (same as before)
          ============================================================ */}
      <footer className="footer">
        <div className="footer-top-border"></div>
        <div className="footer-inner">
          <div className="footer-grid">
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
                  <Link to="/umrah">
                    <span className="dot"></span>
                    Umrah Packages
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/about">
                    <span className="dot"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact">
                    <span className="dot"></span>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

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