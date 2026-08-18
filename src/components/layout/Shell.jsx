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
const SIDEBAR_KEY = 'shell:sidebar-open';

const prefersMobile = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;

const readStoredOpen = () => {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
};

const linkClass = ({ isActive }) =>
  `shell__sidebar-link${isActive ? ' shell__sidebar-link--active' : ''}`;

export default function Shell({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { maintenanceMode, maintenanceMessage, isBlocked, loading } = useMaintenance();

  const [unread, setUnread] = useState(0);
  const [isMobile, setIsMobile] = useState(prefersMobile);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    prefersMobile() ? false : readStoredOpen()
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------------------------------------------------------
     Viewport tracking.
     matchMedia only fires when the breakpoint is actually crossed, so
     the sidebar no longer slams shut every time a mobile browser hides
     its address bar and fires a resize event.
  --------------------------------------------------------------- */
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);

    const apply = (matches) => {
      setIsMobile(matches);
      setSidebarOpen(matches ? false : readStoredOpen());
    };

    apply(mql.matches);
    const onChange = (event) => apply(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Persist the desktop preference only; mobile open state is transient.
  useEffect(() => {
    if (isMobile) return;
    try {
      window.localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
    } catch {
      // Private mode or blocked storage: the layout still works, it just forgets.
    }
  }, [isMobile, sidebarOpen]);

  // Navigating closes the mobile drawer and the account menu.
  useEffect(() => {
    setUserMenuOpen(false);
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Lock the page behind the mobile drawer so the background does not scroll.
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, sidebarOpen]);

  // Escape closes whatever is open on top.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setUserMenuOpen(false);
      if (isMobile) setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile]);

  // Clicking outside the account menu closes it.
  useEffect(() => {
    if (!userMenuOpen) return undefined;
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

  // Unread badge polling.
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

  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  /* ---------------------------------------------------------------
     Navigation config
  --------------------------------------------------------------- */
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

  // Longest matching path wins, so /admin/bookings/42 still reads "All Bookings".
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
      {/* Sidebar */}
      <aside
        id="shell-sidebar"
        className={`shell__sidebar${sidebarOpen ? '' : ' shell__sidebar--hidden'}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="shell__sidebar-header">
          <Link to="/" className="shell__sidebar-brand">
            <div className="shell__sidebar-brand-icon">
              <img src={logo} alt="" className="shell__sidebar-brand-logo" />
            </div>
            <div className="shell__sidebar-brand-text">
              <span className="shell__sidebar-brand-name">Rohan Travels</span>
              <span className="shell__sidebar-brand-tagline">&amp; Tours</span>
            </div>
          </Link>
          {/* ONLY ONE X - in the sidebar */}
          <button
            type="button"
            className="shell__sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Blocked users get no navigation — there is nowhere to go. */}
        {!isBlocked && (
          <nav className="shell__sidebar-nav">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={linkClass} end={item.end}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className="shell__sidebar-badge"
                        aria-label={`${item.badge} unread`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        )}

        <div className="shell__sidebar-footer">
          {isAuthenticated ? (
            <>
              <Link to="/account" className="shell__sidebar-user">
                <div className="shell__sidebar-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" />
                  ) : (
                    <span className="shell__sidebar-avatar-initial">{initial}</span>
                  )}
                </div>
                <div className="shell__sidebar-user-info">
                  <span className="shell__sidebar-user-name">{user?.name}</span>
                  <span className="shell__sidebar-user-role">
                    {isAdmin ? 'Administrator' : 'Agent'}
                  </span>
                </div>
              </Link>
              <button type="button" className="shell__sidebar-logout" onClick={handleSignOut}>
                <LogOut size={20} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <div className="shell__auth-buttons" style={{ flexDirection: 'column' }}>
              <Link to="/login" className="btn btn--primary btn--full">
                Sign in
              </Link>
              <Link to="/register" className="btn btn--ghost btn--full">
                Create account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile backdrop — only exists while the drawer is over the content */}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="shell__mobile-overlay active"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      {/* Main column */}
      <main className={`shell__main${sidebarOpen ? '' : ' shell__main--expanded'}`}>
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

        <header className="shell__header">
          <div className="shell__header-left">
            <button
              type="button"
              className="shell__hamburger"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
              aria-controls="shell-sidebar"
            >
              {/* ALWAYS SHOW MENU ICON - NEVER X */}
              <Menu size={24} />
            </button>
            <span className="shell__header-title">{getCurrentTitle()}</span>
          </div>

          <div className="shell__header-actions">
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
        </header>

        <div className="shell__content">
          {isBlocked ? <MaintenancePage message={maintenanceMessage} /> : children}
        </div>

        <footer className="shell__foot">
          <div className="shell__foot-inner">
            <span className="shell__foot-copy">
              &copy; {new Date().getFullYear()} Rohan Travels &amp; Tours. All rights reserved
            </span>
            <div className="shell__foot-links">
              <Link to="/privacy" className="shell__foot-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="shell__foot-link">
                Terms of Service
              </Link>
              <Link to="/contact" className="shell__foot-link">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}