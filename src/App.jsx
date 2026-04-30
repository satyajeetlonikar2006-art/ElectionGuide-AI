import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserStateProvider } from './contexts/UserStateContext';
import Navbar from './components/layout/Navbar';
import BottomBar from './components/layout/BottomBar';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Timeline from './pages/Timeline';
import Checklist from './pages/Checklist';
import Quiz from './pages/Quiz';
import FindInfo from './pages/FindInfo';
import SavedAnswers from './pages/SavedAnswers';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans pb-16 md:pb-0 selection:bg-orange-500/30">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="animate-eg-fade-in flex-1 flex flex-col">
          {children}
        </div>
      </main>
      <BottomBar />
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserStateProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-[#09090b]">
          {isLoading ? (
            <LoadingScreen 
              onComplete={() => setIsLoading(false)} 
              duration={3000}
              appVersion="v1.0.0"
            />
          ) : (
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/checklist" element={<Checklist />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/find-info" element={<FindInfo />} />
                <Route path="/saved" element={<SavedAnswers />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          )}
        </div>
      </BrowserRouter>
    </UserStateProvider>
  );
};

export default App;
