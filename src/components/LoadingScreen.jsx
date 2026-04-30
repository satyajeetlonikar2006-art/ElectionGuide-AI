import React, { useState, useEffect, useRef, useReducer, useCallback, memo } from 'react';

/**
 * ElectionGuide Loading Screen (Masterclass Version)
 * Features: State Machine, Web Audio API, Particles, Confetti, Keyboard Skip, Accessibility
 */

// --- Constants ---
const DEFAULT_LOAD_TIME = 3000;
const MSG_SWAP_MS = 1500;
const FACT_SWAP_MS = 4000;
const PARTICLE_COUNT = 12;
const CONFETTI_COUNT = 20;

const MESSAGES = [
  'Preparing your election guide...',
  'Loading voter information...',
  'Setting up your civic dashboard...',
  'Almost ready to vote smarter...',
];

const FACTS = [
  'Over 150 million Americans voted in the 2020 election.',
  'The first U.S. presidential election was held in 1788.',
  'Some countries have compulsory voting laws.',
  'Ranked-choice voting is used in over 50 U.S. jurisdictions.',
  'Election Day became a federal holiday proposal in 2021.',
];

const STEPS = [
  { threshold: 25, label: 'Initializing' },
  { threshold: 50, label: 'Fetching data' },
  { threshold: 75, label: 'Preparing AI' },
  { threshold: 100, label: 'Ready!' },
];

// --- Reducer ---
const initialState = {
  status: 'loading', // 'loading' | 'completing' | 'error' | 'done'
  progress: 0,
  errorMsg: null,
};

function loadingReducer(state, action) {
  switch (action.type) {
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'START_COMPLETION':
      return { ...state, status: 'completing', progress: 100 };
    case 'SET_ERROR':
      return { ...state, status: 'error', errorMsg: action.payload, progress: state.progress };
    case 'RETRY':
      return { ...state, status: 'loading', progress: 0, errorMsg: null };
    case 'FINISH':
      return { ...state, status: 'done' };
    default:
      return state;
  }
}

// --- Sub-components ---

const BallotIcon = memo(({ progress, status }) => (
  <div className={`mb-12 relative transition-all duration-500 ${status === 'error' ? 'text-red-500' : 'text-orange-500'}`} style={{ filter: 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.4))' }}>
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="animate-eg-icon-pulse">
      {/* Box Frame */}
      <path d="M20 40H80V85C80 87.76 77.76 90 75 90H25C22.24 90 20 87.76 20 85V40Z" stroke="currentColor" strokeWidth="3" />
      {/* Slot */}
      <rect x="15" y="34" width="70" height="10" rx="2" fill={status === 'error' ? '#ef4444' : '#ea580c'} />
      {/* Filling "Votes" */}
      <rect 
        x="23" 
        y={90 - (progress * 0.5)} 
        width="54" 
        height={progress * 0.5} 
        fill="currentColor" 
        className="transition-all duration-300"
      />
    </svg>
  </div>
));

const ProgressBar = memo(({ progress, status }) => (
  <div className="w-full space-y-4 mb-8">
    <div className="flex justify-between items-end">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</div>
      <div className={`text-sm font-black transition-colors ${status === 'error' ? 'text-red-500' : 'text-orange-500'}`}>
        {Math.round(progress)}%
      </div>
    </div>
    
    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-300 relative ${status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-[length:200%_100%] animate-eg-bar-slide shadow-[0_0_20px_rgba(249,115,22,0.3)]'}`}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>

    {/* Step Indicators */}
    <div className="flex justify-between px-1">
      {STEPS.map((step, i) => (
        <div key={i} className="group relative">
          <div 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              progress >= step.threshold 
                ? 'bg-orange-500 scale-125 shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
                : 'bg-zinc-800'
            }`}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-white/10 text-[9px] text-zinc-400 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {step.label}
          </div>
        </div>
      ))}
    </div>
  </div>
));

const MessageRotator = memo(({ msgIdx, status, errorMsg }) => (
  <div className="h-6 relative overflow-hidden mb-2" role="status" aria-live="polite">
    {status === 'error' ? (
      <div className="text-red-500 font-bold text-sm animate-eg-fade-in">{errorMsg || 'An error occurred'}</div>
    ) : (
      MESSAGES.map((msg, i) => (
        <div 
          key={i} 
          className={`absolute inset-0 text-sm font-medium transition-all duration-500 flex items-center justify-center ${
            msgIdx === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } ${status === 'completing' ? 'text-emerald-400' : 'text-zinc-200'}`}
        >
          {status === 'completing' ? 'Ready to vote!' : msg}
        </div>
      ))
    )}
  </div>
));

const FactsTicker = memo(({ factIdx, status }) => {
  if (status === 'error') return null;
  return (
    <div className="h-10 relative overflow-hidden mt-4">
      {FACTS.map((fact, i) => (
        <div 
          key={i} 
          className={`absolute inset-0 text-[11px] italic text-zinc-500 transition-all duration-700 max-w-[280px] mx-auto leading-tight ${
            factIdx === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          “{fact}”
        </div>
      ))}
    </div>
  );
});

const Particles = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
      <div 
        key={i}
        className="absolute w-1 h-1 bg-orange-500 rounded-full opacity-20 animate-eg-particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${4 + Math.random() * 6}s`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
));

const Confetti = memo(({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-eg-confetti"
          style={{
            backgroundColor: ['#f97316', '#ffffff', '#71717a'][i % 3],
            '--angle': `${(360 / CONFETTI_COUNT) * i}deg`,
            '--dist': `${50 + Math.random() * 100}px`
          }}
        />
      ))}
    </div>
  );
});

// --- Main Component ---

const LoadingScreen = ({ onComplete, onRetry, error, duration = DEFAULT_LOAD_TIME, appVersion = 'v1.0.0' }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);
  const [msgIdx, setMsgIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSkipHint, setShowSkipHint] = useState(false);
  
  const audioCtxRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const requestRef = useRef();

  // Sound Engine
  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio Context failed', e);
    }
  }, [soundEnabled]);

  // Main Loading Loop
  const animate = useCallback(() => {
    if (state.status !== 'loading') return;

    const elapsed = Date.now() - startTimeRef.current;
    const prog = Math.min((elapsed / duration) * 100, 100);
    
    dispatch({ type: 'SET_PROGRESS', payload: prog });

    if (prog >= 100) {
      dispatch({ type: 'START_COMPLETION' });
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [state.status, duration]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Keyboard Skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && state.status === 'loading') {
        e.preventDefault();
        dispatch({ type: 'START_COMPLETION' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const hintTimer = setTimeout(() => setShowSkipHint(true), 1000);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(hintTimer);
    };
  }, [state.status]);

  // Timers for messages and facts
  useEffect(() => {
    if (state.status !== 'loading') return;
    const msgTimer = setInterval(() => {
      setMsgIdx(p => (p + 1) % MESSAGES.length);
      playTick();
    }, MSG_SWAP_MS);
    const factTimer = setInterval(() => setFactIdx(p => (p + 1) % FACTS.length), FACT_SWAP_MS);
    return () => {
      clearInterval(msgTimer);
      clearInterval(factTimer);
    };
  }, [state.status, playTick]);

  // Handle External Error Prop
  useEffect(() => {
    if (error) dispatch({ type: 'SET_ERROR', payload: error });
  }, [error]);

  // Handle Completion Exit
  useEffect(() => {
    if (state.status === 'completing') {
      const exitTimer = setTimeout(() => {
        dispatch({ type: 'FINISH' });
        if (onComplete) onComplete();
      }, 900);
      return () => clearTimeout(exitTimer);
    }
  }, [state.status, onComplete]);

  // Accessibility: Reduced Motion
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setTimeout(() => dispatch({ type: 'START_COMPLETION' }), 1000);
    }
  }, []);

  if (state.status === 'done') return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center p-6 transition-all duration-700 ${state.status === 'completing' ? 'opacity-0 -translate-y-10 scale-105' : 'opacity-100'}`}>
      {/* Background Layer */}
      <div className="absolute inset-0 bg-eg-dots opacity-5 animate-eg-bg-drift pointer-events-none" />
      <Particles />
      <Confetti active={state.status === 'completing'} />

      {/* Sound Toggle */}
      <button 
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
        aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 group-hover:text-white">
          {soundEnabled ? (
            <path d="M11 5L6 9H2V15H6L11 19V5Z M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14" />
          ) : (
            <path d="M11 5L6 9H2V15H6L11 19V5Z M23 9l-6 6 M17 9l6 6" />
          )}
        </svg>
      </button>

      {/* Center Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <BallotIcon progress={state.progress} status={state.status} />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter font-eg-syne animate-eg-fade-in-up" style={{ animationDelay: '150ms' }}>
            Election<span className="text-orange-500">Guide</span>
          </h1>
          <div className="text-zinc-500 text-xs font-medium tracking-wide animate-eg-fade-in-up" style={{ animationDelay: '300ms' }}>
            YOUR CIVIC GUIDE — LOADING...
          </div>
        </div>

        <ProgressBar progress={state.progress} status={state.status} />
        <MessageRotator msgIdx={msgIdx} status={state.status} errorMsg={state.errorMsg} />
        <FactsTicker factIdx={factIdx} status={state.status} />

        {state.status === 'error' && (
          <button 
            onClick={onRetry}
            className="mt-8 px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-600/20"
          >
            Retry Connection
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-8 text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
        {appVersion}
      </div>

      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Powered by AI</div>
      </div>

      {showSkipHint && state.status === 'loading' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[11px] text-zinc-600 animate-eg-fade-in">
          Press <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-zinc-400">Space</span> to skip
        </div>
      )}

      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        
        .font-eg-syne { font-family: 'Syne', sans-serif; }

        .bg-eg-dots {
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes eg-icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes eg-bar-slide {
          from { background-position: 0 0; }
          to { background-position: 200% 0; }
        }

        @keyframes eg-bg-drift {
          from { transform: translateY(0); }
          to { transform: translateY(-24px); }
        }

        @keyframes eg-fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes eg-particle {
          0% { transform: translateY(100vh); opacity: 0; }
          20% { opacity: 0.2; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }

        @keyframes eg-confetti {
          0% { transform: rotate(0) translate(0, 0); opacity: 1; }
          100% { transform: rotate(var(--angle)) translate(var(--dist), var(--dist)); opacity: 0; }
        }

        .animate-eg-icon-pulse { animation: eg-icon-pulse 2s ease-in-out infinite; }
        .animate-eg-bar-slide { animation: eg-bar-slide 3s linear infinite; }
        .animate-eg-bg-drift { animation: eg-bg-drift 8s linear infinite; }
        .animate-eg-fade-in-up { animation: eg-fade-in-up 0.6s cubic-bezier(0.2, 0, 0.2, 1) forwards; }
        .animate-eg-particle { animation: eg-particle linear infinite; }
        .animate-eg-confetti { animation: eg-confetti 0.8s ease-out forwards; }
        .animate-eg-fade-in { animation: fadeIn 0.4s ease-out forwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
};

export default LoadingScreen;
