import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData || typeof userData !== 'object') return null;
    return {
      ...userData,
      role: typeof userData.role === 'string' ? userData.role.toLowerCase() : userData.role,
    };
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = normalizeUser(JSON.parse(storedUser));
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
