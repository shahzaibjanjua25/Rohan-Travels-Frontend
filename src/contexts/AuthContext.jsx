// frontend/src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { onSessionExpired } from '../services/api'; // Fixed import
import authService from '../services/auth';

const AuthContext = createContext(null);

/**
 * Session state.
 *
 * The token itself is in an httpOnly cookie, which JavaScript deliberately
 * cannot read — so the app cannot inspect a token to decide whether it is
 * logged in. The only source of truth is asking the server, which is what the
 * boot call to /auth/me does. Anything stored locally would be a guess that
 * drifts out of sync the moment a session is revoked elsewhere.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | anonymous

  const loadSession = useCallback(async (signal) => {
    try {
      const res = await authService.me({ signal });
      setUser(res.data);
      setStatus('authenticated');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Prime the CSRF cookie before anything tries to submit a form.
    api.primeCsrf();
    loadSession(controller.signal);
    return () => controller.abort();
  }, [loadSession]);

  /**
   * Any 401 anywhere in the app clears the session here, so a revoked or
   * expired cookie shows a login screen rather than a UI that looks signed in
   * but fails on every action.
   */
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        setStatus('anonymous');
      }),
    []
  );

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.data);
    setStatus('authenticated');
    return res.data;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    setUser(res.data);
    setStatus('authenticated');
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Clear locally even if the request failed — the person asked to sign
      // out, and leaving them looking signed in would be worse than a stale
      // cookie the server will reject anyway.
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const response = await authService.changePassword(currentPassword, newPassword);
    return response;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
      changePassword,
      refresh: loadSession,
    }),
    [user, status, login, register, logout, updateUser, loadSession, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

export default AuthContext;