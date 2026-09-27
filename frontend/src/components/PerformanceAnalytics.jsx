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
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200 bg-white shadow-xs">
        <Award className="h-12 w-12 mx-auto text-indigo-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Sign in to view Performance Analytics</h3>
        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          Access your semester marks, strong and weak subjects analysis, and personalized AI improvement advice.
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

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <Sparkles className="h-8 w-8 mx-auto text-indigo-600 animate-spin mb-3" />
        <span>Compiling performance analytics and AI recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Student Profile Header & Summary Metrics */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-md shadow-indigo-600/30">
              {report?.student_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{report?.student_name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
                  BCA Semester {report?.semester || 5}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Roll No: <span className="font-mono font-medium text-indigo-700">{report?.roll_number}</span> • {report?.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Overall Avg</div>
              <div className="text-lg font-extrabold text-emerald-600">{report?.average_score}%</div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Daily Streak</div>
              <div className="text-lg font-extrabold text-amber-600 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{report?.streak_count}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Doubts Solved</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{report?.total_queries_asked || 0}</div>
            <div className="text-[10px] text-indigo-600 mt-1">Via local Ollama model</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Quizzes Completed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{report?.total_quizzes_attempted || 0}</div>
            <div className="text-[10px] text-purple-600 mt-1">Avg Score: {report?.average_quiz_score || 0} pts</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Strong Subjects</span>
            </div>
            <div className="text-xs font-semibold text-emerald-800 mt-2 truncate">
              {report?.strong_subjects?.join(', ') || 'Keep studying to identify!'}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">Scoring ≥ 80%</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Focus Areas</span>
            </div>
            <div className="text-xs font-semibold text-amber-800 mt-2 truncate">
              {report?.weak_subjects?.join(', ') || 'All subjects above 70%!'}
            </div>
            <div className="text-[10px] text-amber-600 mt-1">Recommended for revision</div>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown Bar Chart & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject-Wise Performance Progress Bars (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span>Subject Assessment Scores</span>
              </h3>
              <p className="text-[11px] text-slate-500">Current Semester Performance</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">Target: 85%+</span>
          </div>

          <div className="space-y-4 pt-1">
            {report?.subject_breakdown?.map((item, idx) => {
              const isHigh = item.score >= 80;
              const isMedium = item.score >= 70 && item.score < 80;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.subject_name} <span className="text-[10px] text-slate-400 font-mono">({item.subject_code})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{item.marks_obtained}/{item.max_marks}</span>
                      <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                        isHigh ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isMedium ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.score}% ({item.grade})
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
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
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>AI Performance Insights</span>
            </h3>
            <p className="text-[11px] text-slate-500">Contextual study suggestions</p>
          </div>

          <div className="space-y-3">
            {report?.ai_recommendations?.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:border-purple-300 transition-colors">
                <div className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Regularly asking doubts and practicing PYQs directly improves your assessment grades.</span>
          </div>
        </div>

      </div>

      {/* Assessment History Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span>Internal Assessment & Exam Record Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Exam Type</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {r.subject_details?.name} ({r.subject_details?.code})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{r.exam_type}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                    {r.marks_obtained} / {r.max_marks} ({r.performance_score}%)
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{r.grade}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
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
