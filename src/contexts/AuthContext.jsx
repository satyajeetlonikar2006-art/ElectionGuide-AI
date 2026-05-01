/**
 * @fileoverview Authentication context provider for ElectionGuide AI.
 * Manages Firebase Google OAuth state and provides auth methods to all components.
 * @module contexts/AuthContext
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signInWithGoogle, logOut, onAuthChange, isFirebaseConfigured } from '../config/firebase';

/** @type {React.Context} Authentication context */
const AuthContext = createContext(null);

/**
 * Authentication provider component.
 * Wraps the application to provide auth state and methods via context.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to Firebase auth state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Initiates Google OAuth sign-in flow.
   * @returns {Promise<void>}
   */
  const login = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Set environment variables to enable login.');
      return;
    }
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      console.error('Login failed:', err.message);
    }
  }, []);

  /**
   * Signs out the current user.
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await logOut();
    } catch (err) {
      setError(err.message);
      console.error('Logout failed:', err.message);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isFirebaseConfigured,
  }), [user, loading, error, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * @returns {Object} Auth context value containing user, login, logout, etc.
 * @throws {Error} If used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
