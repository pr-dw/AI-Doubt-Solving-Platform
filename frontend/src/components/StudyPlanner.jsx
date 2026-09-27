import React, { useState, useEffect } from 'react';
import { 
  Calendar, Flame, CheckCircle2, Circle, Plus, Clock, 
  Sparkles, Target, Trophy, ArrowRight, Hourglass 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function StudyPlanner({ user, onRequireAuth }) {
  const [goals, setGoals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDuration, setNewDuration] = useState(45);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, subjectsData] = await Promise.all([
        api.getStudyGoals(),
        api.getSubjects()
      ]);
      setGoals(goalsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) setNewSubject(subjectsData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (goalId) => {
    try {
      const updated = await api.toggleStudyGoal(goalId);
      setGoals(goals.map(g => g.id === goalId ? updated : g));
      if (updated.is_completed) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#f59e0b', '#10b981']
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createStudyGoal({
        title: newTitle,
        subject: newSubject || null,
        duration_minutes: parseInt(newDuration) || 45
      });
      setGoals([created, ...goals]);
      setNewTitle('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = goals.filter(g => g.is_completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200 bg-white shadow-xs">
        <Target className="h-12 w-12 mx-auto text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Sign in to manage Study Planner</h3>
        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          Set daily learning targets, track your 7-day study streak, and prepare for upcoming exams.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Streaks & Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Streak Counter Card */}
        <div className="glass-panel rounded-3xl p-6 border border-amber-200 bg-white shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Active Study Streak</span>
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-amber-600">{user.streak_count || 7}</span>
            <span className="text-sm font-semibold text-slate-500">Consecutive Days</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Longest recorded: <strong className="text-amber-700">{user.longest_streak || 12} days</strong>. Keep asking doubts daily!
          </p>
        </div>

        {/* Exam Countdown Card */}
        <div className="glass-panel rounded-3xl p-6 border border-indigo-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Semester Exam Countdown</span>
            <Hourglass className="h-5 w-5 text-indigo-600 animate-spin" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-indigo-700">14</span>
            <span className="text-sm font-semibold text-slate-500">Days Remaining</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            BCA Sem 5 Midterms commence soon. Review Unit 3 & 4 resources.
          </p>
        </div>

        {/* Goal Completion Rate Card */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Today's Target Progress</span>
            <Trophy className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-emerald-600">{progressPercent}%</span>
            <span className="text-sm font-semibold text-slate-500">({completedCount}/{goals.length} Goals)</span>
          </div>
          {/* Mini progress bar */}
          <div className="h-2 w-full rounded-full bg-slate-100 mt-3 overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Daily Study Goals Management */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <span>Personalized Study Goals & Checklists</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off your academic tasks to maintain consistency and streak points
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Goal</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="divide-y divide-slate-100 mt-4">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p>No study goals set for today.</p>
              <p className="text-[10px] text-slate-400 mt-1">Click "Add Study Goal" to get started.</p>
            </div>
          ) : (
            goals.map(g => (
              <div
                key={g.id}
                onClick={() => handleToggle(g.id)}
                className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  g.is_completed ? 'bg-emerald-50/60 opacity-80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-indigo-600 focus:outline-none cursor-pointer">
                    {g.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                    )}
                  </button>
                  <div>
                    <span className={`text-xs font-semibold ${g.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {g.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span className="font-mono text-indigo-600 font-medium">{g.subject_name || 'Academic'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {g.duration_minutes} mins
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  g.is_completed 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {g.is_completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-200 bg-white shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Create New Study Target</h3>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 3 Dijkstra graph questions"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold focus:bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Estimated Duration (Minutes)</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 cursor-pointer"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
