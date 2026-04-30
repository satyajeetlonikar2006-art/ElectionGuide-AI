import React from 'react';
import { useUserState } from '../contexts/UserStateContext';
import { STATE_DATA } from '../constants/stateData';
import { MapPin, Globe, ShieldCheck, Calendar, Clock, Inbox, MessageSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FindInfoPage = () => {
  const { selectedState, setSelectedState } = useUserState();
  const navigate = useNavigate();
  const stateInfo = STATE_DATA[selectedState];

  const handleAskAI = () => {
    navigate('/chat', { state: { initialMessage: `Tell me about the specific voting rules and deadlines for the state of ${stateInfo.name}.` }});
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#060a14]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* State Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">State Voter Guide</h1>
            <p className="text-slate-400">Official voting information and deadlines for your location.</p>
          </div>
          <div className="relative group">
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="appearance-none bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-white font-bold focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              {Object.keys(STATE_DATA).map(code => (
                <option key={code} value={code}>{STATE_DATA[code].name}</option>
              ))}
            </select>
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Registration Info */}
          <InfoCard title="Registration Info" icon={ShieldCheck} color="text-emerald-500">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Deadline</div>
                <div className="text-lg font-bold text-white">{stateInfo.registration_deadline}</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Same-Day Reg</div>
                <div className={`text-xs font-black uppercase px-3 py-1 rounded-full ${stateInfo.same_day_reg ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {stateInfo.same_day_reg ? 'Available' : 'Not Available'}
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Requirements</div>
                <p className="text-sm text-slate-300 leading-relaxed">{stateInfo.id_requirements}</p>
              </div>
              <a 
                href={stateInfo.online_reg_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
              >
                Register Online <ExternalLink size={16} />
              </a>
            </div>
          </InfoCard>

          {/* Voting Methods */}
          <InfoCard title="Voting Methods" icon={Inbox} color="text-blue-500">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">In-Person Polls</div>
                <div className="text-sm font-bold text-white">{stateInfo.polling_hours}</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Early Voting</div>
                <div className="text-sm font-bold text-white">{stateInfo.early_voting}</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Mail-in Ballots</div>
                <div className="text-sm font-bold text-white">{stateInfo.mail_in}</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Drop Boxes</div>
                <div className="text-sm font-bold text-white">{stateInfo.drop_boxes}</div>
              </div>
              <button 
                onClick={handleAskAI}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                <MessageSquare size={16} /> Ask AI about {stateInfo.name}
              </button>
            </div>
          </InfoCard>

        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-slate-500 font-medium px-12">
          Disclaimer: Election rules and deadlines can change. Always verify information with your local election office or the official state website provided above.
        </p>
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon: Icon, color, children }) => (
  <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl">
    <div className="flex items-center gap-3 mb-8">
      <div className={`p-3 bg-white/5 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

export default FindInfoPage;
