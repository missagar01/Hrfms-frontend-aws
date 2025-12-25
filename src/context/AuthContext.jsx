import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'hr-fms-auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setState((prev) => ({ ...prev, isInitializing: false }));
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setState({
        user: parsed?.user ?? null,
        token: parsed?.token ?? null,
        isAuthenticated: Boolean(parsed?.token),
        isInitializing: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isInitializing: false }));
    }
  }, []);

  const login = (user, token) => {
    const normalizedUser = user
      ? {
          ...user,
          designation: user.designation ?? user.Designation ?? null,
          department: user.department ?? user.Department ?? null,
        }
      : null;
    const nextState = {
      user: normalizedUser,
      token,
      isAuthenticated: true,
      isInitializing: false,
    };
    setState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: normalizedUser, token }));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
