import React, { useState } from 'react';
import { Calendar, UserPlus, Users, Megaphone, Clock, CheckCircle, Award, Flag, MapPin, Info, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAGES = [
  { id: 1, title: "Candidate Announcement", subtitle: "Forming exploratory committees", icon: Megaphone, desc: "Candidates officially declare their intent to run for office and begin fundraising.", status: "COMPLETED", dates: "Late 2023 - Early 2024" },
  { id: 2, title: "Primary Elections", subtitle: "State-by-state party voting", icon: Users, desc: "Voters choose which candidate will represent their party in the general election.", status: "COMPLETED", dates: "Feb - June 2024" },
  { id: 3, title: "Party Conventions", subtitle: "Official nomination ceremony", icon: Award, desc: "Parties formally select their nominees and release their official platforms.", status: "COMPLETED", dates: "July - Aug 2024" },
  { id: 4, title: "General Election Campaign", subtitle: "Nationwide debates & rallies", icon: Flag, desc: "Nominees from all parties compete for the votes of the entire electorate.", status: "ACTIVE", dates: "Sept - Oct 2024" },
  { id: 5, title: "Early Voting Opens", subtitle: "Mail-in & in-person early voting", icon: Clock, desc: "States begin allowing voters to cast ballots before Election Day.", status: "ACTIVE", dates: "Oct 2024" },
  { id: 6, title: "Election Day", subtitle: "The final day of voting", icon: CheckCircle, desc: "The official day for nationwide in-person voting and ballot submission.", status: "UPCOMING", dates: "Nov 5, 2024" },
  { id: 7, title: "Vote Counting", subtitle: "Tallying every valid ballot", icon: Clock, desc: "Election officials count mail-in, early, and day-of ballots to determine winners.", status: "UPCOMING", dates: "Nov 2024" },
  { id: 8, title: "Certification of Results", subtitle: "Making the counts official", icon: Info, desc: "States certify their final vote counts after audits and canvassing.", status: "UPCOMING", dates: "Nov - Dec 2024" },
  { id: 9, title: "Electoral College Vote", subtitle: "Electors cast their ballots", icon: MapPin, desc: "Electors meet in their states to formally vote for President and VP.", status: "UPCOMING", dates: "Dec 17, 2024" },
  { id: 10, title: "Inauguration Day", subtitle: "Swearing in the President", icon: UserPlus, desc: "The President-elect is officially sworn into office at the US Capitol.", status: "UPCOMING", dates: "Jan 20, 2025" }
];

const TimelinePage = () => {
  const navigate = useNavigate();
  const completedCount = STAGES.filter(s => s.status === 'COMPLETED').length;
  const activeStage = STAGES.find(s => s.status === 'ACTIVE');

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#060a14]">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Election Timeline</h1>
        <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-400">Election Progress</span>
            <span className="text-sm font-black text-orange-500">{completedCount} of {STAGES.length} stages complete</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" 
              style={{ width: `${(completedCount / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="max-w-3xl mx-auto relative pl-8 md:pl-12">
        {/* Connection Line */}
        <div className="absolute left-[19px] md:left-[27px] top-4 bottom-4 w-1 bg-slate-800 rounded-full" />
        
        {STAGES.map((stage, i) => (
          <TimelineStage key={stage.id} stage={stage} isLast={i === STAGES.length - 1} onAskAI={() => navigate('/chat', { state: { initialMessage: `Tell me more about ${stage.title} in the US election process.` }})} />
        ))}
      </div>
    </div>
  );
};

const TimelineStage = ({ stage, onAskAI }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = () => {
    switch (stage.status) {
      case 'COMPLETED': return 'border-emerald-500/50 bg-emerald-500/5 text-slate-500';
      case 'ACTIVE': return 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
      default: return 'border-white/5 bg-white/5 text-slate-400 opacity-60';
    }
  };

  const Icon = stage.icon;

  return (
    <div className="mb-12 relative">
      {/* Dot */}
      <div className={`absolute -left-[30px] md:-left-[42px] top-2 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-[#060a14] z-10 flex items-center justify-center ${
        stage.status === 'COMPLETED' ? 'bg-emerald-500' : stage.status === 'ACTIVE' ? 'bg-orange-500 animate-pulse' : 'bg-slate-800'
      }`}>
        {stage.status === 'COMPLETED' && <CheckCircle size={14} className="text-white" />}
      </div>

      <div 
        className={`border-l-4 rounded-2xl p-5 md:p-6 transition-all cursor-pointer ${getStatusStyles()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl ${stage.status === 'ACTIVE' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Icon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`font-bold text-lg ${stage.status === 'ACTIVE' ? 'text-white' : ''}`}>{stage.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest ${
                   stage.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' : stage.status === 'ACTIVE' ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500'
                }`}>{stage.status}</span>
              </div>
              <p className="text-sm opacity-80">{stage.subtitle}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono opacity-60">{stage.dates}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-eg-fade-in">
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{stage.desc}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onAskAI(); }}
              className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:gap-3 transition-all"
            >
              <MessageSquare size={16} /> Ask AI about this stage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
