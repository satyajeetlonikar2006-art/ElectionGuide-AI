import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Calendar, CheckSquare, Brain, MapPin } from 'lucide-react';

const BottomBar = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/timeline', icon: Calendar, label: 'Dates' },
    { to: '/checklist', icon: CheckSquare, label: 'Ready' },
    { to: '/quiz', icon: Brain, label: 'Quiz' },
    { to: '/find-info', icon: MapPin, label: 'Info' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <NavLink 
          key={item.to}
          to={item.to} 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-slate-500'}`}
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomBar;
