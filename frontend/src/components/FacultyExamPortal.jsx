import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Award, ExternalLink, ChevronRight, Sparkles, Layers, Check, 
  RefreshCw, Sliders
} from 'lucide-react';
import { api } from '../services/api';

const OFFICIAL_EXAM_TYPES = [
  { id: 'Quiz 1', label: 'Quiz 1', defaultMarks: 30, hasSets: true },
  { id: 'Quiz 2', label: 'Quiz 2', defaultMarks: 30, hasSets: true },
  { id: 'Quiz 3', label: 'Quiz 3', defaultMarks: 30, hasSets: true },
  { id: 'Pre-End Semester Examination', label: 'Pre-End Semester Examination', defaultMarks: 100, hasSets: false },
];

const QUESTION_PAPER_SETS = ['Set A', 'Set B', 'Set C', 'Set D', 'Set E'];

// Pre-built official templates matching college schema exactly
const getOfficialQuizTemplate = () => [
  // Part A: 2 x 5 marks = 10 marks
  { q_no: 'Part A - Q1', max_marks: 5, unit: 'Unit I', topic: 'OSI Reference Model & Principles', question_text: 'Explain 7 layers of OSI model with PDU encapsulation' },
  { q_no: 'Part A - Q2', max_marks: 5, unit: 'Unit I', topic: 'Physical Layer & Delay Analysis', question_text: 'Delay analysis: transmission vs propagation delay' },
  // Part B: Q3 (a-f) 1 mark each = 6 marks
  { q_no: 'Part B - Q3(a)', max_marks: 1, unit: 'Unit I', topic: 'Network Topologies', question_text: 'Define mesh topology formula for n nodes' },
  { q_no: 'Part B - Q3(b)', max_marks: 1, unit: 'Unit II', topic: 'Data Link Layer Framing', question_text: 'Define bit stuffing & byte stuffing' },
  { q_no: 'Part B - Q3(c)', max_marks: 1, unit: 'Unit II', topic: 'ALOHA Protocols', question_text: 'Maximum efficiency of Pure ALOHA' },
  { q_no: 'Part B - Q3(d)', max_marks: 1, unit: 'Unit II', topic: 'Sliding Window Protocols', question_text: 'What is piggybacking?' },
  { q_no: 'Part B - Q3(e)', max_marks: 1, unit: 'Unit II', topic: 'Error Handling', question_text: 'Hamming distance definition' },
  { q_no: 'Part B - Q3(f)', max_marks: 1, unit: 'Unit II', topic: 'IEEE Standards', question_text: 'Standard IEEE 802.3 Ethernet frame size' },
  // Part B: Q4 (7 marks)
  { q_no: 'Part B - Q4', max_marks: 7, unit: 'Unit II', topic: 'ALOHA Protocols', question_text: 'Pure vs Slotted ALOHA throughput derivation' },
  // Part B: Q5 (7 marks)
  { q_no: 'Part B - Q5', max_marks: 7, unit: 'Unit II', topic: 'Sliding Window Protocols', question_text: 'Go-Back-N vs Selective Repeat protocols under frame loss' },
];

const getOfficialPreEndTemplate = () => [
  // Q1: 10 questions x 4 marks = 40 marks (Compulsory)
  { q_no: 'Q1(a)', max_marks: 4, unit: 'Unit I', topic: 'OSI Reference Model', question_text: 'Connection-oriented vs connectionless services' },
  { q_no: 'Q1(b)', max_marks: 4, unit: 'Unit I', topic: 'Delay Analysis', question_text: 'Propagation delay vs transmission delay in packet switching' },
  { q_no: 'Q1(c)', max_marks: 4, unit: 'Unit II', topic: 'Error Handling', question_text: 'CRC cyclic redundancy check error detection' },
  { q_no: 'Q1(d)', max_marks: 4, unit: 'Unit II', topic: 'ALOHA Protocols', question_text: 'Channel throughput in slotted ALOHA' },
  { q_no: 'Q1(e)', max_marks: 4, unit: 'Unit III', topic: 'Routing', question_text: 'Count-to-infinity problem in distance vector routing' },
  { q_no: 'Q1(f)', max_marks: 4, unit: 'Unit III', topic: 'IPv4 Addressing', question_text: 'CIDR subnetting and supernetting' },
  { q_no: 'Q1(g)', max_marks: 4, unit: 'Unit III', topic: 'Congestion Control', question_text: 'Leaky bucket vs token bucket algorithms' },
  { q_no: 'Q1(h)', max_marks: 4, unit: 'Unit IV', topic: 'Connection Management', question_text: 'TCP 3-way handshake connection establishment' },
  { q_no: 'Q1(i)', max_marks: 4, unit: 'Unit IV', topic: 'Cryptography', question_text: 'RSA public key encryption algorithm' },
  { q_no: 'Q1(j)', max_marks: 4, unit: 'Unit V', topic: 'Electronic Mail', question_text: 'SMTP vs POP3/IMAP email architecture' },
  
  // Units I to V Choice Questions: 5 Units x 12 marks = 60 marks
  { q_no: 'Unit I - Q2', max_marks: 12, unit: 'Unit I', topic: 'OSI Reference Model', question_text: 'Comparison of OSI vs TCP/IP model with switching methods', is_choice: true, choice_group: 'Unit I' },
  { q_no: 'Unit I - Q3', max_marks: 12, unit: 'Unit I', topic: 'Network Topology', question_text: 'Network topology architectures, delay analysis & media', is_choice: true, choice_group: 'Unit I' },

  { q_no: 'Unit II - Q4', max_marks: 12, unit: 'Unit II', topic: 'Sliding Window Protocols', question_text: 'Sliding Window protocols: Go-Back-N vs Selective Repeat', is_choice: true, choice_group: 'Unit II' },
  { q_no: 'Unit II - Q5', max_marks: 12, unit: 'Unit II', topic: 'IEEE Standards', question_text: 'IEEE 802.3 Ethernet, 802.11 Wi-Fi & CSMA/CD', is_choice: true, choice_group: 'Unit II' },

  { q_no: 'Unit III - Q6', max_marks: 12, unit: 'Unit III', topic: 'Routing', question_text: 'Link state routing vs distance vector routing', is_choice: true, choice_group: 'Unit III' },
  { q_no: 'Unit III - Q7', max_marks: 12, unit: 'Unit III', topic: 'IPv6 Addressing', question_text: 'IPv4 vs IPv6 datagram headers, fragmentation & ICMP', is_choice: true, choice_group: 'Unit III' },

  { q_no: 'Unit IV - Q8', max_marks: 12, unit: 'Unit IV', topic: 'TCP Window Management', question_text: 'TCP Window management, slow start & congestion avoidance', is_choice: true, choice_group: 'Unit IV' },
  { q_no: 'Unit IV - Q9', max_marks: 12, unit: 'Unit IV', topic: 'Cryptography', question_text: 'Symmetric vs Asymmetric cryptography: DES, AES, RSA', is_choice: true, choice_group: 'Unit IV' },

  { q_no: 'Unit V - Q10', max_marks: 12, unit: 'Unit V', topic: 'File Transfer', question_text: 'Application layer protocols: HTTP 1.1 vs HTTP/2, DNS & FTP', is_choice: true, choice_group: 'Unit V' },
  { q_no: 'Unit V - Q11', max_marks: 12, unit: 'Unit V', topic: 'Electronic Mail', question_text: 'Electronic mail architecture: SMTP, POP3, IMAP & MIME', is_choice: true, choice_group: 'Unit V' },
];

export default function FacultyExamPortal() {
  const [activeSubTab, setActiveSubTab] = useState('record-marks'); // 'record-marks', 'upload-exam', 'exam-list'
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exam Creation Form State
  const [examForm, setExamForm] = useState({
    subject_id: '',
    title: 'Quiz 1',
    exam_type: 'Quiz 1',
    paper_set: 'Set A',
    total_marks: 30,
    exam_date: new Date().toISOString().split('T')[0],
    question_paper_pdf: '',
    answer_key_pdf: '',
    questions: getOfficialQuizTemplate()
  });

  const [qpFile, setQpFile] = useState(null);
  const [akFile, setAkFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Student Marks Form State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [studentQuestionScores, setStudentQuestionScores] = useState([]);
  const [evaluatedStudyOrder, setEvaluatedStudyOrder] = useState(null);

  // For Pre-End Choice Questions Tracking: { 'Unit I': 'Unit I - Q2', 'Unit II': 'Unit II - Q4', ... }
  const [unitChoices, setUnitChoices] = useState({
    'Unit I': 'Unit I - Q2',
    'Unit II': 'Unit II - Q4',
    'Unit III': 'Unit III - Q6',
    'Unit IV': 'Unit IV - Q8',
    'Unit V': 'Unit V - Q10',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

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
      is_choice: !!q.is_choice,
      choice_group: q.choice_group || null,
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

  const handleExamTypeChange = (typeId) => {
    const matched = OFFICIAL_EXAM_TYPES.find(t => t.id === typeId);
    if (!matched) return;

    if (matched.hasSets) {
      // Quiz template
      setExamForm(prev => ({
        ...prev,
        exam_type: matched.id,
        title: matched.label,
        total_marks: 30,
        paper_set: prev.paper_set || 'Set A',
        questions: getOfficialQuizTemplate()
      }));
    } else {
      // Pre-End template
      setExamForm(prev => ({
        ...prev,
        exam_type: matched.id,
        title: matched.label,
        total_marks: 100,
        paper_set: '', // No sets for Pre-End
        questions: getOfficialPreEndTemplate()
      }));
    }
  };

  const handleUploadFile = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', examForm.subject_id || (subjects[0]?.id || ''));
      formData.append('exam_type', examForm.exam_type || 'Quiz 1');
      formData.append('paper_set', examForm.paper_set || '');
      formData.append('is_answer_key', target === 'ak' ? 'true' : 'false');

      const res = await api.analyzeExamPdf(formData);

      if (target === 'qp') {
        setQpFile({ name: res.filename });
        setExamForm(prev => ({
          ...prev,
          question_paper_pdf: res.file_url,
          questions: (res.questions && res.questions.length > 0) ? res.questions : prev.questions
        }));
        setSuccessMsg(`✓ Question Paper renamed to "${res.filename}"! Topics and units auto-analyzed from syllabus (${res.questions?.length || 0} questions).`);
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

  const handleQuestionFieldChange = (index, field, value) => {
    setExamForm(prev => {
      const nextQ = [...prev.questions];
      nextQ[index] = { ...nextQ[index], [field]: value };
      return { ...prev, questions: nextQ };
    });
  };

  // Submit New Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!examForm.subject_id) {
      setErrorMsg('Please select a subject.');
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

      const created = await api.createExam(payload);
      setSuccessMsg(`Exam "${created.title}" successfully created with ${created.questions_data?.length || 0} questions!`);
      
      const updatedExams = await api.getExams();
      setExams(updatedExams);
      setSelectedExamId(created.id);
      initializeQuestionScoresForExam(created);
      setActiveSubTab('record-marks');

      setQpFile(null);
      setAkFile(null);
    } catch (err) {
      console.error('Failed to create exam:', err);
      setErrorMsg(err.message || 'Failed to create exam.');
    } finally {
      setSubmitting(false);
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
        return sum; // unchosen alternative not counted
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
      setErrorMsg('Please select an exam.');
      return;
    }
    if (!selectedStudentEmail) {
      setErrorMsg('Please select or specify a student email.');
      return;
    }

    // Build question scores array
    const preparedScores = studentQuestionScores.map(q => {
      const isOmitted = isPreEndSem && q.is_choice && q.choice_group && unitChoices[q.choice_group] !== q.q_no;
      const obtainedVal = isOmitted ? 0.0 : parseFloat(q.marks_obtained || 0.0);

      return {
        q_no: q.q_no,
        max_marks: parseFloat(q.max_marks),
        marks_obtained: obtainedVal,
        unit: q.unit,
        topic: q.topic,
        attempted: !isOmitted,
        is_choice_omitted: isOmitted,
        faculty_notes: q.faculty_notes || ''
      };
    });

    setSubmitting(true);
    try {
      const payload = {
        student_email: selectedStudentEmail.trim().toLowerCase(),
        question_scores: preparedScores
      };

      const result = await api.uploadExamScores(selectedExamId, payload);
      setSuccessMsg(`Marks successfully saved for ${selectedStudentEmail}! (${result.total_marks_obtained}/${totalAttemptableMax} marks)`);

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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-7 sm:p-9 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>Official University Examination Schema</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quiz 1-3 & Pre-End Semester Examinations
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Record question-by-question marks for <strong className="text-white">Quiz 1, 2, 3 (30 Marks, Sets A–E)</strong> and <strong className="text-white">Pre-End Semester (100 Marks, Choice of 1 per Unit)</strong>.
            The engine evaluates question deficits to compute each student's Personalised Study Order.
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
              <span>Uploaded Exams ({exams.length})</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

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
                  {isPreEndSem 
                    ? 'Pre-End Semester (100 Marks): Q1 (40m compulsory) + Select attempted question for Units I to V (12m each).'
                    : 'Quiz (30 Marks): Part A (2x5m) + Part B Q3 (6x1m), Q4 (7m), Q5 (7m).'
                  }
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
                <label className="text-xs font-bold text-slate-700">Select Exam</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {exams.length === 0 ? (
                    <option value="">No exams uploaded yet</option>
                  ) : (
                    exams.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject?.code} — {ex.title} {ex.paper_set ? `(${ex.paper_set})` : ''} • {ex.total_marks} Marks
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Student</label>
                {students.length > 0 ? (
                  <select
                    value={selectedStudentEmail}
                    onChange={(e) => setSelectedStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                )}
              </div>
            </div>

            {/* Questions Evaluation Form */}
            {studentQuestionScores.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Please upload or select an exam first.
              </div>
            ) : (
              <form onSubmit={handleSubmitStudentMarks} className="space-y-6">
                
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
                                placeholder={isOmitted ? 'Optional' : 'e.g. Good derivation, minor calculation error'}
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
                    Engine Ranked Study Order for {selectedStudentEmail}
                  </h3>
                </div>
                <span className="text-xs text-indigo-300 font-semibold">
                  {evaluatedStudyOrder.ranked_topics?.length || 0} Topics Ranked (Worst to Best)
                </span>
              </div>

              {evaluatedStudyOrder.quick_strategy && (
                <p className="text-xs text-indigo-200 bg-white/10 p-3 rounded-xl border border-white/10 leading-relaxed">
                  💡 <span className="font-bold">Student Guidance:</span> {evaluatedStudyOrder.quick_strategy}
                </p>
              )}

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
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                <span>Upload Question Paper & Configure Exam</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Quiz 1, 2, 3 (30 Marks) or Pre-End Semester Examination (100 Marks).
              </p>
            </div>

            {/* Quick Template Presets */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExamTypeChange('Quiz 1')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Reset to Quiz (30m)
              </button>
              <button
                type="button"
                onClick={() => handleExamTypeChange('Pre-End Semester Examination')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Reset to Pre-End (100m)
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-6">
            
            {/* Row 1: Subject, Exam Type, Set */}
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

              {/* Set selector for Quizzes, or No-Set for Pre-End */}
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
                    No Sets (Standard Exam)
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Total Marks, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Total Exam Marks</label>
                <input
                  type="number"
                  readOnly
                  value={examForm.total_marks}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 cursor-not-allowed"
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

            {/* PDF Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Question Paper PDF</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">Auto-Analyzes Topics & Renames</span>
                  </span>
                  {fileUploading && <span className="text-[10px] text-emerald-600 animate-pulse font-semibold">Analyzing PDF & Units...</span>}
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
                    <span>Renamed & Saved: <strong className="font-mono text-emerald-900">{qpFile?.name || examForm.question_paper_pdf.split('/').pop()}</strong></span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Answer Key / Solutions PDF</span>
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
                    <span>Renamed & Saved: <strong className="font-mono text-slate-900">{akFile?.name || examForm.answer_key_pdf.split('/').pop()}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Breakdown Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">
                      Question Breakdown ({examForm.questions.length} Questions)
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      <span>Units & Topics Auto-Selected</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {examForm.exam_type.startsWith('Quiz') 
                      ? 'Part A: 2x5m (10m) + Part B: Q3 (6x1m), Q4 (7m), Q5 (7m) = 30 Marks.' 
                      : 'Q1: 10x4m (40m) + Units I-V Choice: 5x12m (60m) = 100 Marks.'
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionRow}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Rows */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {examForm.questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="w-28">
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
                        placeholder="Syllabus Topic Name"
                        required
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="w-20">
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
                    <span>Publish Exam & Go To Grading</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALL EXAMS & RECORDS                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam-list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Configured College Exams (Quiz 1-3 & Pre-End Sem)
            </h2>
            <button
              onClick={() => setActiveSubTab('upload-exam')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Configure New Exam</span>
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-sm text-slate-700">No exams configured yet</div>
              <p className="text-xs text-slate-400 mt-1">Click "Configure New Exam" to load the Quiz or Pre-End Sem template.</p>
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

                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        initializeQuestionScoresForExam(ex);
                        setActiveSubTab('record-marks');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Enter Marks</span>
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
