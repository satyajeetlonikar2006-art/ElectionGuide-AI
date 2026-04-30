import React, { createContext, useContext, useState, useEffect } from 'react';

const UserStateContext = createContext();

export const UserStateProvider = ({ children }) => {
  const [selectedState, setSelectedState] = useState(() => {
    try {
      return localStorage.getItem('eg_selected_state') || 'NY';
    } catch (e) { return 'NY'; }
  });

  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('eg_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [savedAnswers, setSavedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('eg_saved_answers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [quizHistory, setQuizHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('eg_quiz_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('eg_theme') === 'dark';
    } catch (e) { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('eg_selected_state', selectedState); } catch (e) {}
  }, [selectedState]);

  useEffect(() => {
    try { localStorage.setItem('eg_checklist', JSON.stringify(checklist)); } catch (e) {}
  }, [checklist]);

  useEffect(() => {
    try { localStorage.setItem('eg_saved_answers', JSON.stringify(savedAnswers)); } catch (e) {}
  }, [savedAnswers]);

  useEffect(() => {
    try { localStorage.setItem('eg_quiz_history', JSON.stringify(quizHistory)); } catch (e) {}
  }, [quizHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('eg_theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [darkMode]);

  const toggleChecklistItem = (id) => {
    setChecklist(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const saveAnswer = (question, answer) => {
    setSavedAnswers(prev => [
      ...prev,
      { id: Date.now(), question, answer, date: new Date().toISOString() }
    ].slice(0, 50));
  };

  const addQuizResult = (result) => {
    setQuizHistory(prev => [result, ...prev].slice(0, 10));
  };

  return (
    <UserStateContext.Provider value={{
      selectedState, setSelectedState,
      checklist, toggleChecklistItem, setChecklist,
      savedAnswers, saveAnswer, setSavedAnswers,
      quizHistory, addQuizResult,
      darkMode, setDarkMode
    }}>
      {children}
    </UserStateContext.Provider>
  );
};

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) throw new Error('useUserState must be used within UserStateProvider');
  return context;
};
