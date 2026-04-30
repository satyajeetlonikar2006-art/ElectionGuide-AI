import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Calendar, CheckSquare, Brain, MapPin, User, Moon, Sun } from 'lucide-react';
import { useUserState } from '../../contexts/UserStateContext';

const Navbar = () => {
  const { darkMode, setDarkMode, selectedState } = useUserState();

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
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
