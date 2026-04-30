import React, { useEffect, useState } from 'react';
import { useUserState } from '../contexts/UserStateContext';
import { CheckCircle, Circle, Trash2, Share2, Info, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const CHECKLIST_GROUPS = [
  {
    id: "registration",
    title: "Registration",
    items: [
      { id: "reg_1", label: "Check if I am eligible to vote" },
      { id: "reg_2", label: "Register to vote (or verify registration)" },
      { id: "reg_3", label: "Update my address if I moved" },
      { id: "reg_4", label: "Check my registration status online" }
    ]
  },
  {
    id: "before",
    title: "Before Election Day",
    items: [
      { id: "bef_1", label: "Find my polling location" },
      { id: "bef_2", label: "Review my sample ballot" },
      { id: "bef_3", label: "Research candidates and measures" },
      { id: "bef_4", label: "Decide: vote in-person or mail-in?" },
      { id: "bef_5", label: "Request mail-in ballot (if applicable)" }
    ]
  },
  {
    id: "election",
    title: "Election Day",
    items: [
      { id: "day_1", label: "Know what ID to bring" },
      { id: "day_2", label: "Plan my travel to polling place" },
      { id: "day_3", label: "Allow enough time (no rushing)" },
      { id: "day_4", label: "Cast my ballot!" }
    ]
  },
  {
    id: "after",
    title: "After Voting",
    items: [
      { id: "aft_1", label: "Track my mail-in ballot status" },
      { id: "aft_2", label: "Check election results" },
      { id: "aft_3", label: "Share your 'I Voted!' badge" }
    ]
  }
];

const TOTAL_STEPS = CHECKLIST_GROUPS.reduce((acc, g) => acc + g.items.length, 0);

const ChecklistPage = () => {
  const { checklist, toggleChecklistItem, setChecklist } = useUserState();
  const navigate = useNavigate();
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TOTAL_STEPS) * 100);

  // Confetti logic for category completion
  const checkCategoryCompletion = (groupId) => {
    const group = CHECKLIST_GROUPS.find(g => g.id === groupId);
    const allDone = group.items.every(item => checklist[item.id]);
    if (allDone) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#f97316', '#ffffff'] });
    }
  };

  const handleShare = () => {
    const text = `I completed ${completedCount}/${TOTAL_STEPS} voter readiness steps on ElectionGuide! 🗳️`;
    navigator.clipboard.writeText(text);
    alert('Progress copied to clipboard!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your checklist?')) {
      // Create empty checklist object
      const reset = {};
      setChecklist(reset);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#060a14]">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white mb-4">Voter Readiness</h1>
            <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-400">{completedCount} of {TOTAL_STEPS} steps complete</span>
                <span className="text-sm font-black text-orange-500">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleShare} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
              <Share2 size={20} />
            </button>
            <button onClick={handleReset} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {progressPercent === 100 && (
          <div className="bg-orange-500 p-8 rounded-3xl text-center animate-bounce">
             <h2 className="text-3xl font-black text-white mb-2">You are Voter Ready! 🗳️</h2>
             <p className="text-white/90 font-medium">You've completed every step to ensure your voice is heard.</p>
          </div>
        )}

        {/* Groups */}
        <div className="space-y-12 pb-20">
          {CHECKLIST_GROUPS.map((group) => (
            <div key={group.id} className="space-y-4">
              <h2 className="text-xl font-bold text-white px-2 flex items-center gap-3">
                {group.title}
                <span className="h-1 flex-1 bg-white/5 rounded-full" />
              </h2>
              <div className="grid gap-3">
                {group.items.map((item) => (
                  <ChecklistItem 
                    key={item.id} 
                    item={item} 
                    isChecked={!!checklist[item.id]} 
                    onToggle={() => {
                      toggleChecklistItem(item.id);
                      // Check completion on next tick
                      setTimeout(() => checkCategoryCompletion(group.id), 10);
                    }}
                    onLearnMore={() => navigate('/chat', { state: { initialMessage: `How do I ${item.label.toLowerCase()}?` }})}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChecklistItem = ({ item, isChecked, onToggle, onLearnMore }) => (
  <div 
    onClick={onToggle}
    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
      isChecked ? 'bg-slate-900/20 border-white/5 opacity-50' : 'bg-slate-900/40 border-white/10 hover:border-orange-500/30'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`transition-all ${isChecked ? 'text-emerald-500' : 'text-slate-600 group-hover:text-orange-500'}`}>
        {isChecked ? <CheckCircle size={24} fill="currentColor" className="text-emerald-500/20" /> : <Circle size={24} />}
      </div>
      <span className={`font-medium transition-all ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
        {item.label}
      </span>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onLearnMore(); }}
      className="p-2 text-slate-600 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
    >
      <Info size={18} />
    </button>
  </div>
);

export default ChecklistPage;
