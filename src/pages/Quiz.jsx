import React, { useState, useEffect, useCallback } from 'react';
import { useUserState } from '../contexts/UserStateContext';
import { QUIZ_BANK } from '../constants/quizBank';
import { Brain, Clock, Zap, Trophy, RefreshCw, ChevronRight, MessageSquare, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const QUESTION_TIME = 30;

const QuizPage = () => {
  const navigate = useNavigate();
  const { addQuizResult } = useUserState();
  
  const [difficulty, setDifficulty] = useState(null);
  const [gameStatus, setGameStatus] = useState('menu'); // 'menu' | 'playing' | 'finished'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { question, selected, correct, isCorrect }

  // Start Quiz
  const startQuiz = (level) => {
    const bank = QUIZ_BANK[level];
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 10);
    setDifficulty(level);
    setQuestions(shuffled);
    setGameStatus('playing');
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setStreak(0);
    setAnswers([]);
  };

  // Timer logic
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    if (timeLeft === 0) {
      handleAnswer(null); // Time out
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameStatus]);

  const handleAnswer = (selectedOption) => {
    const question = questions[currentIdx];
    const isCorrect = selectedOption === question.answer;
    
    let points = 0;
    if (isCorrect) {
      points = 10;
      if (timeLeft > 20) points += 5; // Speed bonus
      if (streak >= 2) points += 5; // Streak bonus
      setStreak(s => s + 1);
      setScore(s => s + points);
    } else {
      setStreak(0);
    }

    const newAnswer = {
      question: question.question,
      selected: selectedOption,
      correct: question.answer,
      isCorrect,
      explanation: question.explanation
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Move to next question or finish
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTimeLeft(QUESTION_TIME);
    } else {
      finishQuiz(score + points);
    }
  };

  const finishQuiz = (finalScore) => {
    setGameStatus('finished');
    const result = {
      difficulty,
      score: finalScore,
      percentage: (answers.filter(a => a.isCorrect).length / questions.length) * 100,
      date: new Date().toISOString()
    };
    addQuizResult(result);
    if (result.percentage > 80) {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }
  };

  if (gameStatus === 'menu') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#060a14]">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-orange-600/20 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
            <Brain size={40} />
          </div>
          <h1 className="text-4xl font-black text-white">Civic Knowledge Quiz</h1>
          <p className="text-slate-400">Test your understanding of the US democratic process and earn badges.</p>
          
          <div className="grid gap-4 mt-12">
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button 
                key={level}
                onClick={() => startQuiz(level)}
                className="group relative flex items-center justify-between p-6 bg-slate-900/40 border border-white/5 rounded-3xl hover:border-orange-500 transition-all text-left"
              >
                <div>
                  <div className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">{level}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">10 Questions</div>
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'playing') {
    const question = questions[currentIdx];
    const progress = (currentIdx / questions.length) * 100;
    const timerPercent = (timeLeft / QUESTION_TIME) * 100;

    return (
      <div className="flex-1 flex flex-col bg-[#060a14]">
        {/* Quiz Progress Bar */}
        <div className="h-1.5 w-full bg-white/5">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 p-6 md:p-12 flex flex-col max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
               <div className="text-slate-500 font-bold text-sm">Question {currentIdx + 1} / {questions.length}</div>
               {streak >= 3 && <div className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-black animate-bounce">🔥 STREAK: {streak}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
              <div className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{question.question}</h2>
          </div>

          <div className="grid gap-4 mb-12">
            {question.type === 'multiple-choice' ? (
              question.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="p-5 md:p-6 text-left bg-slate-900/40 border border-white/5 rounded-2xl text-slate-200 font-medium hover:bg-orange-500/10 hover:border-orange-500/50 transition-all"
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="flex gap-4">
                <button onClick={() => handleAnswer('True')} className="flex-1 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-500 font-bold hover:bg-emerald-500/20 transition-all">True</button>
                <button onClick={() => handleAnswer('False')} className="flex-1 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 font-bold hover:bg-red-500/20 transition-all">False</button>
              </div>
            )}
          </div>

          {/* Points display */}
          <div className="mt-auto flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-3xl">
            <div className="flex items-center gap-2">
              <Zap className="text-orange-500" size={18} />
              <span className="text-slate-400 text-sm font-bold">Current Score</span>
            </div>
            <div className="text-2xl font-black text-white">{score}</div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    let grade = "Civic Novice";
    if (percentage >= 90) grade = "Civic Champion";
    else if (percentage >= 70) grade = "Civic Pro";
    else if (percentage >= 50) grade = "Civic Learner";

    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#060a14]">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center">
            <Trophy className="text-yellow-500 mx-auto mb-6" size={64} />
            <h1 className="text-4xl font-black text-white mb-2">Quiz Complete!</h1>
            <p className="text-slate-400">You earned the rank of <span className="text-orange-500 font-bold">{grade}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl text-center">
              <div className="text-4xl font-black text-white mb-2">{score}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Total Points</div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl text-center">
              <div className="text-4xl font-black text-white mb-2">{percentage}%</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Accuracy</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white px-2">Review Answers</h3>
            {answers.map((ans, i) => (
              <div key={i} className={`p-6 rounded-3xl border ${ans.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="font-bold text-white">{ans.question}</div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {ans.isCorrect ? 'Correct' : 'Wrong'}
                  </div>
                </div>
                <div className="text-sm text-slate-400 mb-4">
                  {ans.isCorrect ? (
                    <span>Your answer: <b className="text-emerald-500">{ans.selected}</b></span>
                  ) : (
                    <span>Correct answer: <b className="text-emerald-500">{ans.correct}</b> (You: <span className="text-red-500">{ans.selected || 'No answer'}</span>)</span>
                  )}
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-xs text-slate-300 leading-relaxed">
                  💡 {ans.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-12 pb-20">
            <button onClick={() => setGameStatus('menu')} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
              <RefreshCw size={18} /> Play Again
            </button>
            <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Share2 size={18} /> Share Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizPage;
