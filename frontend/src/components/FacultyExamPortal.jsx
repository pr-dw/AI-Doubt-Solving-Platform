import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Upload, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Award, ExternalLink, ChevronRight, Sparkles, Layers, Check, 
  RefreshCw, Sliders, ArrowRight, Save, Edit3, Clock, Users, X
} from 'lucide-react';
import { api, getStoredAIModel, AI_MODELS } from '../services/api';

const OFFICIAL_EXAM_TYPES = [
  { id: 'Quiz 1', label: 'Quiz 1', defaultMarks: 30, hasSets: true },
  { id: 'Quiz 2', label: 'Quiz 2', defaultMarks: 30, hasSets: true },
  { id: 'Quiz 3', label: 'Quiz 3', defaultMarks: 30, hasSets: true },
  { id: 'Pre-End Semester Examination', label: 'Pre-End Semester Examination', defaultMarks: 100, hasSets: false },
];

const QUESTION_PAPER_SETS = ['Set A', 'Set B', 'Set C', 'Set D', 'Set E'];

export default function FacultyExamPortal({ user, activeSubTab: externalSubTab, onNavigateTab }) {
  const [activeSubTab, setActiveSubTab] = useState(externalSubTab || 'upload-paper');

  useEffect(() => {
    if (externalSubTab && externalSubTab !== activeSubTab) {
      setActiveSubTab(externalSubTab);
    }
  }, [externalSubTab]);

  const switchTab = (tab) => {
    setActiveSubTab(tab);
    setSuccessMsg('');
    setErrorMsg('');
    setExamSavedSuccess(null);
    if (onNavigateTab) {
      if (tab === 'upload-paper') onNavigateTab('faculty-upload');
      else if (tab === 'record-marks') onNavigateTab('faculty-score');
      else if (tab === 'exam-list') onNavigateTab('faculty-exams');
    }
  };
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exam Creation / Upload State
  const [examForm, setExamForm] = useState({
    subject_id: '',
    title: 'Quiz 1',
    exam_type: 'Quiz 1',
    paper_set: 'Set A',
    total_marks: 30,
    exam_date: new Date().toISOString().split('T')[0],
    question_paper_pdf: '',
    answer_key_pdf: '',
    questions: []
  });

  const [qpFile, setQpFile] = useState(null);
  const [akFile, setAkFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [examSavedSuccess, setExamSavedSuccess] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);

  // Student Marks Form State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [studentQuestionScores, setStudentQuestionScores] = useState([]);
  const [evaluatedStudyOrder, setEvaluatedStudyOrder] = useState(null);
  const [examStudentScores, setExamStudentScores] = useState([]);

  // For Pre-End Choice Questions Tracking: { 'Unit I': 'Unit I - Q2', 'Unit II': 'Unit II - Q4', ... }
  const [unitChoices, setUnitChoices] = useState({
    'Unit I': 'Unit I - Q2',
    'Unit II': 'Unit II - Q4',
    'Unit III': 'Unit III - Q6',
    'Unit IV': 'Unit IV - Q8',
    'Unit V': 'Unit V - Q10',
  });

  const [activeAIModel, setActiveAIModel] = useState(() => getStoredAIModel());

  useEffect(() => {
    const handleModelSync = (e) => {
      if (e.detail) {
        setActiveAIModel(e.detail);
      }
    };
    window.addEventListener('ai-model-change', handleModelSync);
    return () => window.removeEventListener('ai-model-change', handleModelSync);
  }, []);

  // Reset all scoring, selection, and alert states whenever logged-in user changes or mounts
  useEffect(() => {
    setSuccessMsg('');
    setErrorMsg('');
    setExamSavedSuccess(null);
    setEvaluatedStudyOrder(null);
    setStudentQuestionScores([]);
    setExamStudentScores([]);
    setSelectedExamId('');
    setSelectedStudentEmail('');
    setEditingExamId(null);
    setQpFile(null);
    setAkFile(null);
    loadInitialData();
  }, [user?.id, user?.email]);

  const loadInitialData = async () => {
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

      const firstEmail = studentData?.[0]?.email || '';
      if (firstEmail) {
        setSelectedStudentEmail(firstEmail);
      }

      if (examData?.length > 0) {
        const firstExam = examData[0];
        setSelectedExamId(firstExam.id);
        loadExamDetailsAndScores(firstExam.id, firstEmail, examData);
      } else {
        setSelectedExamId('');
        setStudentQuestionScores([]);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
      setErrorMsg('Failed to load subjects or exams.');
    }
  };

  const loadExamDetailsAndScores = async (examId, studentEmail, currentExamsList = exams) => {
    if (!examId) {
      setExamStudentScores([]);
      return;
    }
    try {
      const detail = await api.getExamDetail(examId);
      const scores = detail.student_scores || [];
      setExamStudentScores(scores);

      const targetEmail = studentEmail || selectedStudentEmail;
      const foundExam = detail || (currentExamsList || []).find(e => String(e.id) === String(examId));
      if (foundExam) {
        populateScoresForStudent(foundExam, scores, targetEmail);
      }
    } catch (err) {
      console.error('Error fetching exam detail and scores:', err);
    }
  };

  const populateScoresForStudent = (examObj, scores, studentEmail) => {
    if (!examObj || !examObj.questions_data) {
      setStudentQuestionScores([]);
      return;
    }
    const emailNorm = (studentEmail || '').trim().toLowerCase();
    const existing = (scores || []).find(s => 
      (s.student_email || '').toLowerCase() === emailNorm ||
      (s.student?.email || '').toLowerCase() === emailNorm
    );

    if (existing && existing.question_scores?.length > 0) {
      const populated = examObj.questions_data.map(q => {
        const foundScore = existing.question_scores.find(sq => sq.q_no === q.q_no || sq.q_number === q.q_no);
        return {
          q_no: q.q_no,
          max_marks: q.max_marks || 5,
          marks_obtained: foundScore && foundScore.marks_obtained !== undefined ? foundScore.marks_obtained : '',
          unit: q.unit || 'Unit I',
          topic: q.topic || 'General Topic',
          question_text: q.question_text || '',
          is_choice: !!q.is_choice,
          choice_group: q.choice_group || null,
          faculty_notes: foundScore?.faculty_notes || ''
        };
      });
      setStudentQuestionScores(populated);
      if (existing.ranked_study_order) {
        setEvaluatedStudyOrder(existing.ranked_study_order);
      }
    } else {
      initializeQuestionScoresForExam(examObj);
      setEvaluatedStudyOrder(null);
    }
  };

  const initializeQuestionScoresForExam = (examObj) => {
    if (!examObj || !examObj.questions_data) {
      setStudentQuestionScores([]);
      return;
    }
    const initialized = examObj.questions_data.map(q => ({
      q_no: q.q_no,
      max_marks: q.max_marks || 5,
      marks_obtained: '',
      unit: q.unit || 'Unit I',
      topic: q.topic || 'General Topic',
      question_text: q.question_text || '',
      is_choice: !!q.is_choice,
      choice_group: q.choice_group || null,
      faculty_notes: ''
    }));
    setStudentQuestionScores(initialized);
  };

  const handleExamChange = (examId) => {
    setSelectedExamId(examId);
    setSuccessMsg('');
    setErrorMsg('');
    setExamSavedSuccess(null);
    setEvaluatedStudyOrder(null);
    loadExamDetailsAndScores(examId, selectedStudentEmail);
  };

  const handleStudentEmailChange = (newEmail) => {
    setSelectedStudentEmail(newEmail);
    setSuccessMsg('');
    setErrorMsg('');
    setEvaluatedStudyOrder(null);
    const currExam = exams.find(e => String(e.id) === String(selectedExamId));
    if (currExam) {
      populateScoresForStudent(currExam, examStudentScores, newEmail);
    }
  };

  const handleExamTypeChange = (typeId) => {
    const matched = OFFICIAL_EXAM_TYPES.find(t => t.id === typeId);
    if (!matched) return;

    setExamForm(prev => ({
      ...prev,
      exam_type: matched.id,
      title: matched.label,
      total_marks: matched.defaultMarks,
      paper_set: matched.hasSets ? (prev.paper_set || 'Set A') : '',
      questions: prev.question_paper_pdf ? prev.questions : []
    }));
  };

  // Upload and analyze PDF with AI
  const handleUploadFile = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setExamSavedSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', examForm.subject_id || (subjects[0]?.id || ''));
      formData.append('exam_type', examForm.exam_type || 'Quiz 1');
      formData.append('paper_set', examForm.paper_set || '');
      formData.append('is_answer_key', target === 'ak' ? 'true' : 'false');
      formData.append('model', activeAIModel);

      const res = await api.analyzeExamPdf(formData);

      if (target === 'qp') {
        const analyzedQuestions = (res.questions && res.questions.length > 0) ? res.questions : [];
        setQpFile({ name: res.filename });
        setExamForm(prev => ({
          ...prev,
          question_paper_pdf: res.file_url,
          questions: analyzedQuestions
        }));

        setSuccessMsg(`✓ Question Paper renamed to "${res.filename}"! Topics and units auto-analyzed from official syllabus using ${res.model_used || activeAIModel} (${analyzedQuestions.length} questions).`);
      } else {
        setAkFile({ name: res.filename });
        setExamForm(prev => ({ ...prev, answer_key_pdf: res.file_url }));
        setSuccessMsg(`✓ Answer Key saved as "${res.filename}".`);
      }
    } catch (err) {
      console.error('File upload/analysis failed:', err);
      setErrorMsg(`Failed to analyze ${file.name}: ${err.message}`);
    } finally {
      setFileUploading(false);
    }
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setExamForm(prev => {
      const nextQ = [...prev.questions];
      nextQ[index] = { ...nextQ[index], [field]: value };
      return { ...prev, questions: nextQ };
    });
  };

  const handleAddQuestionRow = () => {
    setExamForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          q_no: `Q${prev.questions.length + 1}`,
          max_marks: 5,
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

  // STEP 1 FINALE: Save Exam Paper and Questions to Database (Create or Edit)
  const handleSaveExamPaper = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setExamSavedSuccess(null);

    if (!examForm.subject_id) {
      setErrorMsg('Please select a subject.');
      return;
    }

    if (examForm.questions.length === 0) {
      setErrorMsg('Please upload a Question Paper PDF to auto-analyze questions before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject_id: parseInt(examForm.subject_id),
        title: examForm.paper_set ? `${examForm.title} (${examForm.paper_set})` : examForm.title,
        exam_type: examForm.exam_type,
        paper_set: examForm.paper_set || '',
        total_marks: parseFloat(examForm.total_marks),
        exam_date: examForm.exam_date,
        question_paper_pdf: examForm.question_paper_pdf,
        answer_key_pdf: examForm.answer_key_pdf,
        questions_data: examForm.questions
      };

      let targetExam;
      if (editingExamId) {
        targetExam = await api.updateExam(editingExamId, payload);
        setSuccessMsg(`Exam paper "${targetExam.title}" blueprint successfully updated with ${targetExam.questions_data?.length || 0} questions!`);
        setEditingExamId(null);
      } else {
        targetExam = await api.createExam(payload);
        setSuccessMsg(`Exam paper "${targetExam.title}" successfully saved with ${targetExam.questions_data?.length || 0} questions to database!`);
      }

      const updatedExams = await api.getExams();
      setExams(updatedExams || []);
      setSelectedExamId(targetExam.id);
      loadExamDetailsAndScores(targetExam.id, selectedStudentEmail, updatedExams);

      setExamSavedSuccess({
        examId: targetExam.id,
        examTitle: targetExam.title,
        qCount: targetExam.questions_data?.length || 0,
        pdfUrl: targetExam.question_paper_pdf
      });

      // Reset form fields after successful save
      setEditingExamId(null);
      setQpFile(null);
      setAkFile(null);
      setExamForm(prev => ({
        ...prev,
        question_paper_pdf: '',
        answer_key_pdf: '',
        questions: []
      }));
    } catch (err) {
      console.error('Failed to save exam paper:', err);
      setErrorMsg(err.message || 'Failed to save exam paper.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadExistingForEdit = (ex) => {
    setEditingExamId(ex.id);
    setExamSavedSuccess(null);
    setExamForm({
      subject_id: ex.subject?.id || ex.subject_id || (subjects[0]?.id || ''),
      title: ex.title,
      exam_type: ex.exam_type,
      paper_set: ex.paper_set || '',
      total_marks: ex.total_marks,
      exam_date: ex.exam_date || new Date().toISOString().split('T')[0],
      question_paper_pdf: ex.question_paper_pdf || '',
      answer_key_pdf: ex.answer_key_pdf || '',
      questions: (ex.questions_data || []).map((q, idx) => ({
        id: idx + 1,
        q_no: q.q_no || `Q${idx + 1}`,
        unit: q.unit || 'Unit I',
        topic: q.topic || '',
        max_marks: q.max_marks || 5,
        question_text: q.question_text || '',
        is_choice: !!q.is_choice,
        choice_group: q.choice_group || null
      }))
    });
    setSuccessMsg(`Loaded "${ex.title} ${ex.paper_set ? `(${ex.paper_set})` : ''}" into editor for updating.`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExamId(null);
    handleResetUploadForm();
    setSuccessMsg('Exited exam edit mode.');
  };

  const handleResetUploadForm = () => {
    setExamSavedSuccess(null);
    setEditingExamId(null);
    setQpFile(null);
    setAkFile(null);
    setExamForm(prev => ({
      ...prev,
      paper_set: prev.exam_type.startsWith('Quiz') ? 'Set A' : '',
      question_paper_pdf: '',
      answer_key_pdf: '',
      questions: []
    }));
  };

  // Delete an uploaded exam from the database
  const handleDeleteExam = async (examId, examTitle) => {
    if (!window.confirm(`Are you sure you want to delete exam "${examTitle}"? All associated student marks will also be deleted.`)) {
      return;
    }
    try {
      await api.deleteExam(examId);
      setSuccessMsg(`Exam "${examTitle}" was deleted.`);
      const updated = await api.getExams();
      setExams(updated || []);
      if (String(selectedExamId) === String(examId)) {
        if (updated && updated.length > 0) {
          setSelectedExamId(updated[0].id);
          initializeQuestionScoresForExam(updated[0]);
        } else {
          setSelectedExamId('');
          setStudentQuestionScores([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete exam:', err);
      setErrorMsg(`Failed to delete exam: ${err.message}`);
    }
  };

  // Student marks input handler
  const handleStudentScoreChange = (index, field, value) => {
    setStudentQuestionScores(prev => {
      const nextScores = [...prev];
      nextScores[index] = { ...nextScores[index], [field]: value };
      return nextScores;
    });
  };

  const handleToggleUnitChoice = (unitGroup, chosenQNo) => {
    setUnitChoices(prev => ({ ...prev, [unitGroup]: chosenQNo }));
  };

  // Calculate live attempted total
  const currentSelectedExam = exams.find(e => String(e.id) === String(selectedExamId));
  const isPreEndSem = currentSelectedExam?.exam_type === 'Pre-End Semester Examination';

  const totalAttemptedMarks = studentQuestionScores.reduce((sum, q) => {
    if (isPreEndSem && q.is_choice && q.choice_group) {
      if (unitChoices[q.choice_group] !== q.q_no) {
        return sum;
      }
    }
    const val = parseFloat(q.marks_obtained);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalAttemptableMax = isPreEndSem ? 100 : (currentSelectedExam?.total_marks || 30);

  // Submit Student Marks
  const handleSubmitStudentMarks = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setEvaluatedStudyOrder(null);

    if (!selectedExamId) {
      setErrorMsg('Please select an exam first.');
      return;
    }

    if (!selectedStudentEmail) {
      setErrorMsg('Please select or enter a student email.');
      return;
    }

    if (studentQuestionScores.length === 0) {
      setErrorMsg('No questions found for this exam.');
      return;
    }

    setSubmitting(true);
    try {
      const preparedScores = studentQuestionScores.map(q => {
        const isOmitted = isPreEndSem && q.is_choice && q.choice_group && unitChoices[q.choice_group] !== q.q_no;
        const obtainedVal = isOmitted ? 0.0 : parseFloat(q.marks_obtained || 0.0);

        return {
          q_no: q.q_no,
          max_marks: parseFloat(q.max_marks || 0),
          marks_obtained: obtainedVal,
          unit: q.unit || 'Unit I',
          topic: q.topic || 'General Topic',
          attempted: !isOmitted,
          is_choice_omitted: isOmitted,
          faculty_notes: q.faculty_notes || ''
        };
      });

      const payload = {
        student_email: selectedStudentEmail.trim().toLowerCase(),
        question_scores: preparedScores
      };

      const result = await api.uploadExamScores(selectedExamId, payload);
      setSuccessMsg(`Marks successfully saved for ${selectedStudentEmail}! (${result.total_marks_obtained}/${totalAttemptableMax} marks)`);
      setTimeout(() => {
        setSuccessMsg(prev => (prev.includes(selectedStudentEmail) ? '' : prev));
      }, 6000);

      await loadExamDetailsAndScores(selectedExamId, selectedStudentEmail);
    } catch (err) {
      console.error('Failed to upload marks:', err);
      setErrorMsg(err.message || 'Failed to save student marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const studentScoreMap = useMemo(() => {
    const map = {};
    (examStudentScores || []).forEach(score => {
      const email = (score.student_email || score.student?.email || '').toLowerCase();
      if (email) map[email] = score;
    });
    return map;
  }, [examStudentScores]);

  const currentStudentScore = studentScoreMap[(selectedStudentEmail || '').toLowerCase()];
  const isCurrentStudentGraded = !!currentStudentScore;

  const existingExamForSelection = useMemo(() => {
    if (!examForm.subject_id || !examForm.exam_type) return null;
    const hasSets = OFFICIAL_EXAM_TYPES.find(t => t.id === examForm.exam_type)?.hasSets;
    return exams.find(e => 
      String(e.subject?.id || e.subject_id) === String(examForm.subject_id) &&
      e.exam_type === examForm.exam_type &&
      (hasSets ? e.paper_set === examForm.paper_set : true)
    );
  }, [exams, examForm.subject_id, examForm.exam_type, examForm.paper_set]);

  const subjectExams = useMemo(() => {
    if (!examForm.subject_id) return [];
    return exams.filter(e => String(e.subject?.id || e.subject_id) === String(examForm.subject_id));
  }, [exams, examForm.subject_id]);

  return (
    <div className="space-y-6">

      {/* Global Status Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-semibold">{successMsg}</div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-semibold">{errorMsg}</div>
          <button onClick={() => setErrorMsg('')} className="text-rose-700 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: UPLOAD & SAVE EXAM PAPER                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'upload-paper' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-600" />
                  <span>Upload Question Paper & Auto-Analyze Syllabus Topics</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload the question paper PDF. The AI engine reads the exam, identifies every question, and strictly matches it to its single closest syllabus topic and unit.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-semibold">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>AI Engine: <strong>{AI_MODELS.find(m => m.id === activeAIModel)?.shortName || activeAIModel}</strong></span>
              </div>
            </div>

            {/* Exam Saved Success Banner */}
            {examSavedSuccess && (
              <div className="p-6 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setExamSavedSuccess(null)}
                  className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Exam Saved to Database Successfully!</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    {examSavedSuccess.qCount} Questions Stored
                  </span>
                </div>
                <p className="text-xs text-emerald-100">
                  Exam <strong>"{examSavedSuccess.examTitle}"</strong> is now saved. You can score students on this exam now or at any later time from the "Score Students" tab.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedExamId(examSavedSuccess.examId);
                      switchTab('record-marks');
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-extrabold hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Score Students for This Exam Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleResetUploadForm}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Upload Another Paper / Set
                  </button>
                </div>
              </div>
            )}

            {/* Active Edit Mode Notification */}
            {editingExamId && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-200 text-indigo-900 shrink-0">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-950">Editing Existing Exam Blueprint</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-950 text-[10px] font-black">
                        ID #{editingExamId}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-800 mt-0.5">
                      You are editing <strong>{examForm.title} {examForm.paper_set ? `(${examForm.paper_set})` : ''}</strong>. Modifying questions or topics below will update the saved blueprint directly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-xl bg-indigo-200 hover:bg-indigo-300 text-indigo-950 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Cancel Edit / Upload New
                </button>
              </div>
            )}

            {/* Already Uploaded Paper Detected Notification */}
            {existingExamForSelection && !editingExamId && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-200 text-amber-950 shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-amber-950">Paper Already Uploaded</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-black">
                        {existingExamForSelection.paper_set ? `${existingExamForSelection.exam_type} (${existingExamForSelection.paper_set})` : existingExamForSelection.exam_type}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      This paper already exists in the database with <strong>{existingExamForSelection.questions_data?.length || 0} questions</strong> ({existingExamForSelection.total_marks} Marks, Date: {existingExamForSelection.exam_date}).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleLoadExistingForEdit(existingExamForSelection)}
                    className="px-3 py-1.5 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Questions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExamId(existingExamForSelection.id);
                      loadExamDetailsAndScores(existingExamForSelection.id, selectedStudentEmail);
                      switchTab('record-marks');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Score Students</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Form Step 1: Metadata */}
            <div className="space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Select Subject, Exam Type & Paper Set</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject *</label>
                  <select
                    value={examForm.subject_id}
                    onChange={(e) => setExamForm(prev => ({ ...prev, subject_id: e.target.value }))}
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
                  <label className="text-xs font-bold text-slate-700">Exam Type *</label>
                  <select
                    value={examForm.exam_type}
                    onChange={(e) => handleExamTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {OFFICIAL_EXAM_TYPES.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.defaultMarks} Marks)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Question Paper Set</label>
                  {examForm.exam_type.startsWith('Quiz') ? (
                    <select
                      value={examForm.paper_set}
                      onChange={(e) => setExamForm(prev => ({ ...prev, paper_set: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {QUESTION_PAPER_SETS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      Standard Exam (No Sets)
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Exam Paper Status Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span>Exam Papers Status for Current Subject</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {subjectExams.length} Papers Configured
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {OFFICIAL_EXAM_TYPES.map(type => {
                    if (type.hasSets) {
                      return (
                        <div key={type.id} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700">{type.label}</div>
                          <div className="flex flex-wrap gap-1">
                            {QUESTION_PAPER_SETS.map(setName => {
                              const matchedExam = subjectExams.find(e => e.exam_type === type.id && e.paper_set === setName);
                              const isSelected = examForm.exam_type === type.id && examForm.paper_set === setName;
                              return (
                                <button
                                  key={setName}
                                  type="button"
                                  onClick={() => {
                                    if (matchedExam) {
                                      handleLoadExistingForEdit(matchedExam);
                                    } else {
                                      setEditingExamId(null);
                                      setExamForm(prev => ({
                                        ...prev,
                                        exam_type: type.id,
                                        title: type.label,
                                        paper_set: setName,
                                        total_marks: type.defaultMarks
                                      }));
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                    matchedExam
                                      ? isSelected
                                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                      : isSelected
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                  title={matchedExam ? `Uploaded with ${matchedExam.questions_data?.length || 0} Qs. Click to edit.` : 'Click to prepare upload.'}
                                >
                                  {matchedExam ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-2.5 w-2.5 text-slate-400" />}
                                  <span>{setName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      const matchedExam = subjectExams.find(e => e.exam_type === type.id);
                      const isSelected = examForm.exam_type === type.id;
                      return (
                        <div key={type.id} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700">{type.label}</div>
                          <button
                            type="button"
                            onClick={() => {
                              if (matchedExam) {
                                handleLoadExistingForEdit(matchedExam);
                              } else {
                                setEditingExamId(null);
                                setExamForm(prev => ({
                                  ...prev,
                                  exam_type: type.id,
                                  title: type.label,
                                  paper_set: '',
                                  total_marks: type.defaultMarks
                                }));
                              }
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              matchedExam
                                ? isSelected
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : isSelected
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {matchedExam ? <Check className="h-3 w-3" /> : <Plus className="h-2.5 w-2.5" />}
                            <span>{matchedExam ? `Uploaded (${matchedExam.questions_data?.length || 0} Qs)` : 'Not Uploaded Yet'}</span>
                          </button>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {/* PDF Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Question Paper PDF *</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">Auto-Analyzes Topics & Renames</span>
                    </span>
                    {fileUploading && <span className="text-[10px] text-emerald-600 animate-pulse font-semibold">Analyzing Syllabus Topics...</span>}
                  </label>

                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleUploadFile(e, 'qp')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />

                  {examForm.question_paper_pdf && (
                    <div className="text-[11px] text-emerald-800 font-semibold truncate flex items-center gap-1.5 pt-1 bg-white p-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>Renamed & Stored: <strong className="font-mono text-emerald-900">{qpFile?.name || examForm.question_paper_pdf.split('/').pop()}</strong></span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Answer Key / Solutions PDF (Optional)</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded-md">Auto-Renames</span>
                    </span>
                  </label>

                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleUploadFile(e, 'ak')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                  />

                  {examForm.answer_key_pdf && (
                    <div className="text-[11px] text-slate-800 font-semibold truncate flex items-center gap-1.5 pt-1 bg-white p-2 rounded-xl border border-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>Renamed & Stored: <strong className="font-mono text-slate-900">{akFile?.name || examForm.answer_key_pdf.split('/').pop()}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Step 2: Auto-Analyzed Syllabus Topics & Questions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Questions & Strictly Matched Syllabus Topics</span>
                </div>
                {examForm.questions.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>{examForm.questions.length} Questions Extracted & Mapped</span>
                  </span>
                )}
              </div>

              {examForm.questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No Questions Analyzed Yet</h4>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Please upload the Question Paper PDF above. The AI engine will read the exam, extract every question, and strictly map each question to its closest official syllabus topic and unit.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Q#</th>
                          <th className="px-4 py-3">Syllabus Unit</th>
                          <th className="px-4 py-3">Syllabus Topic (Matched)</th>
                          <th className="px-4 py-3">Max Marks</th>
                          <th className="px-4 py-3">Question Text / Summary</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {examForm.questions.map((q, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                              <input
                                type="text"
                                value={q.q_no}
                                onChange={(e) => handleQuestionFieldChange(idx, 'q_no', e.target.value)}
                                className="px-2 py-1 rounded border border-slate-200 font-mono text-xs w-28"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                                {q.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={q.topic}
                                onChange={(e) => handleQuestionFieldChange(idx, 'topic', e.target.value)}
                                className="w-full px-2 py-1 rounded border border-slate-200 font-semibold text-slate-800 text-xs"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                step="0.5"
                                value={q.max_marks}
                                onChange={(e) => handleQuestionFieldChange(idx, 'max_marks', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded border border-slate-200 font-bold text-slate-800 text-xs text-center"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={q.question_text || ''}
                                onChange={(e) => handleQuestionFieldChange(idx, 'question_text', e.target.value)}
                                placeholder="Summary or question snippet"
                                className="w-full px-2 py-1 rounded border border-slate-200 text-slate-600 text-xs"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionRow(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                title="Remove question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={handleAddQuestionRow}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Question Row</span>
                    </button>

                    <div className="text-xs text-slate-500">
                      Total Calculated: <strong>{examForm.questions.reduce((sum, q) => sum + (parseFloat(q.max_marks) || 0), 0)} Marks</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Save Exam Paper & Questions Button */}
            {examForm.questions.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Ready to Save this Exam Paper?</p>
                  <p className="text-[11px] text-emerald-700">Once saved, you can grade students on this paper at any time.</p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveExamPaper}
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Exam to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingExamId ? 'Update Exam Blueprint & Questions' : 'Save Exam Paper & Questions'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCORE STUDENTS                                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'record-marks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>Enter Student Marks by Question</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an uploaded paper and an enrolled student to record their question-wise marks.
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
                  <span>View Question Paper PDF</span>
                </a>
              )}
            </div>

            {/* Exam and Student Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Uploaded Exam Paper *</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {exams.length === 0 ? (
                    <option value="">No exam papers uploaded yet</option>
                  ) : (
                    exams.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject?.code} — {ex.title} • {ex.total_marks} Marks ({ex.questions_data?.length || 0} Questions)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Student *</label>
                {students.length > 0 ? (
                  <select
                    value={selectedStudentEmail}
                    onChange={(e) => handleStudentEmailChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {students.map(st => {
                      const score = studentScoreMap[st.email.toLowerCase()];
                      return (
                        <option key={st.id} value={st.email}>
                          {score 
                            ? `✓ [Graded: ${score.total_marks_obtained}/${currentSelectedExam?.total_marks || 30}M] ${st.name || st.email} — Roll: ${st.roll_number || 'N/A'}` 
                            : `⏳ [Not Graded] ${st.name || st.email} — Roll: ${st.roll_number || 'N/A'} (${st.email})`
                          }
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="email"
                    placeholder="Enter student email (e.g. student@college.edu)"
                    value={selectedStudentEmail}
                    onChange={(e) => handleStudentEmailChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                )}
              </div>
            </div>

            {/* Student Class Grading Progress Roster */}
            {students.length > 0 && currentSelectedExam && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Class Grading Progress: <strong className="text-emerald-700">{Object.keys(studentScoreMap).length} of {students.length} Graded</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({Math.round(((Object.keys(studentScoreMap).length) / (students.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Click any student chip below to grade or edit
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {students.map(st => {
                    const score = studentScoreMap[st.email.toLowerCase()];
                    const isSelected = selectedStudentEmail.toLowerCase() === st.email.toLowerCase();
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStudentEmailChange(st.email)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white ring-2 ring-emerald-500 shadow-xs'
                            : score
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {score ? (
                          <CheckCircle2 className={`h-3.5 w-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        ) : (
                          <Clock className={`h-3.5 w-3.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`} />
                        )}
                        <span>{st.name || st.email.split('@')[0]}</span>
                        {score && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-950'
                          }`}>
                            {score.total_marks_obtained}M
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State when no exams exist */}
            {exams.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No Exam Papers Uploaded Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  To enter student marks, first upload a question paper PDF in the "Upload & Save Exam Paper" tab.
                </p>
                <button
                  type="button"
                  onClick={() => switchTab('upload-paper')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  <span>Go to Upload Exam Paper</span>
                </button>
              </div>
            ) : studentQuestionScores.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Please select an exam paper from the dropdown above.
              </div>
            ) : (
              <form onSubmit={handleSubmitStudentMarks} className="space-y-6">
                
                {/* Active Grading Mode Notification */}
                {isCurrentStudentGraded ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-200 text-emerald-900 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Marks Already Uploaded — Edit Mode Active</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 text-[10px] font-black">
                            Current Score: {currentStudentScore.total_marks_obtained} / {currentSelectedExam?.total_marks || 30} Marks
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Previous marks for <strong>{selectedStudentEmail}</strong> are pre-loaded below. You can edit any question marks and click <strong>"Update Student Marks"</strong> to save changes and recalculate their study order.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
                      Editing Existing Record
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold text-slate-900">Fresh Grading Mode: </span>
                      <span><strong>{selectedStudentEmail}</strong> has not been graded yet for this exam. Enter marks for each question below.</span>
                    </div>
                  </div>
                )}

                {/* Pre-End Choice Selector Banner */}
                {isPreEndSem && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-amber-700" />
                      <span>Unit-Wise Question Choices (Select which question the student attempted):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {['Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V'].map((unitName, uIdx) => {
                        const qA = studentQuestionScores.find(q => q.choice_group === unitName && q.q_no.includes(`Q${uIdx * 2 + 2}`));
                        const qB = studentQuestionScores.find(q => q.choice_group === unitName && q.q_no.includes(`Q${uIdx * 2 + 3}`));
                        const chosen = unitChoices[unitName];

                        return (
                          <div key={unitName} className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1.5 text-center">
                            <div className="text-[11px] font-bold text-amber-800">{unitName} (12m)</div>
                            <div className="flex gap-1 justify-center">
                              {qA && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUnitChoice(unitName, qA.q_no)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-black cursor-pointer transition-all ${
                                    chosen === qA.q_no 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {qA.q_no.split(' - ')[1] || qA.q_no}
                                </button>
                              )}
                              {qB && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUnitChoice(unitName, qB.q_no)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-black cursor-pointer transition-all ${
                                    chosen === qB.q_no 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {qB.q_no.split(' - ')[1] || qB.q_no}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Score Rows */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Q#</th>
                        <th className="px-4 py-3">Syllabus Topic & Unit</th>
                        <th className="px-4 py-3">Max Marks</th>
                        <th className="px-4 py-3">Marks Obtained</th>
                        <th className="px-4 py-3">Faculty Examiner Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentQuestionScores.map((q, idx) => {
                        const isOmitted = isPreEndSem && q.is_choice && q.choice_group && unitChoices[q.choice_group] !== q.q_no;

                        return (
                          <tr key={idx} className={`transition-colors ${isOmitted ? 'bg-slate-50/60 opacity-40' : 'hover:bg-slate-50/70'}`}>
                            <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                              {q.q_no}
                              {isOmitted && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600 text-[9px] font-semibold">
                                  Choice Omitted
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">{q.topic}</div>
                              <div className="text-[11px] text-slate-400">{q.unit}</div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600">
                              {q.max_marks} marks
                            </td>
                            <td className="px-4 py-3 w-32">
                              {isOmitted ? (
                                <div className="text-slate-400 italic text-[11px]">Not attempted</div>
                              ) : (
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={q.max_marks}
                                  placeholder="0.0"
                                  required={!isOmitted}
                                  value={q.marks_obtained}
                                  onChange={(e) => handleStudentScoreChange(idx, 'marks_obtained', e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-center text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder={isOmitted ? 'Optional' : 'e.g. Good derivation, minor calculation gap'}
                                disabled={isOmitted}
                                value={q.faculty_notes}
                                onChange={(e) => handleStudentScoreChange(idx, 'faculty_notes', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Score Summary & Submit */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-emerald-900">Total Marks Scored:</div>
                    <div className="text-lg font-black text-emerald-800">
                      {totalAttemptedMarks} <span className="text-xs font-medium text-emerald-600">/ {totalAttemptableMax} Marks</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {totalAttemptableMax > 0 ? ((totalAttemptedMarks / totalAttemptableMax) * 100).toFixed(1) : 0}%
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
                        <span>Saving Marks...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>
                          {isCurrentStudentGraded
                            ? 'Update Student Marks'
                            : 'Save Student Marks'
                          }
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPLOADED EXAMS LIST                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam-list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Uploaded Exam Papers ({exams.length})
              </h2>
              <p className="text-xs text-slate-500">Only genuine exam papers uploaded by faculty are displayed.</p>
            </div>
            <button
              onClick={() => switchTab('upload-paper')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload New Exam Paper</span>
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-700">No Exam Papers Uploaded Yet</div>
              <p className="text-xs text-slate-400">Click "Upload New Exam Paper" to upload a Question Paper PDF and save it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(ex => (
                <div key={ex.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      {ex.subject?.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {ex.paper_set ? `${ex.exam_type} (${ex.paper_set})` : ex.exam_type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ex.title}</h3>
                    <p className="text-xs text-slate-500">{ex.subject?.name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Total: <strong className="text-slate-800">{ex.total_marks} Marks</strong></span>
                    <span>Questions: <strong className="text-slate-800">{ex.questions_data?.length || 0}</strong></span>
                    <span>Date: <strong className="text-slate-800">{ex.exam_date}</strong></span>
                  </div>

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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteExam(ex.id, ex.title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedExamId(ex.id);
                          initializeQuestionScoresForExam(ex);
                          switchTab('record-marks');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Score Students</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
