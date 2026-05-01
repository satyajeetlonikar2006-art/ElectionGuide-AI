/**
 * @fileoverview Desktop navigation bar with Google OAuth login button.
 * Displays app branding, navigation links, state selector, and auth controls.
 * @module components/layout/Navbar
 */
import React, { memo, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Calendar, CheckSquare, Brain, MapPin, LogIn, LogOut, User } from 'lucide-react';
import { useUserState } from '../../contexts/UserStateContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Top navigation bar component — memoized to avoid re-renders from parent.
 * Shows Google OAuth sign-in button or user avatar based on auth state.
 * @returns {JSX.Element}
 */
const Navbar = memo(() => {
  const { darkMode, setDarkMode, selectedState } = useUserState();
  const { user, login, logout, isAuthenticated, isFirebaseConfigured } = useAuth();

  /** Handles login button click */
  const handleLogin = useCallback(() => login(), [login]);
  /** Handles logout button click */
  const handleLogout = useCallback(() => logout(), [logout]);

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg hidden md:block">ElectionGuide AI</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-white'}`}>
          <Home size={18} /> Home
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-white'}`}>
          <MessageSquare size={18} /> AI Chat
        </NavLink>
        <NavLink to="/timeline" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-white'}`}>
          <Calendar size={18} /> Timeline
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-orange-500">
          <MapPin size={12} /> {selectedState}
        </div>

        {/* Google OAuth Login/Logout */}
        {isFirebaseConfigured && (
          isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-orange-500" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-300 hidden lg:block max-w-[100px] truncate">
                  {user?.displayName || 'User'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:border-orange-500 hover:text-white transition-all"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Sign in with Google</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
