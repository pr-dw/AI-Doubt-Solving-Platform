import React, { useState, useEffect } from 'react';
import { 
  Sparkles, FileText, Download, CheckCircle2, Clock, 
  BookOpen, Printer, RefreshCw, Play, 
  Award, Sliders, ArrowRight, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api, { getStoredAIModel } from '../services/api';
import { generateMockExamPDF } from '../utils/pdfGenerator';

export default function MockExamCenter({ user, onRequireAuth, onNavigateToPersonalLibrary }) {
  const [blueprints, setBlueprints] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedMockType, setSelectedMockType] = useState('quiz_30');
  const [selectedFocusUnit, setSelectedFocusUnit] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Standard');
  const [customInstructions, setCustomInstructions] = useState('');

  // Generation & Active Exam State
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [activeExam, setActiveExam] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('paper'); // 'paper', 'solutions', 'interactive'

  // Interactive MCQ State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [savedToLibrarySuccess, setSavedToLibrarySuccess] = useState(false);

  useEffect(() => {
    loadBlueprints();
  }, []);

  const loadBlueprints = async () => {
    try {
      const data = await api.getMockExamBlueprints();
      if (Array.isArray(data) && data.length > 0) {
        setBlueprints(data);
        setSelectedSubjectId(data[0].subject_id);
      }
    } catch (err) {
      console.error('Failed to load blueprints:', err);
    }
  };

  const currentBlueprint = blueprints.find((b) => b.subject_id === Number(selectedSubjectId)) || blueprints[0];

  const handleGenerate = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setGenerating(true);
    setGenerationStep('Analyzing database exam question formats & mark distribution...');
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setSavedToLibrarySuccess(false);

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Cloning university blueprint and synthesizing syllabus questions...');
      }, 1000);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Constructing model solutions and step-by-step marking scheme...');
      }, 2200);

      const selectedModel = getStoredAIModel();
      const payload = {
        subject_id: selectedSubjectId,
        mock_type: selectedMockType,
        focus_unit: selectedFocusUnit,
        difficulty: selectedDifficulty,
        custom_instructions: customInstructions,
        model: selectedModel,
        save_to_db: true,
      };

      const result = await api.generateMockExam(payload);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setActiveExam(result);
      setSavedToLibrarySuccess(true);
      if (selectedMockType === 'mcq_quiz') {
        setActiveViewMode('interactive');
      } else {
        setActiveViewMode('paper');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      alert('Could not generate mock exam. Please try again.');
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownloadPDF = (includeSolutions = false) => {
    if (!activeExam) return;
    setPdfGenerating(true);
    try {
      const pdf = generateMockExamPDF({
        examData: activeExam,
        includeSolutions,
        studentName: user?.name || user?.email?.split('@')[0] || 'Student',
      });
      pdf.download();
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSelectMCQ = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx,
    });
  };

  const handleSubmitInteractiveQuiz = () => {
    if (!activeExam) return;
    const questions = activeExam.questions_data || [];
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        score += q.max_marks || 2;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= (activeExam.total_marks || 20) * 0.7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Configuration Panel */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              AI Mock Exam & Paper Generator
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Matches question format of exam papers in database
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Subject Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Academic Subject
            </label>
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {blueprints.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  [{sub.subject_code}] {sub.subject_name} (Sem {sub.semester})
                </option>
              ))}
            </select>
            {currentBlueprint && (
              <div className="mt-2 flex flex-wrap gap-1">
                {currentBlueprint.database_exam_formats?.map((fmt) => (
                  <span
                    key={fmt.id}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                    title={`${fmt.total_marks} Marks (${fmt.question_count} questions in DB)`}
                  >
                    ✓ {fmt.title} ({fmt.total_marks}M)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Format Blueprint Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Exam Format Blueprint
            </label>
            <select
              value={selectedMockType}
              onChange={(e) => setSelectedMockType(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="quiz_30">
                Collegiate Quiz (30 Marks: Part A 2x5m, Part B Q3 6x1m, Q4 7m, Q5 7m)
              </option>
              <option value="pre_end_100">
                Pre-End Semester Exam (100 Marks: Q1 10x4m compulsory + Units I-V choices)
              </option>
              <option value="mcq_quiz">
                Speed MCQ Mock Quiz (20 Marks: 10 High-Yield Questions)
              </option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {selectedMockType === 'quiz_30' && 'Full 30-mark midterm structure (10 questions total).'}
              {selectedMockType === 'pre_end_100' && 'Comprehensive 3-hour university end-semester simulation (20 questions).'}
              {selectedMockType === 'mcq_quiz' && 'Interactive instant test with 4 options and detailed solutions.'}
            </p>
          </div>

          {/* 3. Focus Unit & Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Syllabus Focus / Unit
            </label>
            <select
              value={selectedFocusUnit}
              onChange={(e) => setSelectedFocusUnit(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Comprehensive (All Units I - V)</option>
              {currentBlueprint?.units?.map((u) => (
                <option key={u} value={u}>
                  Focus on {u}
                </option>
              ))}
            </select>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500">Difficulty:</span>
              <div className="flex gap-1">
                {['Easy', 'Standard', 'Challenging'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${
                      selectedDifficulty === lvl
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Instruction Box & Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <input
            type="text"
            placeholder="Optional focus instructions (e.g. 'Emphasize sliding window protocols and delay analysis')..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="w-full sm:flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-75 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Synthesizing Full Paper...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-indigo-200" />
                <span>Generate Mock Exam Paper</span>
              </>
            )}
          </button>
        </div>

        {/* Live Generation Progress Indicator */}
        {generating && (
          <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center gap-3 animate-pulse">
            <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
            <span className="text-xs font-semibold text-indigo-900">{generationStep}</span>
          </div>
        )}
      </div>

      {/* Auto-Saved to Personal Library Banner */}
      {savedToLibrarySuccess && activeExam && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">
                Paper Created & Saved Directly to Your Personal Library!
              </p>
              <p className="text-emerald-700 text-[11px]">
                This complete mock exam and its solution guide are stored under your personal notes in Resource Library.
              </p>
            </div>
          </div>
          {onNavigateToPersonalLibrary && (
            <button
              type="button"
              onClick={onNavigateToPersonalLibrary}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <span>View in Personal Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Active Generated Mock Paper Viewer */}
      {activeExam && (
        <div className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Paper Action Bar */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {activeExam.subject_code} • {activeExam.total_marks} Marks
                </span>
                <span className="text-xs text-slate-400">
                  {activeExam.time_allowed_minutes} Minutes Allowed • {activeExam.questions_data?.length || 0} Questions
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {activeExam.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Switcher */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('paper')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeViewMode === 'paper' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Question Paper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('solutions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeViewMode === 'solutions' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Solutions & Marking</span>
                </button>
                {activeExam.mock_type === 'mcq_quiz' && (
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('interactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeViewMode === 'interactive' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Interactive Test</span>
                  </button>
                )}
              </div>

              {/* PDF Download Options */}
              <button
                type="button"
                onClick={() => handleDownloadPDF(false)}
                disabled={pdfGenerating}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download clean Question Paper PDF"
              >
                <Download className="h-3.5 w-3.5 text-indigo-300" />
                <span>Question Paper PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF(true)}
                disabled={pdfGenerating}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download PDF with step-by-step solutions and marking scheme"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-200" />
                <span>Solutions PDF</span>
              </button>
            </div>
          </div>

          {/* Examination Metadata Bar */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-800">Instructions: </span>
              <span className="italic">
                {(activeExam.instructions || []).join(' • ') || 'Answer all questions according to section guidelines.'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeExam.time_allowed_minutes} mins</span>
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                <span>{activeExam.total_marks} Marks</span>
              </span>
            </div>
          </div>

          {/* View 1: Standard Question Paper */}
          {activeViewMode === 'paper' && (
            <div className="p-5 sm:p-8 space-y-8 max-w-4xl mx-auto">
              {(activeExam.sections || []).map((sec, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <div className="border-b-2 border-slate-800 pb-1.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                        {sec.name || `Section ${sIdx + 1}`}
                      </h4>
                      {sec.description && (
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          {sec.description}
                        </p>
                      )}
                    </div>
                    {sec.marks && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        [{sec.marks} Marks]
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {(sec.questions || []).map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                              {q.q_no || `Q${qIdx + 1}`}
                            </span>
                            {(q.unit || q.topic) && (
                              <span className="text-[11px] text-slate-400">
                                {q.unit} {q.topic && `• ${q.topic}`}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-600 shrink-0">
                            [{q.max_marks || 1} Marks]
                          </span>
                        </div>

                        <p className="text-sm font-medium text-slate-800 leading-relaxed pl-1">
                          {q.text}
                        </p>

                        {/* Multiple Choice Options if MCQ */}
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                              >
                                <span className="font-bold text-slate-400">
                                  ({String.fromCharCode(65 + optIdx)})
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View 2: Solutions & Marking Scheme */}
          {activeViewMode === 'solutions' && (
            <div className="p-5 sm:p-8 space-y-8 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Collegiate Model Answers & Evaluation Scheme</p>
                  <p className="text-emerald-700">
                    Use this guide to self-evaluate answers, understand point allocation, and revise key theoretical proofs.
                  </p>
                </div>
              </div>

              {(activeExam.sections || []).map((sec, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-1">
                    {sec.name}
                  </h4>

                  <div className="space-y-6">
                    {(sec.questions || []).map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                              {q.q_no || `Q${qIdx + 1}`}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {q.unit} • {q.topic}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-indigo-600">
                            [{q.max_marks || 1} Marks]
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-800">
                          {q.text}
                        </p>

                        {/* Solution Box */}
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Model Academic Solution:</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-1">
                            {q.model_answer || q.explanation || 'Refer to standard unit materials.'}
                          </p>

                          {/* Marking Scheme Breakup */}
                          {Array.isArray(q.marking_scheme) && q.marking_scheme.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-emerald-200/60">
                              <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                                Marking Distribution Breakdown:
                              </span>
                              <ul className="space-y-1">
                                {q.marking_scheme.map((pt, pIdx) => {
                                  const text = typeof pt === 'string' ? pt : `${pt.point || pt.criterion} [${pt.marks} M]`;
                                  return (
                                    <li key={pIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span>{text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View 3: Interactive MCQ Test Mode */}
          {activeViewMode === 'interactive' && (
            <div className="p-5 sm:p-8 space-y-6 max-w-3xl mx-auto">
              {quizSubmitted && (
                <div className="p-5 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">
                      Quiz Assessment Complete
                    </span>
                    <h4 className="text-2xl font-black">
                      Score: {quizScore} / {activeExam.total_marks || 20} Marks
                    </h4>
                    <p className="text-xs text-indigo-100">
                      {quizScore >= (activeExam.total_marks || 20) * 0.7
                        ? 'Excellent performance! You have strong conceptual grasp on this subject.'
                        : 'Good practice! Review the explanations below to reinforce weaker topics.'}
                    </p>
                  </div>
                  <Award className="h-14 w-14 text-yellow-300 opacity-90" />
                </div>
              )}

              <div className="space-y-5">
                {(activeExam.questions_data || []).map((q, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const selectedOpt = selectedAnswers[idx];
                  const isCorrect = selectedOpt === q.correct_index;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                          Question {idx + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {q.topic || q.unit}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        {q.text}
                      </p>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {(q.options || []).map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          let btnStyle = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200';

                          if (quizSubmitted) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold ring-1 ring-emerald-400';
                            } else if (isThisSelected && !isCorrect) {
                              btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-semibold';
                            } else {
                              btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                            }
                          } else if (isThisSelected) {
                            btnStyle = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold ring-1 ring-indigo-400';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectMCQ(idx, optIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 text-[10px] font-bold shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {quizSubmitted && optIdx === q.correct_index && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation after submission */}
                      {quizSubmitted && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-100/90 text-xs text-slate-700 space-y-1">
                          <span className="font-bold text-slate-900">Explanation:</span>
                          <p className="leading-relaxed">
                            {q.explanation || q.model_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitInteractiveQuiz}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit Mock Quiz Answers</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
