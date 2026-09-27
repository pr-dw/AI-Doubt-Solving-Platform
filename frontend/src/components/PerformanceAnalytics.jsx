import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Award, TrendingUp, AlertTriangle, CheckCircle, 
  BookOpen, Sparkles, Flame, User, Calendar 
} from 'lucide-react';
import { api } from '../services/api';

export default function PerformanceAnalytics({ user, onRequireAuth }) {
  const [report, setReport] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [rep, recs] = await Promise.all([
        api.getAnalyticsReport(),
        api.getAcademicRecords()
      ]);
      setReport(rep);
      setRecords(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-800">
        <Award className="h-12 w-12 mx-auto text-indigo-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-100">Sign in to view Performance Analytics</h3>
        <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
          Access your semester marks, strong and weak subjects analysis, and personalized AI improvement advice.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <Sparkles className="h-8 w-8 mx-auto text-indigo-400 animate-spin mb-3" />
        <span>Compiling performance analytics and AI recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Student Profile Header & Summary Metrics */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
              {report?.student_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{report?.student_name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  BCA Semester {report?.semester || 5}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Roll No: <span className="font-mono text-indigo-300">{report?.roll_number}</span> • {report?.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Overall Avg</div>
              <div className="text-lg font-extrabold text-emerald-400">{report?.average_score}%</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Streak</div>
              <div className="text-lg font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 fill-amber-400" />
                <span>{report?.streak_count}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Doubts Solved</div>
            <div className="text-2xl font-black text-white mt-1">{report?.total_queries_asked || 0}</div>
            <div className="text-[10px] text-indigo-400 mt-1">Via local Ollama model</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Quizzes Completed</div>
            <div className="text-2xl font-black text-white mt-1">{report?.total_quizzes_attempted || 0}</div>
            <div className="text-[10px] text-purple-400 mt-1">Avg Score: {report?.average_quiz_score || 0} pts</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/20 bg-emerald-950/10">
            <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Strong Subjects</span>
            </div>
            <div className="text-xs font-semibold text-emerald-200 mt-2 truncate">
              {report?.strong_subjects?.join(', ') || 'Keep studying to identify!'}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Scoring ≥ 80%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 bg-amber-950/10">
            <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Focus Areas</span>
            </div>
            <div className="text-xs font-semibold text-amber-200 mt-2 truncate">
              {report?.weak_subjects?.join(', ') || 'All subjects above 70%!'}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1">Recommended for revision</div>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown Bar Chart & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject-Wise Performance Progress Bars (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                <span>Subject Assessment Scores</span>
              </h3>
              <p className="text-[11px] text-slate-400">Current Semester Performance</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400">Target: 85%+</span>
          </div>

          <div className="space-y-4 pt-1">
            {report?.subject_breakdown?.map((item, idx) => {
              const isHigh = item.score >= 80;
              const isMedium = item.score >= 70 && item.score < 80;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {item.subject_name} <span className="text-[10px] text-slate-500 font-mono">({item.subject_code})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{item.marks_obtained}/{item.max_marks}</span>
                      <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                        isHigh ? 'bg-emerald-500/20 text-emerald-300' : isMedium ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.score}% ({item.grade})
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isMedium ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations & Improvement Insights (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>AI Performance Insights</span>
            </h3>
            <p className="text-[11px] text-slate-400">Contextual study suggestions</p>
          </div>

          <div className="space-y-3">
            {report?.ai_recommendations?.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 hover:border-purple-500/30 transition-colors">
                <div className="h-6 w-6 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Regularly asking doubts and practicing PYQs directly improves your assessment grades.</span>
          </div>
        </div>

      </div>

      {/* Assessment History Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-sm text-slate-100 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <span>Internal Assessment & Exam Record Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Exam Type</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {r.subject_details?.name} ({r.subject_details?.code})
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{r.exam_type}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">
                    {r.marks_obtained} / {r.max_marks} ({r.performance_score}%)
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{r.grade}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Recorded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
