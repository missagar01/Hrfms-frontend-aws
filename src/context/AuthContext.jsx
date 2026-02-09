import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'hr-fms-auth';

const AuthContext = createContext(null);

const getFieldValue = (source, keys) => {
  if (!source || !keys.length) {
    return null;
  }
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      if (value !== undefined) {
        return value;
      }
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    pageAccess: null,
    loginTime: null,
    pass: null,
    systemAccess: null,
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
        pageAccess: parsed?.pageAccess ?? parsed?.page_access ?? null,
        loginTime: parsed?.loginTime ?? parsed?.login_time ?? null,
        pass: parsed?.pass ?? parsed?.Pass ?? null,
        systemAccess: parsed?.systemAccess ?? parsed?.system_access ?? null,
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
        designation: getFieldValue(user, ['designation', 'Designation']),
        department: getFieldValue(user, ['department', 'Department']),
      }
      : null;
    const pageAccess = getFieldValue(normalizedUser, [
      'page_access',
      'Page_Access',
      'pageAccess',
      'PageAccess',
    ]);
    const systemAccess = getFieldValue(normalizedUser, [
      'system_access',
      'System_Access',
      'systemAccess',
      'SystemAccess',
    ]);
    const loginTime =
      getFieldValue(normalizedUser, ['login_time', 'LoginTime', 'loginTime']) ??
      new Date().toISOString();
    const passValue = getFieldValue(normalizedUser, ['pass', 'Pass']);

    const nextState = {
      user: normalizedUser,
      token,
      pageAccess,
      systemAccess,
      loginTime,
      pass: passValue,
      isAuthenticated: true,
      isInitializing: false,
    };
    setState(nextState);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: normalizedUser,
        token,
        pageAccess,
        systemAccess,
        loginTime,
        pass: passValue,
      })
    );
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      token: null,
      pageAccess: null,
      systemAccess: null,
      loginTime: null,
      pass: null,
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


