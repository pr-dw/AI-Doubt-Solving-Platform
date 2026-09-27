import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Award, Play, RotateCcw, 
  HelpCircle, ChevronRight, Sparkles, BookOpen, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function QuizCenter({ user, onRequireAuth }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await api.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      const data = await api.getQuizDetail(quizId);
      setActiveQuiz(data);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setTimeSpent(0);
      setTimerActive(true);
      setQuizResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (optIndex) => {
    if (quizResult) return; // quiz completed
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: optIndex
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setTimerActive(false);

    const answersArray = activeQuiz.questions.map((_, idx) => 
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null
    );

    try {
      const res = await api.submitQuiz(activeQuiz.id, answersArray, timeSpent);
      setQuizResult(res);

      if (res.percentage >= 60) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Award className="h-3.5 w-3.5" />
            <span>Interactive Quiz & Viva Evaluation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curriculum Mock Tests & Exam Drills
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Test conceptual retention with subject-wise quizzes, automated scoring, real-time timer countdowns, and comprehensive question explanations.
          </p>
        </div>
      </div>

      {!activeQuiz ? (
        /* Quizzes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(q => {
            const isHard = q.difficulty === 'Hard';
            const isMedium = q.difficulty === 'Medium';
            return (
              <div 
                key={q.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono">
                      {q.subject_code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHard ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : isMedium ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {q.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Topic: {q.topic}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {q.questions?.length || 3} Multiple Choice Questions
                  </p>
                </div>

                <button
                  onClick={() => startQuiz(q.id)}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-900 group-hover:bg-indigo-600 group-hover:text-white border border-slate-800 group-hover:border-indigo-500 text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Practice Quiz</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 max-w-3xl mx-auto space-y-6">
          
          {/* Quiz Top bar: Title & Timer */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase">{activeQuiz.subject_code}</span>
              <h3 className="font-bold text-base text-slate-100">{activeQuiz.title}</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </div>
          </div>

          {!quizResult ? (
            /* Question Card */
            <div className="space-y-6">
              
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
                <span className="text-[11px] font-semibold text-indigo-400">{activeQuiz.difficulty} Level</span>
              </div>

              {/* Question prompt */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {activeQuiz.questions[currentQIndex]?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuiz.questions[currentQIndex]?.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100'
                          : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300"
                >
                  Previous
                </button>

                {currentQIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    {submitting ? 'Submitting...' : 'Submit & Check Answers'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Quiz Results & Detailed Explanations Breakdown */
            <div className="space-y-6">
              
              {/* Score Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900/60 border border-indigo-500/30 text-center">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Test Completed!</div>
                <div className="text-4xl font-black text-white mt-2">
                  {quizResult.score} / {quizResult.total_questions}
                </div>
                <div className="text-sm font-semibold text-emerald-400 mt-1">
                  Score: {quizResult.percentage}% • Time: {formatTime(timeSpent)}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-200">Detailed Answer Analysis & Concepts</h4>
                {quizResult.feedback?.map((fb, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      fb.is_correct ? 'bg-emerald-950/15 border-emerald-500/30' : 'bg-rose-950/15 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-200">
                        {idx + 1}. {fb.question}
                      </span>
                      {fb.is_correct ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 shrink-0">
                          <XCircle className="h-4 w-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-300">
                      <strong>Academic Explanation:</strong> {fb.explanation}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => startQuiz(activeQuiz.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retry Quiz
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Back to All Quizzes
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
