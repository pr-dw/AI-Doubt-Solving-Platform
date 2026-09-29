import React, { useState, useEffect } from 'react';
import { 
  Compass, Target, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  Sparkles, BookOpen, FileText, Upload, Plus, ChevronRight, 
  Filter, Award, Zap, ArrowUpRight, HelpCircle, Layers,
  ChevronDown, Check, UserCheck, RefreshCw, X
} from 'lucide-react';
import { api } from '../services/api';

export default function PersonalisedStudyOrder({ user, onRequireAuth, onNavigateToDoubtSolver }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [studyOrderData, setStudyOrderData] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Faculty Upload Modal State
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [modalTab, setModalTab] = useState('exam'); // 'exam' or 'marks'
  const [examForm, setExamForm] = useState({
    subject_id: '',
    title: '',
    exam_type: 'Mid-Term Examination',
    total_marks: 50,
    questions: [
      { q_no: 'Q1', topic: '', unit: 'Unit I', max_marks: 10, text: '' }
    ]
  });
  const [marksForm, setMarksForm] = useState({
    exam_id: '',
    student_email: '',
    question_scores: []
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    loadSubjects();
    loadStudyOrder();
  }, [user]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !examForm.subject_id) {
        setExamForm(prev => ({ ...prev, subject_id: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudyOrder = async (subjId = selectedSubject, examId = selectedExam) => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudyOrder(subjId || null, examId || null);
      setStudyOrderData(data.study_order);
      setAvailableExams(data.available_exams || []);
    } catch (err) {
      setError(err.message || 'Failed to load study planner.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectFilter = (subjId) => {
    setSelectedSubject(subjId);
    loadStudyOrder(subjId, selectedExam);
  };

  const handleExamFilter = (examId) => {
    setSelectedExam(examId);
    loadStudyOrder(selectedSubject, examId);
  };

  const handleAddQuestionRow = () => {
    setExamForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { 
          q_no: `Q${prev.questions.length + 1}`, 
          topic: '', 
          unit: `Unit ${((prev.questions.length) % 5) + 1}`, 
          max_marks: 10, 
          text: '' 
        }
      ]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...examForm.questions];
    updated[index][field] = value;
    setExamForm(prev => ({ ...prev, questions: updated }));
  };

  const handleRemoveQuestion = (index) => {
    if (examForm.questions.length <= 1) return;
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateExamSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess('');
    try {
      const res = await api.createExam({
        subject_id: examForm.subject_id,
        title: examForm.title,
        exam_type: examForm.exam_type,
        total_marks: examForm.total_marks,
        questions_data: examForm.questions
      });
      setUploadSuccess(`Exam "${res.title}" created successfully! Now enter student marks.`);
      setMarksForm(prev => ({
        ...prev,
        exam_id: res.id,
        question_scores: res.questions_data.map(q => ({
          q_no: q.q_no,
          topic: q.topic,
          unit: q.unit,
          max_marks: q.max_marks,
          marks_obtained: 0,
          faculty_comment: ''
        }))
      }));
      setModalTab('marks');
      loadStudyOrder();
    } catch (err) {
      alert(err.message || 'Failed to create exam');
    } finally {
      setUploading(false);
    }
  };

  const handleScoreChange = (index, field, value) => {
    const updated = [...marksForm.question_scores];
    updated[index][field] = value;
    setMarksForm(prev => ({ ...prev, question_scores: updated }));
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    if (!marksForm.exam_id) {
      alert('Please select an exam first.');
      return;
    }
    setUploading(true);
    setUploadSuccess('');
    try {
      await api.uploadExamScores(marksForm.exam_id, {
        student_email: marksForm.student_email,
        question_scores: marksForm.question_scores
      });
      setUploadSuccess('Student scores saved and study plan computed!');
      loadStudyOrder();
      setTimeout(() => setShowFacultyModal(false), 1200);
    } catch (err) {
      alert(err.message || 'Failed to record student scores');
    } finally {
      setUploading(false);
    }
  };

  const isFaculty = user && (user.role === 'faculty' || user.role === 'admin');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
              <Compass className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Study Planner • Max-Marks Priority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Personalised Study Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our reasoning engine looks at your previous exam questions and marks deficits, ordering your study topics from <strong>most marks lost to already mastered</strong>. If you are low on time, start at Rank #1 to recover the most marks in your next exam!
            </p>
          </div>

          {/* Action button: Faculty Marks Upload or Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isFaculty && (
              <button
                onClick={() => setShowFacultyModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Exam & Marks</span>
              </button>
            )}
            <button
              onClick={() => loadStudyOrder()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Strategy Callout Card */}
        {studyOrderData && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-300 mb-0.5">Quick-Wins Exam Strategy</div>
                <div className="text-slate-200 leading-relaxed">{studyOrderData.quick_strategy}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Top 3 Recoverable Marks</div>
                <div className="text-xl font-black text-emerald-400">+{studyOrderData.recoverable_marks_top_3} Marks</div>
              </div>
              <TrendingUp className="h-6 w-6 text-emerald-400/50" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Total Marks Deficit</div>
                <div className="text-xl font-black text-rose-400">{studyOrderData.total_marks_lost} Lost</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-rose-400/50" />
            </div>
          </div>
        )}
      </div>

      {/* Subject & Exam Dropdown Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Subject Selector Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            <span>Select Subject:</span>
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition-all"
          >
            <option value="">All Subjects (Comprehensive Prioritized Plan)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exam selector if available */}
        {availableExams.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-purple-600" />
              <span>Exam Paper:</span>
            </label>
            <select
              value={selectedExam}
              onChange={(e) => handleExamFilter(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
            >
              <option value="">All Analyzed Exams</option>
              {availableExams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.subject_code}: {ex.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ranked Study Order Topic Cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Analyzing previous exam question scores & computing ROI order...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      ) : !studyOrderData || studyOrderData.ranked_topics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Exam Records Uploaded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Faculty members upload exam question papers and student marks by question. Once entered, your personalized study order will instantly populate here.
          </p>
          {isFaculty && (
            <button
              onClick={() => setShowFacultyModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Upload First Exam & Marks</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700">
              {studyOrderData.ranked_topics.length} Syllabus Topics Ranked (Highest Mark Return First)
            </span>
            <span className="text-[11px] text-slate-400">
              Priority: <span className="text-rose-600 font-bold">Critical</span> → <span className="text-amber-600 font-bold">High</span> → <span className="text-emerald-600 font-bold">Mastered</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {studyOrderData.ranked_topics.map((t) => {
              const isUrgent = t.priority === 'CRITICAL';
              const isHigh = t.priority === 'HIGH';
              const isMastered = t.priority === 'MASTERED';

              return (
                <div
                  key={`${t.subject_code}-${t.topic}`}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md bg-white ${
                    isUrgent 
                      ? 'border-rose-200 ring-1 ring-rose-100 hover:border-rose-300' 
                      : isHigh 
                        ? 'border-amber-200 hover:border-amber-300' 
                        : isMastered
                          ? 'border-emerald-200/80 bg-slate-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    {/* Left: Rank, Title, Unit, Badges */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rank Pill */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                          isUrgent 
                            ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                            : isHigh 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : isMastered 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          <span>Rank #{t.rank}</span>
                          <span>•</span>
                          <span>{t.priority}</span>
                        </span>

                        {/* Subject Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                          {t.subject_code}
                        </span>

                        {/* Unit */}
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-500 text-xs font-medium">
                          {t.unit}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h3 className="text-base font-bold text-slate-900">
                        {t.topic}
                      </h3>

                      {/* AI Reasoning Text */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {t.reasoning}
                      </p>

                      {/* Faculty Feedback (if exists) */}
                      {t.faculty_comments && t.faculty_comments.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 italic">
                          <span className="font-bold not-italic text-amber-800">Faculty Exam Note: </span>
                          "{t.faculty_comments.join(' | ')}"
                        </div>
                      )}

                      {/* Actionable Steps checklist */}
                      <div className="pt-1 space-y-1">
                        {t.actionable_steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Score Metrics, Recovery Pill & Action CTA */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      
                      {/* Score Breakdown */}
                      <div className="text-left md:text-right space-y-1">
                        <div className="text-[11px] text-slate-400 font-medium">Previous Exam Score</div>
                        <div className="text-lg font-black text-slate-900">
                          {t.marks_obtained} <span className="text-xs text-slate-400">/ {t.max_marks} marks</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              isUrgent ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : isMastered ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, t.percentage))}%` }}
                          />
                        </div>

                        {/* Recovery Potential Pill */}
                        <div className="inline-block mt-1">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            isUrgent ? 'bg-rose-50 text-rose-700' : isHigh ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {t.recovery_potential}
                          </span>
                        </div>
                      </div>

                      {/* Direct CTA: Ask Doubt Solver */}
                      <button
                        onClick={() => {
                          if (onNavigateToDoubtSolver) {
                            onNavigateToDoubtSolver(t.suggested_query);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
                        title="Open AI Doubt Solver with pre-filled doubt for this topic"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Solve Doubt</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Faculty Upload Modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Faculty Exam & Marks Entry</h3>
                  <p className="text-[11px] text-slate-500">Upload question paper questions and record student marks by question.</p>
                </div>
              </div>
              <button
                onClick={() => setShowFacultyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setModalTab('exam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  modalTab === 'exam' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. Create Exam & Questions
              </button>
              <button
                onClick={() => setModalTab('marks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  modalTab === 'marks' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. Enter Student Question Scores
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {modalTab === 'exam' ? (
              <form onSubmit={handleCreateExamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject</label>
                    <select
                      value={examForm.subject_id}
                      onChange={(e) => setExamForm(prev => ({ ...prev, subject_id: e.target.value }))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Exam Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Term Examination 2024"
                      value={examForm.title}
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Exam Type</label>
                    <select
                      value={examForm.exam_type}
                      onChange={(e) => setExamForm(prev => ({ ...prev, exam_type: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800"
                    >
                      <option value="Mid-Term Examination">Mid-Term Examination</option>
                      <option value="Internal Assessment">Internal Assessment</option>
                      <option value="End Semester Final">End Semester Final</option>
                      <option value="Class Unit Test">Class Unit Test</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Exam Marks</label>
                    <input
                      type="number"
                      value={examForm.total_marks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, total_marks: Number(e.target.value) }))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                {/* Questions Breakdown */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Question Paper Questions & Topics</label>
                    <button
                      type="button"
                      onClick={handleAddQuestionRow}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {examForm.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Q No"
                            value={q.q_no}
                            onChange={(e) => handleQuestionChange(qIdx, 'q_no', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Syllabus Topic (e.g. ALOHA Protocols)"
                            value={q.topic}
                            onChange={(e) => handleQuestionChange(qIdx, 'topic', e.target.value)}
                            required
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Unit (e.g. Unit II)"
                            value={q.unit}
                            onChange={(e) => handleQuestionChange(qIdx, 'unit', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Max"
                            value={q.max_marks}
                            onChange={(e) => handleQuestionChange(qIdx, 'max_marks', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFacultyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? 'Creating...' : 'Create Exam & Continue to Marks'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMarksSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Exam</label>
                    <select
                      value={marksForm.exam_id}
                      onChange={(e) => {
                        const exId = e.target.value;
                        const selectedEx = availableExams.find(x => String(x.id) === String(exId));
                        setMarksForm(prev => ({
                          ...prev,
                          exam_id: exId,
                          question_scores: selectedEx?.questions_data?.map(q => ({
                            q_no: q.q_no,
                            topic: q.topic,
                            unit: q.unit,
                            max_marks: q.max_marks,
                            marks_obtained: 0,
                            faculty_comment: ''
                          })) || []
                        }));
                      }}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold"
                    >
                      <option value="">Select Exam</option>
                      {availableExams.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.subject_code} - {ex.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Student Email / Roll</label>
                    <input
                      type="email"
                      placeholder="e.g. student@gmail.com"
                      value={marksForm.student_email}
                      onChange={(e) => setMarksForm(prev => ({ ...prev, student_email: e.target.value }))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                {/* Question Score Entry */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-800 block">Question-wise Marks Entry</label>
                  {marksForm.question_scores.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Select an exam above to load questions breakdown.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {marksForm.question_scores.map((qs, qIdx) => (
                        <div key={qIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-3 text-xs font-bold text-slate-800 truncate">
                            {qs.q_no}: {qs.topic}
                          </div>
                          <div className="col-span-3 flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              max={qs.max_marks}
                              min="0"
                              placeholder="Marks"
                              value={qs.marks_obtained}
                              onChange={(e) => handleScoreChange(qIdx, 'marks_obtained', Number(e.target.value))}
                              required
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                            />
                            <span className="text-xs text-slate-400">/{qs.max_marks}</span>
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              placeholder="Faculty observation / mistake made"
                              value={qs.faculty_comment}
                              onChange={(e) => handleScoreChange(qIdx, 'faculty_comment', e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFacultyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || marksForm.question_scores.length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? 'Computing Study Order...' : 'Submit & Compute Study Order'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
