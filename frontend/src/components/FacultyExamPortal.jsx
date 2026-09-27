import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Search, Users, Award, ExternalLink, Calendar, ChevronRight, 
  HelpCircle, Sparkles, BookOpen, Layers, Check, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function FacultyExamPortal({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('record-marks'); // 'record-marks', 'upload-exam', 'exam-list'
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exam Creation Form State
  const [examForm, setExamForm] = useState({
    subject_id: '',
    title: '',
    exam_type: 'Mid-Term Examination',
    total_marks: 50,
    exam_date: new Date().toISOString().split('T')[0],
    question_paper_pdf: '',
    answer_key_pdf: '',
    questions: [
      { q_no: 'Q1', max_marks: 10, unit: 'Unit I', topic: 'Network Topologies', question_text: '' },
      { q_no: 'Q2', max_marks: 10, unit: 'Unit II', topic: 'Sliding Window Protocols', question_text: '' },
      { q_no: 'Q3', max_marks: 10, unit: 'Unit III', topic: 'Routing Algorithms', question_text: '' },
      { q_no: 'Q4', max_marks: 10, unit: 'Unit IV', topic: 'Transport Layer & Congestion Control', question_text: '' },
      { q_no: 'Q5', max_marks: 10, unit: 'Unit V', topic: 'Application Layer Protocols', question_text: '' },
    ]
  });

  const [qpFile, setQpFile] = useState(null);
  const [akFile, setAkFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Student Marks Form State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [studentQuestionScores, setStudentQuestionScores] = useState([]);
  const [evaluatedStudyOrder, setEvaluatedStudyOrder] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subjData, examData, studentData] = await Promise.all([
        api.getSubjects(),
        api.getExams(),
        api.getStudents().catch(() => [])
      ]);

      setSubjects(subjData || []);
      setExams(examData || []);
      setStudents(studentData || []);

      if (subjData?.length > 0 && !examForm.subject_id) {
        setExamForm(prev => ({ ...prev, subject_id: subjData[0].id }));
      }

      if (examData?.length > 0) {
        const firstExam = examData[0];
        setSelectedExamId(firstExam.id);
        initializeQuestionScoresForExam(firstExam);
      }

      if (studentData?.length > 0) {
        setSelectedStudentEmail(studentData[0].email);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
      setErrorMsg('Failed to load subjects or exams.');
    } finally {
      setLoading(false);
    }
  };

  const initializeQuestionScoresForExam = (examObj) => {
    if (!examObj || !examObj.questions_data) {
      setStudentQuestionScores([]);
      return;
    }
    const initialized = examObj.questions_data.map(q => ({
      q_no: q.q_no,
      max_marks: q.max_marks || 10,
      marks_obtained: '',
      unit: q.unit || 'Unit I',
      topic: q.topic || 'General Topic',
      faculty_notes: ''
    }));
    setStudentQuestionScores(initialized);
  };

  const handleExamChange = (examId) => {
    setSelectedExamId(examId);
    setEvaluatedStudyOrder(null);
    const found = exams.find(e => String(e.id) === String(examId));
    if (found) {
      initializeQuestionScoresForExam(found);
    }
  };

  // Upload PDF files to server storage
  const handleUploadFile = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    setErrorMsg('');
    try {
      const res = await api.uploadFile(file, 'resource');
      if (target === 'qp') {
        setQpFile(file);
        setExamForm(prev => ({ ...prev, question_paper_pdf: res.file_url }));
      } else {
        setAkFile(file);
        setExamForm(prev => ({ ...prev, answer_key_pdf: res.file_url }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setErrorMsg(`Failed to upload ${file.name}: ${err.message}`);
    } finally {
      setFileUploading(false);
    }
  };

  // Exam Question Builder helpers
  const handleAddQuestionRow = () => {
    setExamForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          q_no: `Q${prev.questions.length + 1}`,
          max_marks: 10,
          unit: 'Unit I',
          topic: '',
          question_text: ''
        }
      ]
    }));
  };

  const handleRemoveQuestionRow = (index) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setExamForm(prev => {
      const nextQ = [...prev.questions];
      nextQ[index] = { ...nextQ[index], [field]: value };
      return { ...prev, questions: nextQ };
    });
  };

  const totalAllocatedMarks = examForm.questions.reduce(
    (sum, q) => sum + (parseFloat(q.max_marks) || 0),
    0
  );

  // Submit New Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!examForm.subject_id) {
      setErrorMsg('Please select a subject.');
      return;
    }
    if (!examForm.title.trim()) {
      setErrorMsg('Please enter an exam title.');
      return;
    }
    if (examForm.questions.length === 0) {
      setErrorMsg('Please add at least one question.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject_id: parseInt(examForm.subject_id),
        title: examForm.title.trim(),
        exam_type: examForm.exam_type,
        total_marks: parseFloat(examForm.total_marks) || totalAllocatedMarks,
        exam_date: examForm.exam_date,
        question_paper_pdf: examForm.question_paper_pdf,
        answer_key_pdf: examForm.answer_key_pdf,
        questions_data: examForm.questions
      };

      const created = await api.createExam(payload);
      setSuccessMsg(`Exam "${created.title}" successfully created with ${created.questions_data?.length || 0} questions!`);
      
      // Refresh exam list and switch to recording marks
      const updatedExams = await api.getExams();
      setExams(updatedExams);
      setSelectedExamId(created.id);
      initializeQuestionScoresForExam(created);
      setActiveSubTab('record-marks');

      // Reset form
      setExamForm(prev => ({
        ...prev,
        title: '',
        question_paper_pdf: '',
        answer_key_pdf: ''
      }));
      setQpFile(null);
      setAkFile(null);
    } catch (err) {
      console.error('Failed to create exam:', err);
      setErrorMsg(err.message || 'Failed to create exam.');
    } finally {
      setSubmitting(false);
    }
  };

  // Student Marks Score entry helpers
  const handleStudentScoreChange = (index, field, value) => {
    setStudentQuestionScores(prev => {
      const nextScores = [...prev];
      nextScores[index] = { ...nextScores[index], [field]: value };
      return nextScores;
    });
  };

  const totalObtainedMarks = studentQuestionScores.reduce(
    (sum, q) => sum + (parseFloat(q.marks_obtained) || 0),
    0
  );

  const currentSelectedExam = exams.find(e => String(e.id) === String(selectedExamId));
  const examTotalMaxMarks = currentSelectedExam?.total_marks || 
    studentQuestionScores.reduce((sum, q) => sum + (parseFloat(q.max_marks) || 0), 0);

  // Submit Student Marks
  const handleSubmitStudentMarks = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setEvaluatedStudyOrder(null);

    if (!selectedExamId) {
      setErrorMsg('Please select an exam.');
      return;
    }
    if (!selectedStudentEmail) {
      setErrorMsg('Please select or specify a student email.');
      return;
    }

    // Validate marks
    for (const q of studentQuestionScores) {
      const val = parseFloat(q.marks_obtained);
      if (isNaN(val) || val < 0) {
        setErrorMsg(`Please enter valid marks for question ${q.q_no}.`);
        return;
      }
      if (val > parseFloat(q.max_marks)) {
        setErrorMsg(`Marks obtained for ${q.q_no} (${val}) cannot exceed maximum marks (${q.max_marks}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        student_email: selectedStudentEmail.trim().toLowerCase(),
        question_scores: studentQuestionScores.map(q => ({
          q_no: q.q_no,
          max_marks: parseFloat(q.max_marks),
          marks_obtained: parseFloat(q.marks_obtained),
          unit: q.unit,
          topic: q.topic,
          faculty_notes: q.faculty_notes || ''
        }))
      };

      const result = await api.uploadExamScores(selectedExamId, payload);
      setSuccessMsg(`Marks successfully saved for ${selectedStudentEmail}! (${result.total_marks_obtained}/${examTotalMaxMarks} marks)`);

      // Fetch the newly calculated study order for this student
      const studyOrderRes = await api.getStudyOrder(null, null, selectedStudentEmail);
      if (studyOrderRes?.study_order) {
        setEvaluatedStudyOrder(studyOrderRes.study_order);
      }
    } catch (err) {
      console.error('Failed to upload marks:', err);
      setErrorMsg(err.message || 'Failed to save student marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectStudentOrder = async (studentEmail) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getStudyOrder(null, null, studentEmail);
      if (res?.study_order) {
        setEvaluatedStudyOrder(res.study_order);
        setSelectedStudentEmail(studentEmail);
        setActiveSubTab('record-marks');
      }
    } catch (err) {
      setErrorMsg(`Could not load study order for ${studentEmail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-7 sm:p-9 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>Faculty Evaluation Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Exam Papers & Question-Wise Marks
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Upload question paper PDFs, define question topics from the syllabus, and record question-by-question student marks. 
            The AI engine automatically analyzes score deficits to generate each student's <span className="text-emerald-300 font-bold">Personalised Study Order</span>.
          </p>

          {/* Quick Sub-Navigation Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveSubTab('record-marks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'record-marks'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Record Student Marks</span>
            </button>

            <button
              onClick={() => setActiveSubTab('upload-exam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'upload-exam'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload New Exam & PDF</span>
            </button>

            <button
              onClick={() => setActiveSubTab('exam-list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'exam-list'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>All Exams & Evaluations ({exams.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Global Status Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-semibold">{successMsg}</div>
          <button 
            onClick={() => setSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-semibold">{errorMsg}</div>
          <button 
            onClick={() => setErrorMsg('')}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: RECORD STUDENT MARKS                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'record-marks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>Enter Question-by-Question Marks</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the exam and student to input marks obtained on each question.
                </p>
              </div>

              {currentSelectedExam?.question_paper_pdf && (
                <a
                  href={currentSelectedExam.question_paper_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Exam Paper PDF</span>
                </a>
              )}
            </div>

            {/* Exam and Student Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Exam */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Exam</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {exams.length === 0 ? (
                    <option value="">No exams uploaded yet</option>
                  ) : (
                    exams.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject?.code} - {ex.title} ({ex.total_marks} Marks)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Select Student */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Student</label>
                {students.length > 0 ? (
                  <select
                    value={selectedStudentEmail}
                    onChange={(e) => setSelectedStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {students.map(st => (
                      <option key={st.id} value={st.email}>
                        {st.name || st.email} — Roll: {st.roll_number || 'N/A'} ({st.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="email"
                    placeholder="Enter student email (e.g. student@gmail.com)"
                    value={selectedStudentEmail}
                    onChange={(e) => setSelectedStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>

            {/* Questions Grading Table */}
            {studentQuestionScores.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Please upload an exam first or select an exam with questions.
              </div>
            ) : (
              <form onSubmit={handleSubmitStudentMarks} className="space-y-5">
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Q#</th>
                        <th className="px-4 py-3">Syllabus Topic & Unit</th>
                        <th className="px-4 py-3">Max Marks</th>
                        <th className="px-4 py-3">Marks Obtained</th>
                        <th className="px-4 py-3">Faculty Notes / Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentQuestionScores.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {q.q_no}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{q.topic}</div>
                            <div className="text-[11px] text-slate-400">{q.unit}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-600">
                            {q.max_marks} marks
                          </td>
                          <td className="px-4 py-3 w-32">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={q.max_marks}
                              placeholder="0.0"
                              required
                              value={q.marks_obtained}
                              onChange={(e) => handleStudentScoreChange(idx, 'marks_obtained', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-center text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="e.g. Needs more clarity on protocol timeouts"
                              value={q.faculty_notes}
                              onChange={(e) => handleStudentScoreChange(idx, 'faculty_notes', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Score Summary & Submit */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-emerald-900">Total Score:</div>
                    <div className="text-lg font-black text-emerald-800">
                      {totalObtainedMarks} <span className="text-xs font-medium text-emerald-600">/ {examTotalMaxMarks} Marks</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {examTotalMaxMarks > 0 ? ((totalObtainedMarks / examTotalMaxMarks) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Computing Study Order...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Save Student Marks & Generate Study Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Real-time Generated Study Order Preview */}
          {evaluatedStudyOrder && (
            <div className="p-6 rounded-3xl bg-linear-to-b from-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-tight">
                    Engine Generated Study Order for {selectedStudentEmail}
                  </h3>
                </div>
                <span className="text-xs text-indigo-300 font-semibold">
                  {evaluatedStudyOrder.ranked_topics?.length || 0} Topics Ranked (Worst to Best)
                </span>
              </div>

              {/* Strategy text */}
              {evaluatedStudyOrder.quick_strategy && (
                <p className="text-xs text-indigo-200 bg-white/10 p-3 rounded-xl border border-white/10 leading-relaxed">
                  💡 <span className="font-bold">Student Study Strategy:</span> {evaluatedStudyOrder.quick_strategy}
                </p>
              )}

              {/* Topic cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {evaluatedStudyOrder.ranked_topics?.slice(0, 4).map((t, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        t.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'
                      }`}>
                        Rank #{t.rank} • {t.priority}
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        {t.recovery_potential}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white">{t.topic}</div>
                    <div className="text-[11px] text-slate-300 leading-snug">{t.reasoning}</div>
                    
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/10">
                      <span>Score: {t.marks_obtained}/{t.max_marks} ({t.percentage}%)</span>
                      <span>Est: {t.estimated_minutes} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: UPLOAD NEW EXAM & QUESTION PAPER                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'upload-exam' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              <span>Create New Exam & Upload Question Paper</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload the exam question paper PDF and map questions to syllabus units and topics.
            </p>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-6">
            {/* Row 1: Subject, Title, Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject *</label>
                <select
                  value={examForm.subject_id}
                  onChange={(e) => setExamForm(prev => ({ ...prev, subject_id: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Exam Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Examination 2024"
                  value={examForm.title}
                  onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Exam Type</label>
                <select
                  value={examForm.exam_type}
                  onChange={(e) => setExamForm(prev => ({ ...prev, exam_type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Mid-Term Examination">Mid-Term Examination</option>
                  <option value="Internal Assessment">Internal Assessment / Sessional</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="End-Semester Examination">End-Semester University Exam</option>
                  <option value="Practical Viva">Practical Exam & Viva</option>
                </select>
              </div>
            </div>

            {/* Row 2: Total Marks, Exam Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Total Marks</label>
                <input
                  type="number"
                  min="1"
                  value={examForm.total_marks}
                  onChange={(e) => setExamForm(prev => ({ ...prev, total_marks: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Exam Date</label>
                <input
                  type="date"
                  value={examForm.exam_date}
                  onChange={(e) => setExamForm(prev => ({ ...prev, exam_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* File Uploads: Question Paper PDF & Answer Key PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Question Paper PDF */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Question Paper (PDF)</span>
                  {fileUploading && <span className="text-[10px] text-emerald-600 animate-pulse font-semibold">Uploading...</span>}
                </label>
                
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleUploadFile(e, 'qp')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />

                {examForm.question_paper_pdf && (
                  <div className="text-[11px] text-emerald-700 font-semibold truncate flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Attached: {qpFile?.name || examForm.question_paper_pdf}</span>
                  </div>
                )}
              </div>

              {/* Answer Key PDF */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Answer Key / Solutions (PDF - Optional)</span>
                </label>
                
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleUploadFile(e, 'ak')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                />

                {examForm.answer_key_pdf && (
                  <div className="text-[11px] text-emerald-700 font-semibold truncate flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Attached: {akFile?.name || examForm.answer_key_pdf}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Breakdown Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Question-by-Question Breakdown</h3>
                  <p className="text-[11px] text-slate-500">
                    Map each question to its syllabus topic and maximum marks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    totalAllocatedMarks === parseFloat(examForm.total_marks)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {totalAllocatedMarks} / {examForm.total_marks} Marks Allocated
                  </span>

                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {/* Question Rows */}
              <div className="space-y-2">
                {examForm.questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="w-16">
                      <input
                        type="text"
                        value={q.q_no}
                        onChange={(e) => handleQuestionFieldChange(idx, 'q_no', e.target.value)}
                        placeholder="Q1"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs text-center"
                      />
                    </div>

                    <div className="w-32">
                      <select
                        value={q.unit}
                        onChange={(e) => handleQuestionFieldChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                      >
                        <option value="Unit I">Unit I</option>
                        <option value="Unit II">Unit II</option>
                        <option value="Unit III">Unit III</option>
                        <option value="Unit IV">Unit IV</option>
                        <option value="Unit V">Unit V</option>
                      </select>
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={q.topic}
                        onChange={(e) => handleQuestionFieldChange(idx, 'topic', e.target.value)}
                        placeholder="Syllabus Topic (e.g. Sliding Window Protocols)"
                        required
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={q.max_marks}
                        onChange={(e) => handleQuestionFieldChange(idx, 'max_marks', e.target.value)}
                        placeholder="Marks"
                        required
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionRow(idx)}
                      disabled={examForm.questions.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Exam Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Publishing Exam...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Create Exam & Go To Mark Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALL EXAMS & EVALUATED RECORDS                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam-list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Uploaded University & Sessional Exams
            </h2>
            <button
              onClick={() => setActiveSubTab('upload-exam')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Exam</span>
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-sm text-slate-700">No exams uploaded yet</div>
              <p className="text-xs text-slate-400 mt-1">Upload your first exam paper above to start tracking student scores.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(ex => (
                <div key={ex.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      {ex.subject?.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ex.exam_type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ex.title}</h3>
                    <p className="text-xs text-slate-500">{ex.subject?.name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Total Marks: <strong className="text-slate-800">{ex.total_marks}</strong></span>
                    <span>Questions: <strong className="text-slate-800">{ex.questions_data?.length || 0}</strong></span>
                    <span>Date: <strong className="text-slate-800">{ex.exam_date}</strong></span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {ex.question_paper_pdf && (
                        <a
                          href={ex.question_paper_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Question Paper</span>
                        </a>
                      )}
                      {ex.answer_key_pdf && (
                        <a
                          href={ex.answer_key_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Answer Key</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        initializeQuestionScoresForExam(ex);
                        setActiveSubTab('record-marks');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Grade / Enter Marks</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
