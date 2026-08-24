import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import { setAccessToken, setUnauthorizedHandler } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // facility profile
  const [admin, setAdmin] = useState(null); // admin profile
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // On first load, try to silently restore a session from the HTTP-only
  // refresh cookie. If there's no cookie, this just fails quietly.
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        const me = await authService.me();
        if (me.type === 'admin') setAdmin(me.data);
        else setUser(me.data);
      } catch {
        // no valid session — that's a normal state, not an error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loginFacility = async (payload) => {
    const res = await authService.loginFacility(payload);
    setAccessToken(res.accessToken);
    setUser(res.data);
    setAdmin(null);
    return res;
  };

  const loginAdmin = async (payload) => {
    const res = await authService.loginAdmin(payload);
    setAccessToken(res.accessToken);
    setAdmin(res.data);
    setUser(null);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  const refreshMe = async () => {
    const me = await authService.me();
    if (me.type === 'admin') setAdmin(me.data);
    else setUser(me.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, admin, loading, loginFacility, loginAdmin, logout, refreshMe, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
