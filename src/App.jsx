/**
 * @fileoverview Root application component for ElectionGuide AI.
 * Wraps the app in AuthProvider (Google OAuth) and UserStateProvider (local state).
 * Uses React.memo on AppLayout to prevent unnecessary re-renders.
 * @module App
 */
import React, { useState, useCallback, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserStateProvider } from './contexts/UserStateContext';
import Navbar from './components/layout/Navbar';
import BottomBar from './components/layout/BottomBar';
import LoadingScreen from './components/LoadingScreen';

// Pages — lazy imports could be added here for code splitting
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Timeline from './pages/Timeline';
import Checklist from './pages/Checklist';
import Quiz from './pages/Quiz';
import FindInfo from './pages/FindInfo';
import SavedAnswers from './pages/SavedAnswers';

/**
 * Main layout wrapper — memoized to prevent re-renders when route children change.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content.
 * @returns {JSX.Element}
 */
const AppLayout = memo(({ children }) => (
  <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans pb-16 md:pb-0 selection:bg-orange-500/30">
    <Navbar />
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="animate-eg-fade-in flex-1 flex flex-col">
        {children}
      </div>
    </main>
    <BottomBar />
  </div>
));

AppLayout.displayName = 'AppLayout';

/**
 * Root application component.
 * Provides authentication (Firebase Google OAuth), user state, and routing.
 * @returns {JSX.Element}
 */
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  /** Stable callback reference to prevent LoadingScreen re-renders */
  const handleLoadingComplete = useCallback(() => setIsLoading(false), []);

  return (
    <AuthProvider>
      <UserStateProvider>
        <BrowserRouter>
          <div className="relative min-h-screen bg-[#09090b]">
            {isLoading ? (
              <LoadingScreen 
                onComplete={handleLoadingComplete} 
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
    </AuthProvider>
  );
};

export default App;
