import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [error, setError] = useState(null);

  // On mount, try to restore session from saved token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Validate token by fetching current user
    authApi.me()
      .then((userData) => {
        // userData from /auth/me — may use userId or id
        setUser({
          id: userData.userId || userData.id,
          email: userData.email,
          name: userData.fullName || userData.name,
          role: userData.role?.toLowerCase(),
          phoneNumber: userData.phoneNumber || '',
        });
      })
      .catch(() => {
        // Token is expired or invalid, clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      // AuthResponse: {token, refreshToken, userId, fullName, email, role}
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);

      const userData = {
        id: response.userId || response.id,
        email: response.email,
        name: response.fullName,
        role: response.role?.toLowerCase(),
        phoneNumber: response.phoneNumber || '',
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // UserRequest: {fullName, email, password, phoneNumber, role}
      await authApi.register({
        fullName: data.fullName || data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || '',
        role: 'MEMBER', // Default to MEMBER for self-registration
      });
      // Registration doesn't log in the user; leave them to go to the login page
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLibrarian: user?.role === 'librarian',
    isMember: user?.role === 'member',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth must live beside the provider for a single import path across the app
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
