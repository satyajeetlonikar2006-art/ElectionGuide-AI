import React, { useState, useEffect } from 'react';
import { useUserState } from '../contexts/UserStateContext';
import { STATE_DATA } from '../constants/stateData';
import { UI_COPY } from '../constants/copy';
import { Trophy, CheckCircle, MessageSquare, Zap, Clock, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { selectedState, checklist, quizHistory } = useUserState();
  const stateInfo = STATE_DATA[selectedState] || STATE_DATA['NY'];
  if (!stateInfo) return <div className="p-10 text-white">Error: State data missing.</div>;
  
  const checklistCount = Object.values(checklist).filter(Boolean).length;
  const bestScore = quizHistory.length > 0 ? Math.max(...quizHistory.map(r => r.score)) : 0;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const electionDate = new Date('2028-11-07T00:00:00');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = electionDate - now;
      if (diff <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-[#060a14]">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Welcome back!</h1>
        <p className="text-slate-400">Here's your election readiness summary for <span className="text-orange-500 font-bold">{stateInfo.name}</span>.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Quiz Score" value={`${bestScore}%`} color="text-yellow-500" />
        <StatCard icon={CheckCircle} label="Checklist" value={`${checklistCount}/18`} color="text-emerald-500" />
        <StatCard icon={MessageSquare} label="Chats" value="12" color="text-blue-500" />
        <StatCard icon={Zap} label="Streak" value="3 Days" color="text-orange-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Election Countdown */}
        <div className="md:col-span-2 bg-slate-900/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-orange-600/20 transition-all"></div>
          
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Days Until Election Day
            </h2>
            <div className="flex gap-4 md:gap-8">
              <CountdownUnit value={timeLeft.days} label="Days" />
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <CountdownUnit value={timeLeft.mins} label="Mins" />
              <CountdownUnit value={timeLeft.secs} label="Secs" />
            </div>
          </div>

          <Link to="/timeline" className="mt-8 flex items-center gap-2 text-sm font-bold text-orange-500 hover:gap-3 transition-all relative">
            View full election timeline <ArrowRight size={16} />
          </Link>
        </div>

        {/* State Quick Info */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="text-orange-500" size={20} />
            {stateInfo.name} Status
          </h2>
          <div className="space-y-6">
            <InfoItem label="Registration Deadline" value={stateInfo.registration_deadline} />
            <InfoItem label="Early Voting" value={stateInfo.early_voting} />
            <InfoItem label="Polls Open" value={stateInfo.polling_hours} />
            <Link to="/find-info" className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-bold hover:bg-white/10 transition-all">
              Full State Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
    <Icon className={`${color} mb-3`} size={20} />
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{label}</div>
  </div>
);

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl md:text-6xl font-black text-white tracking-tighter">{String(value).padStart(2, '0')}</div>
    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{label}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">{label}</div>
    <div className="text-sm font-medium text-slate-200">{value}</div>
  </div>
);

export default Dashboard;
