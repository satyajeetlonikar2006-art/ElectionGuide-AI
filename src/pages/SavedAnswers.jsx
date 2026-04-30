import React from 'react';
import { useUserState } from '../contexts/UserStateContext';
import { Bookmark, Trash2, Printer, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedAnswersPage = () => {
  const { savedAnswers, setSavedAnswers } = useUserState();

  const handleDelete = (id) => {
    setSavedAnswers(prev => prev.filter(ans => ans.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#060a14]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="flex items-center gap-4">
            <Link to="/chat" className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Saved Answers</h1>
              <p className="text-slate-400">A collection of your bookmarked civic information.</p>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            <Printer size={20} /> Export as PDF
          </button>
        </div>

        {/* Saved List */}
        <div className="space-y-6 pb-20">
          {savedAnswers.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl">
              <Bookmark className="text-slate-700 mx-auto mb-4" size={48} />
              <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">No saved answers yet</div>
            </div>
          ) : (
            savedAnswers.map((ans) => (
              <div key={ans.id} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6 group relative">
                <div className="flex justify-between items-start gap-6">
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest font-black text-orange-500">Question</div>
                    <h3 className="text-xl font-bold text-white">{ans.question}</h3>
                  </div>
                  <button 
                    onClick={() => handleDelete(ans.id)}
                    className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all print:hidden"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest font-black text-slate-600">AI Answer</div>
                  <div className="text-slate-300 leading-relaxed prose prose-invert max-w-none">
                    {ans.answer}
                  </div>
                </div>

                <div className="text-[10px] text-slate-700 font-mono">
                  Saved on {new Date(ans.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .bg-slate-900\\/40 { background: transparent !important; border: 1px solid #eee !important; page-break-inside: avoid; }
          .text-white { color: black !important; }
          .text-slate-400, .text-slate-300 { color: #333 !important; }
          .text-orange-500 { color: #f97316 !important; }
          .prose-invert { color: black !important; }
        }
      `}} />
    </div>
  );
};

export default SavedAnswersPage;
