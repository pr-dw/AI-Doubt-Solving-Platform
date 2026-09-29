import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, BookOpen, MessageSquare, Cpu, 
  Database, Server, CheckCircle2, ArrowUpRight, UserPlus,
  Edit3, Trash2, Plus, Search, KeyRound, AlertCircle,
  Filter, Calendar, Clock, Layers, FileText, Sparkles,
  X, ChevronDown, ChevronRight, Hash, GraduationCap, FileCheck, Check,
  Info, Eye, EyeOff, TrendingUp, Activity, BarChart3, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

// Helper to normalize units data whether stored as array of strings or structured objects
const normalizeUnits = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [
      { unit_number: 1, name: 'Unit 1: Core Fundamentals & Principles', topics: ['Architectural Overview', 'Basic Concepts & Terminology'] },
      { unit_number: 2, name: 'Unit 2: Implementation & Frameworks', topics: ['Component Lifecycle', 'State Management & Handlers'] },
      { unit_number: 3, name: 'Unit 3: Data Storage & Persistence', topics: ['Database Schema', 'Queries & Transactions'] },
      { unit_number: 4, name: 'Unit 4: Security & Networking', topics: ['API Integrations', 'Authentication Protocols'] },
      { unit_number: 5, name: 'Unit 5: Advanced Applications & Case Studies', topics: ['Performance Tuning', 'Industry Applications'] }
    ];
  }

  // If already structured objects
  if (typeof data[0] === 'object' && data[0] !== null && (data[0].name || data[0].title)) {
    return data.map((u, idx) => ({
      unit_number: u.unit_number || idx + 1,
      name: u.name || u.title || `Unit ${idx + 1}`,
      topics: Array.isArray(u.topics) && u.topics.length > 0 ? u.topics : ['General Unit Concepts']
    }));
  }

  // If array of strings (e.g. legacy 'Unit 1: Overview')
  return data.map((item, idx) => {
    const text = String(item).trim();
    let name = text;
    let topics = ['Fundamental Core Concepts', 'Applied Laboratory Exercises'];
    if (text.includes(':')) {
      const parts = text.split(':');
      name = text;
    } else {
      name = `Unit ${idx + 1}: ${text}`;
    }
    return {
      unit_number: idx + 1,
      name,
      topics
    };
  });
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

export default function AdminPanel({ user, activeSubTab = 'users', onNavigateTab }) {
  const [currentTab, setCurrentTab] = useState(activeSubTab || 'users');

  // Sync with prop when sidebar changes tab
  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    if (onNavigateTab) {
      onNavigateTab(tabId);
    }
  };

  // Toast notification state
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });
  const showToast = (text, type = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
  };

  /* =============================================================
     TAB 1: USER ACCOUNT GOVERNANCE
  ============================================================= */
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSemFilter, setUserSemFilter] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Application (BCA)',
    semester: 5,
    section: 'A',
    roll_number: '2412044050108',
    phone: ''
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    department: 'Computer Application (BCA)',
    semester: 5,
    section: 'A',
    roll_number: '',
    phone: '',
    new_password: ''
  });
  const [updatingUser, setUpdatingUser] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getAdminUsers(userRoleFilter, userSearchQuery, userSemFilter);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load user records', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'users') {
      loadUsers();
    }
  }, [currentTab, userRoleFilter, userSemFilter]);

  useEffect(() => {
    if (currentTab !== 'users') return;
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const createdUser = await api.createAdminUser(newUserForm);
      setShowCreateUserModal(false);
      showToast(`User account created successfully for ${newUserForm.email}`);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: 'Computer Application (BCA)',
        semester: 5,
        section: 'A',
        roll_number: '2412044050108',
        phone: ''
      });
      // Clear filters so the new account is immediately visible
      setUserRoleFilter('all');
      setUserSearchQuery('');
      setUserSemFilter('');
      if (createdUser && createdUser.id) {
        setUsers(prev => [createdUser, ...prev.filter(u => u.id !== createdUser.id)]);
      }
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user account', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'student',
      department: u.department || 'Computer Application (BCA)',
      semester: u.semester || 5,
      section: u.section || 'A',
      roll_number: u.roll_number || '2412044050108',
      phone: u.phone || '',
      new_password: ''
    });
    setShowEditPassword(false);
    setShowEditUserModal(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    try {
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
        department: editUserForm.department,
        semester: editUserForm.semester,
        section: editUserForm.section,
        roll_number: editUserForm.roll_number,
        phone: editUserForm.phone
      };
      if (editUserForm.new_password && editUserForm.new_password.trim().length >= 6) {
        payload.password = editUserForm.new_password.trim();
      }
      const updatedUser = await api.updateAdminUser(editingUser.id, payload);
      setShowEditUserModal(false);
      setEditingUser(null);
      showToast(`Updated account details for ${editUserForm.email}`);
      if (updatedUser && updatedUser.id) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    try {
      await api.deleteAdminUser(userToDelete.id);
      showToast(`User account '${userToDelete.email}' deleted.`);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user account', 'error');
    }
  };

  /* =============================================================
     TAB 2: STRUCTURED CURRICULUM & SYLLABUS MANAGEMENT
  ============================================================= */
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [syllabusSemFilter, setSyllabusSemFilter] = useState('all');
  const [syllabusDeptFilter, setSyllabusDeptFilter] = useState('all');
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [expandedSubjectUnits, setExpandedSubjectUnits] = useState({});

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: null,
    code: '',
    name: '',
    department: 'Computer Application (BCA)',
    semester: 5,
    syllabus_overview: '',
    units: []
  });
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const data = await api.getSubjects({
        semester: syllabusSemFilter,
        department: syllabusDeptFilter,
        search: syllabusSearch
      });
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load curriculum subjects', 'error');
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'syllabus') {
      const timer = setTimeout(() => {
        loadSubjects();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentTab, syllabusSemFilter, syllabusDeptFilter, syllabusSearch]);

  const toggleSubjectUnitExpand = (subjId, unitIdx) => {
    const key = `${subjId}-${unitIdx}`;
    setExpandedSubjectUnits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openAddSubjectModal = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: null,
      code: '',
      name: '',
      department: syllabusDeptFilter !== 'all' ? syllabusDeptFilter : 'Computer Application (BCA)',
      semester: syllabusSemFilter !== 'all' ? parseInt(syllabusSemFilter) : 1,
      syllabus_overview: '',
      units: [
        { unit_number: 1, name: 'Unit 1: Fundamentals & Conceptual Overview', topics: ['Core Concepts', 'System Architecture'] },
        { unit_number: 2, name: 'Unit 2: Design Principles & Implementation', topics: ['Key Algorithms', 'Event Handling'] },
        { unit_number: 3, name: 'Unit 3: Data Management & Persistence', topics: ['Storage Models', 'Transactions'] },
        { unit_number: 4, name: 'Unit 4: Advanced Topics & Integration', topics: ['Network Protocols', 'Security Controls'] },
        { unit_number: 5, name: 'Unit 5: Applications, Case Studies & Projects', topics: ['Performance Analysis', 'Industry Deployment'] }
      ]
    });
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (s) => {
    setIsEditingSubject(true);
    const parsedUnits = normalizeUnits(s.recommended_topics);
    setSubjectForm({
      id: s.id,
      code: s.code || '',
      name: s.name || '',
      department: s.department || 'Computer Application (BCA)',
      semester: s.semester || 5,
      syllabus_overview: s.syllabus_overview || '',
      units: parsedUnits
    });
    setShowSubjectModal(true);
  };

  // Structured Unit Actions in Form
  const handleAddUnitToSubject = () => {
    setSubjectForm(prev => {
      const newNum = prev.units.length + 1;
      return {
        ...prev,
        units: [
          ...prev.units,
          {
            unit_number: newNum,
            name: `Unit ${newNum}: New Syllabus Module`,
            topics: ['Core Module Concepts', 'Applied Laboratory Practice']
          }
        ]
      };
    });
  };

  const handleRemoveUnitFromSubject = (unitIdx) => {
    setSubjectForm(prev => {
      const filtered = prev.units.filter((_, idx) => idx !== unitIdx);
      // Re-number units
      const renumbered = filtered.map((u, i) => ({
        ...u,
        unit_number: i + 1,
        name: u.name.replace(/^Unit\s+\d+:/i, `Unit ${i + 1}:`)
      }));
      return { ...prev, units: renumbered };
    });
  };

  const handleUnitNameChange = (unitIdx, newName) => {
    setSubjectForm(prev => {
      const nextUnits = [...prev.units];
      nextUnits[unitIdx] = { ...nextUnits[unitIdx], name: newName };
      return { ...prev, units: nextUnits };
    });
  };

  const handleAddTopicToUnit = (unitIdx) => {
    setSubjectForm(prev => {
      const nextUnits = [...prev.units];
      const curTopics = nextUnits[unitIdx].topics || [];
      nextUnits[unitIdx] = {
        ...nextUnits[unitIdx],
        topics: [...curTopics, `Topic ${curTopics.length + 1}`]
      };
      return { ...prev, units: nextUnits };
    });
  };

  const handleRemoveTopicFromUnit = (unitIdx, topicIdx) => {
    setSubjectForm(prev => {
      const nextUnits = [...prev.units];
      const curTopics = nextUnits[unitIdx].topics || [];
      nextUnits[unitIdx] = {
        ...nextUnits[unitIdx],
        topics: curTopics.filter((_, i) => i !== topicIdx)
      };
      return { ...prev, units: nextUnits };
    });
  };

  const handleTopicTextChange = (unitIdx, topicIdx, text) => {
    setSubjectForm(prev => {
      const nextUnits = [...prev.units];
      const curTopics = [...nextUnits[unitIdx].topics];
      curTopics[topicIdx] = text;
      nextUnits[unitIdx] = { ...nextUnits[unitIdx], topics: curTopics };
      return { ...prev, units: nextUnits };
    });
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setSavingSubject(true);
    try {
      const payload = {
        code: subjectForm.code.trim().toUpperCase(),
        name: subjectForm.name.trim(),
        department: subjectForm.department.trim(),
        semester: parseInt(subjectForm.semester),
        syllabus_overview: subjectForm.syllabus_overview.trim(),
        recommended_topics: subjectForm.units
      };

      if (isEditingSubject && subjectForm.id) {
        await api.updateSubject(subjectForm.id, payload);
        showToast(`Subject ${payload.code} updated with ${subjectForm.units.length} structured units.`);
      } else {
        await api.createSubject(payload);
        showToast(`New subject ${payload.code} configured with ${subjectForm.units.length} structured units.`);
      }
      setShowSubjectModal(false);
      loadSubjects();
    } catch (err) {
      showToast(err.message || 'Failed to save subject', 'error');
    } finally {
      setSavingSubject(false);
    }
  };

  const handleDeleteSubjectConfirm = async () => {
    if (!subjectToDelete) return;
    try {
      await api.deleteSubject(subjectToDelete.id);
      showToast(`Subject ${subjectToDelete.code} deleted.`);
      setSubjectToDelete(null);
      loadSubjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete subject', 'error');
    }
  };

  /* =============================================================
     TAB 3: EXAM PAPER FORMATS (ONLY 2 COLLEGE PAPERS: QUIZ & PRE-END)
  ============================================================= */
  const [paperFormats, setPaperFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(false);

  const [showFormatModal, setShowFormatModal] = useState(false);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [formatForm, setFormatForm] = useState({
    id: null,
    name: 'Quiz (30 Marks)',
    exam_type: 'quiz_30',
    total_marks: 30,
    time_allowed_minutes: 60,
    has_sets: true,
    paper_sets: ['Set A', 'Set B', 'Set C', 'Set D', 'Set E'],
    description: 'Departmental 30-mark quiz format administered across multiple paper sets.',
    sections_data: [
      { section_name: 'Part A (Short Analytical)', questions_count: 2, marks_per_q: 5, is_compulsory: true },
      { section_name: 'Part B (Technical Descriptive)', questions_count: 3, marks_per_q: 7, is_compulsory: true }
    ]
  });
  const [savingFormat, setSavingFormat] = useState(false);
  const [formatToDelete, setFormatToDelete] = useState(null);

  const loadPaperFormats = async () => {
    setLoadingFormats(true);
    try {
      const data = await api.getPaperFormats();
      // Filter strictly to the 2 college papers (quizzes and pre-end)
      const collegeFormats = Array.isArray(data) 
        ? data.filter(f => f.exam_type === 'quiz_30' || f.exam_type === 'pre_end_100')
        : [];
      setPaperFormats(collegeFormats);
    } catch (err) {
      console.error(err);
      showToast('Failed to load exam paper formats', 'error');
    } finally {
      setLoadingFormats(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'paper-formats') {
      loadPaperFormats();
    }
  }, [currentTab]);

  const openAddFormatModal = (type = 'quiz_30') => {
    setIsEditingFormat(false);
    if (type === 'pre_end_100') {
      setFormatForm({
        id: null,
        name: 'Pre-End Semester Examination (100 Marks)',
        exam_type: 'pre_end_100',
        total_marks: 100,
        time_allowed_minutes: 180,
        has_sets: false,
        paper_sets: [],
        description: 'Full-syllabus pre-end university mock examination managed internally by the college. 5 unit modules with choice questions.',
        sections_data: [
          { section_name: 'Part A - Compulsory Conceptual', questions_count: 5, marks_per_q: 6, is_compulsory: true },
          { section_name: 'Part B - Unit Choice Questions (Units I to V)', questions_count: 5, marks_per_q: 14, is_compulsory: false }
        ]
      });
    } else {
      setFormatForm({
        id: null,
        name: 'Quiz (30 Marks)',
        exam_type: 'quiz_30',
        total_marks: 30,
        time_allowed_minutes: 60,
        has_sets: true,
        paper_sets: ['Set A', 'Set B', 'Set C', 'Set D', 'Set E'],
        description: 'Departmental 30-mark quiz format administered across multiple paper sets.',
        sections_data: [
          { section_name: 'Part A (Short Analytical)', questions_count: 2, marks_per_q: 5, is_compulsory: true },
          { section_name: 'Part B (Technical Descriptive)', questions_count: 3, marks_per_q: 7, is_compulsory: true }
        ]
      });
    }
    setShowFormatModal(true);
  };

  const openEditFormatModal = (fmt) => {
    setIsEditingFormat(true);
    const sets = Array.isArray(fmt.paper_sets) ? fmt.paper_sets : [];
    setFormatForm({
      id: fmt.id,
      name: fmt.name || '',
      exam_type: fmt.exam_type || 'quiz_30',
      total_marks: fmt.total_marks || 30,
      time_allowed_minutes: fmt.time_allowed_minutes || 60,
      has_sets: !!fmt.has_sets,
      paper_sets: sets.length > 0 ? sets : ['Set A', 'Set B'],
      description: fmt.description || '',
      sections_data: Array.isArray(fmt.sections_data) && fmt.sections_data.length > 0 
        ? fmt.sections_data 
        : [{ section_name: 'Part A', questions_count: 2, marks_per_q: 5, is_compulsory: true }]
    });
    setShowFormatModal(true);
  };

  // Structured Paper Sets Actions in Form
  const handleAddPaperSet = () => {
    setFormatForm(prev => {
      const nextLetter = String.fromCharCode(65 + prev.paper_sets.length);
      return {
        ...prev,
        paper_sets: [...prev.paper_sets, `Set ${nextLetter}`]
      };
    });
  };

  const handleRemovePaperSet = (idx) => {
    setFormatForm(prev => ({
      ...prev,
      paper_sets: prev.paper_sets.filter((_, i) => i !== idx)
    }));
  };

  const handlePaperSetNameChange = (idx, newName) => {
    setFormatForm(prev => {
      const nextSets = [...prev.paper_sets];
      nextSets[idx] = newName;
      return { ...prev, paper_sets: nextSets };
    });
  };

  const handleAddSectionToForm = () => {
    setFormatForm(prev => ({
      ...prev,
      sections_data: [
        ...prev.sections_data,
        { section_name: `Part ${String.fromCharCode(65 + prev.sections_data.length)}`, questions_count: 3, marks_per_q: 5, is_compulsory: true }
      ]
    }));
  };

  const handleRemoveSectionFromForm = (idx) => {
    setFormatForm(prev => ({
      ...prev,
      sections_data: prev.sections_data.filter((_, i) => i !== idx)
    }));
  };

  const handleSectionFieldChange = (idx, field, value) => {
    setFormatForm(prev => {
      const nextSections = [...prev.sections_data];
      nextSections[idx] = { ...nextSections[idx], [field]: value };
      return { ...prev, sections_data: nextSections };
    });
  };

  const handleFormatSubmit = async (e) => {
    e.preventDefault();
    setSavingFormat(true);
    try {
      const payload = {
        name: formatForm.name.trim(),
        exam_type: formatForm.exam_type.trim(),
        total_marks: parseInt(formatForm.total_marks),
        time_allowed_minutes: parseInt(formatForm.time_allowed_minutes),
        has_sets: formatForm.has_sets,
        paper_sets: formatForm.has_sets ? formatForm.paper_sets : [],
        description: formatForm.description.trim(),
        sections_data: formatForm.sections_data
      };

      if (isEditingFormat && formatForm.id) {
        await api.updatePaperFormat(formatForm.id, payload);
        showToast(`Paper format '${payload.name}' updated.`);
      } else {
        await api.createPaperFormat(payload);
        showToast(`Paper blueprint '${payload.name}' configured.`);
      }
      setShowFormatModal(false);
      loadPaperFormats();
    } catch (err) {
      showToast(err.message || 'Failed to save paper format', 'error');
    } finally {
      setSavingFormat(false);
    }
  };

  const handleDeleteFormatConfirm = async () => {
    if (!formatToDelete) return;
    try {
      await api.deletePaperFormat(formatToDelete.id);
      showToast(`Paper format '${formatToDelete.name}' deleted.`);
      setFormatToDelete(null);
      loadPaperFormats();
    } catch (err) {
      showToast(err.message || 'Failed to delete paper format', 'error');
    }
  };

  /* =============================================================
     TAB 4: SYSTEM TELEMETRY
  ============================================================= */
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'telemetry') {
      loadStats();
    }
  }, [currentTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {toastMsg.text && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-md transition-all ${
          toastMsg.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastMsg.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold">{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg({ type: '', text: '' })} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}



      {/* =========================================================
          VIEW 1: USER ACCOUNT GOVERNANCE
      ========================================================= */}
      {currentTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters, Search & Add User */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, roll number (e.g. 2412044050108)..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {['all', 'student', 'faculty', 'admin'].map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => setUserRoleFilter(roleKey)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      userRoleFilter === roleKey
                        ? 'bg-white text-purple-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {roleKey === 'all' ? 'All Roles' : roleKey}
                  </button>
                ))}
              </div>

              <select
                value={userSemFilter}
                onChange={(e) => setUserSemFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* User Table Card */}
          <div className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Institutional User Directory ({users.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Roll numbers follow official university format (2412044050108) or campus ID (BC24099)
              </span>
            </div>

            {loadingUsers ? (
              <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600 animate-spin" />
                <span>Loading registered academic users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Users className="h-10 w-10 mx-auto text-slate-300" />
                <div className="text-sm font-bold text-slate-700">No users match your filter criteria</div>
                <p className="text-xs text-slate-400">Try clearing filters or search term.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Department / Program</th>
                      <th className="py-3.5 px-4">Academic ID / Roll Number</th>
                      <th className="py-3.5 px-4">Joined / Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isStudent = u.role === 'student';
                      const isFac = u.role === 'faculty';
                      const isAdm = u.role === 'admin';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200 shrink-0" />
                              ) : (
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs ${
                                  isAdm ? 'bg-purple-600' : isFac ? 'bg-emerald-600' : 'bg-indigo-600'
                                }`}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : (isAdm ? 'A' : isFac ? 'F' : 'S')}
                                </div>
                              )}
                              <div className="truncate max-w-[200px]">
                                <div className="font-bold text-slate-900 truncate">
                                  {u.name || (isAdm ? 'System Admin' : isFac ? 'Faculty Member' : 'Student')}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              isAdm 
                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                : isFac 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            <div className="truncate max-w-[220px]">
                              <span className="font-medium">{u.department || 'Computer Application (BCA)'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {isStudent ? (
                              <div className="space-y-0.5">
                                <span className="inline-block font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {u.roll_number || '2412044050108'}
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Sem {u.semester} • Sec {u.section || 'A'}
                                </div>
                              </div>
                            ) : isFac ? (
                              <div>
                                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  FAC-{String(u.id).padStart(4, '0')}
                                </span>
                                <div className="text-[11px] text-slate-500">Examiner / Faculty</div>
                              </div>
                            ) : (
                              <div>
                                <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  ADM-{String(u.id).padStart(4, '0')}
                                </span>
                                <div className="text-[11px] text-purple-600 font-semibold">Institutional Admin</div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-[11px] text-slate-600">
                              {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'Active'}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 transition-colors cursor-pointer"
                                title="Edit Account Details & Reset Password"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(u)}
                                disabled={u.id === user.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={u.id === user.id ? "Cannot delete your own admin account" : "Delete Account"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: STRUCTURED MULTI-SEMESTER CURRICULUM (SEM 1-6)
      ========================================================= */}
      {currentTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Filtering & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            {/* Row 1: Department Filter, Search & Add Subject */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Department Dropdown */}
                <div className="relative min-w-[240px]">
                  <select
                    value={syllabusDeptFilter}
                    onChange={(e) => setSyllabusDeptFilter(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Academic Departments</option>
                    <option value="Computer Application (BCA)">Computer Application (BCA)</option>
                    <option value="Computer Science & Engineering (B.Tech CSE)">Computer Science & Engg (B.Tech CSE)</option>
                    <option value="Information Technology (B.Tech IT)">Information Technology (B.Tech IT)</option>
                    <option value="Business Administration (BBA)">Business Administration (BBA)</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Instant Search Bar */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={syllabusSearch}
                    onChange={(e) => setSyllabusSearch(e.target.value)}
                    placeholder="Search subject title, code, or syllabus topics..."
                    className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                  {syllabusSearch && (
                    <button
                      onClick={() => setSyllabusSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={openAddSubjectModal}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subject & Units</span>
              </button>
            </div>

            {/* Row 2: Semester Filter Pills & Active Summary */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Semester:</span>
                <button
                  onClick={() => setSyllabusSemFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    syllabusSemFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Semesters
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSyllabusSemFilter(String(sem))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      syllabusSemFilter === String(sem)
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>

              {/* Results & Reset Indicator */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500">
                  {subjects.length} course{subjects.length === 1 ? '' : 's'} found
                </span>
                {(syllabusSemFilter !== 'all' || syllabusDeptFilter !== 'all' || syllabusSearch) && (
                  <button
                    onClick={() => {
                      setSyllabusSemFilter('all');
                      setSyllabusDeptFilter('all');
                      setSyllabusSearch('');
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          {loadingSubjects ? (
            <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600 animate-spin" />
              <span>Loading semester curricula...</span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
              <div>
                <div className="text-sm font-bold text-slate-700">No curriculum subjects found</div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {syllabusSemFilter !== 'all' || syllabusDeptFilter !== 'all' || syllabusSearch
                    ? 'No courses match your active department, semester, or search filter criteria.'
                    : 'No subjects have been provisioned in the academic catalog yet.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {(syllabusSemFilter !== 'all' || syllabusDeptFilter !== 'all' || syllabusSearch) && (
                  <button
                    onClick={() => {
                      setSyllabusSemFilter('all');
                      setSyllabusDeptFilter('all');
                      setSyllabusSearch('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
                <button
                  onClick={openAddSubjectModal}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Provision Subject Now
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s) => {
                const units = normalizeUnits(s.recommended_topics);
                const totalTopicsCount = units.reduce((acc, u) => acc + (Array.isArray(u.topics) ? u.topics.length : 0), 0);

                return (
                  <div key={s.id} className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-xs p-5 flex flex-col justify-between hover:border-purple-200 transition-colors">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                          {s.code}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.department?.includes('CSE')
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : s.department?.includes('IT')
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : s.department?.includes('BBA')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {s.department?.includes('(') ? s.department.split('(')[1].replace(')', '') : (s.department || 'BCA')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Sem {s.semester}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                          {s.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{s.department}</p>
                      </div>

                      {/* Syllabus Overview */}
                      {s.syllabus_overview && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {s.syllabus_overview}
                        </p>
                      )}

                      {/* Structured Units & Topics Breakdown */}
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                          <span>Syllabus Hierarchy</span>
                          <span className="text-purple-700 font-bold">{units.length} Units • {totalTopicsCount} Topics</span>
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                          {units.map((unit, unitIdx) => {
                            const isExpanded = !!expandedSubjectUnits[`${s.id}-${unitIdx}`];
                            const unitTopics = Array.isArray(unit.topics) ? unit.topics : [];

                            return (
                              <div key={unitIdx} className="rounded-xl border border-slate-200/80 bg-slate-50/60 overflow-hidden text-xs">
                                <div 
                                  onClick={() => toggleSubjectUnitExpand(s.id, unitIdx)}
                                  className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-bold text-[11px] text-slate-800 truncate">
                                      {unit.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                      {unitTopics.length} T
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="px-2.5 pb-2 pt-1 border-t border-slate-200/60 bg-white space-y-1">
                                    {unitTopics.length === 0 ? (
                                      <div className="text-[10px] text-slate-400 italic">No topics added to unit yet</div>
                                    ) : (
                                      unitTopics.map((top, tIdx) => (
                                        <div key={tIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                                          <span className="leading-snug">{top}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Subject Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={() => openEditSubjectModal(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Units & Topics</span>
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(s)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 3: COLLEGE EXAM BLUEPRINTS (ONLY 2 COLLEGE PAPERS)
      ========================================================= */}
      {currentTab === 'paper-formats' && (
        <div className="space-y-6">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-600" />
                <span>Official College Examination Blueprints</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official blueprints managed internally by the college: <strong className="text-slate-700 font-semibold">Quizzes (30 Marks)</strong> and <strong className="text-slate-700 font-semibold">Pre-End Semester (100 Marks)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddFormatModal('quiz_30')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Configure Quiz (30M)</span>
              </button>
              <button
                onClick={() => openAddFormatModal('pre_end_100')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Configure Pre-End (100M)</span>
              </button>
            </div>
          </div>

          {/* Paper Formats Grid */}
          {loadingFormats ? (
            <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600 animate-spin" />
              <span>Loading institutional paper blueprints...</span>
            </div>
          ) : paperFormats.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 bg-white">
              <FileCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-bold text-slate-700">No college blueprints found</div>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click below to initialize the official Quiz (30M) and Pre-End Semester (100M) blueprints.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => openAddFormatModal('quiz_30')}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Quiz Format
                </button>
                <button
                  onClick={() => openAddFormatModal('pre_end_100')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Pre-End Format
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paperFormats.map((fmt) => {
                const sections = Array.isArray(fmt.sections_data) ? fmt.sections_data : [];
                const totalQuestions = sections.reduce((acc, s) => acc + (parseInt(s.questions_count) || 0), 0);
                const sets = Array.isArray(fmt.paper_sets) ? fmt.paper_sets : [];

                return (
                  <div key={fmt.id} className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-xs p-6 flex flex-col justify-between hover:border-purple-200 transition-colors">
                    <div className="space-y-4">
                      {/* Format Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              {fmt.name}
                            </h3>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              {fmt.exam_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{fmt.description}</p>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-2xl font-black text-purple-700">{fmt.total_marks}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Total Marks</span>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Duration</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3 text-purple-600" />
                            <span>{fmt.time_allowed_minutes} mins</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Questions</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                            <Hash className="h-3 w-3 text-purple-600" />
                            <span>{totalQuestions || 'Variable'} Qs</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Paper Sets</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                            <Layers className="h-3 w-3 text-purple-600" />
                            <span>{fmt.has_sets ? `${sets.length || 'Multiple'} Sets` : 'Single Paper'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section-Wise Breakdown Table */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                          <span>Question Paper Structure</span>
                          <span>Marks Distribution</span>
                        </div>

                        <div className="space-y-1.5">
                          {sections.map((sec, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800">{sec.section_name}</div>
                                <div className="text-[10px] text-slate-500">
                                  {sec.is_compulsory ? 'Compulsory' : 'Choice Questions'}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-slate-900">
                                  {sec.questions_count} Qs × {sec.marks_per_q}M
                                </span>
                                <div className="text-[10px] font-bold text-purple-600">
                                  = {(parseInt(sec.questions_count) || 0) * (parseInt(sec.marks_per_q) || 0)} Marks
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Structured Sets list */}
                      {fmt.has_sets && sets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Administered Paper Sets ({sets.length}):
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {sets.map((setName, idx) => (
                              <span key={idx} className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
                                {setName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={() => openEditFormatModal(fmt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Structure & Sets</span>
                      </button>
                      <button
                        onClick={() => setFormatToDelete(fmt)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Format"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 4: SYSTEM TELEMETRY & INSTITUTIONAL INSIGHTS
      ========================================================= */}
      {currentTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Section 1: Core KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Students</span>
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_students || 0}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Enrolled Cohort</div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Faculty</span>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_faculty || 0}</div>
              <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Academic Mentors</div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Courses</span>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_subjects || 0}</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Across 4 Depts</div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Doubts</span>
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_conversations || 0}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats?.total_messages || 0} Messages</div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Resources</span>
                <Database className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_resources || 0}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Notes, PYQs & Syllabi</div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Assessments</span>
                <FileCheck className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{(stats?.total_quizzes || 0) + (stats?.total_records || 0)}</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Quizzes & Exam Sets</div>
            </div>
          </div>

          {/* Section 2: Academic Department Distribution */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <span>Academic Department Distribution & Curricular Breadth</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Curriculum depth, course mappings, and active student enrolment by department</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {stats?.department_distribution?.length || 4} Departments Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(stats?.department_distribution || []).map((dept, idx) => {
                const totalSubs = stats?.total_subjects || 1;
                const pct = Math.round(((dept.subjects || 0) / totalSubs) * 100);
                const shortCode = dept.department.includes('(')
                  ? dept.department.split('(')[1].replace(')', '')
                  : dept.department;

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono">
                        {shortCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {dept.students} student{dept.students === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1" title={dept.department}>
                        {dept.department}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {dept.subjects} courses provisioned ({pct}%)
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: AI Doubt Inquiries & Mode Preferences (2-Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Inquired Subjects */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    <span>Top Inquired Subjects by Students</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Subjects generating the highest student doubts and queries</p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>

              {(!stats?.top_doubt_subjects || stats.top_doubt_subjects.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No subject inquiry trends recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.top_doubt_subjects.map((item, idx) => {
                    const topCount = stats.top_doubt_subjects[0]?.count || 1;
                    const barWidth = Math.round((item.count / topCount) * 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                              {item.subject__code}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {item.subject__name}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">
                            {item.count} doubt{item.count === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cognitive Mode Breakdown */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span>Student Explanation Mode Adoption</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Breakdown of cognitive explanation styles requested during learning</p>
                </div>
              </div>

              {(!stats?.mode_usage || stats.mode_usage.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No mode telemetry recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.mode_usage.map((m, idx) => {
                    const totalModes = stats.mode_usage.reduce((acc, curr) => acc + curr.count, 0) || 1;
                    const pct = Math.round((m.count / totalModes) * 100);
                    const modeLabels = {
                      detailed: 'Detailed Academic Explanation',
                      assist: 'Guided Assist & Socratic Research',
                      eli5: 'Simplified / Conceptual (ELI5)',
                      exam: 'Exam & Marking Blueprint',
                      summary: 'Quick Unit Revision'
                    };
                    const label = modeLabels[m.mode_used] || m.mode_used;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{label}</span>
                          <span className="text-[11px] font-bold text-slate-600">
                            {m.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Live Activity Stream & System Telemetry (2-Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Live Institutional Activity Feed */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Recent Institutional Activity Stream</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {(!stats?.recent_activities || stats.recent_activities.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent activities recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {stats.recent_activities.map((act, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                        {act.type === 'user_registration' ? (
                          <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">{act.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatRelativeTime(act.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infrastructure & Privacy Governance */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-600" />
                <span>Institutional Infrastructure & Privacy Governance</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Database Core</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stats?.system_health?.database_status || 'Operational (PostgreSQL / SQLite)'}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Security & Authentication Subsystem</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stats?.system_health?.auth_status || 'Active (Argon2 / JWT Session Guard)'}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Secured
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">AI Inference Engine Target</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stats?.system_health?.active_model || 'qwen2.5:3b'}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Online
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Institutional Data Privacy</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Strict compliance with institutional privacy standards</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS
      ========================================================= */}

      {/* MODAL 1: CREATE USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Create Academic Account</h3>
              </div>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar or Ananya Sharma"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email (College Login) <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="user@college.edu"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Password <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Conditional Fields for Student */}
              {newUserForm.role === 'student' && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">Semester</label>
                    <select
                      value={newUserForm.semester}
                      onChange={(e) => setNewUserForm({ ...newUserForm, semester: parseInt(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6].map((sem) => (
                        <option key={sem} value={sem}>Sem {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">Section</label>
                    <input
                      type="text"
                      value={newUserForm.section}
                      onChange={(e) => setNewUserForm({ ...newUserForm, section: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Roll Number / ID
                    </label>
                    <input
                      type="text"
                      placeholder="2412044050108 or BC24099"
                      value={newUserForm.roll_number}
                      onChange={(e) => setNewUserForm({ ...newUserForm, roll_number: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER & RESET PASSWORD */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Account & Reset Password</h3>
              </div>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={editUserForm.department}
                  onChange={(e) => setEditUserForm({ ...editUserForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              {/* Conditional Fields for Student */}
              {editUserForm.role === 'student' && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">Semester</label>
                    <select
                      value={editUserForm.semester}
                      onChange={(e) => setEditUserForm({ ...editUserForm, semester: parseInt(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6].map((sem) => (
                        <option key={sem} value={sem}>Sem {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">Section</label>
                    <input
                      type="text"
                      value={editUserForm.section}
                      onChange={(e) => setEditUserForm({ ...editUserForm, section: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">Roll Number / ID</label>
                    <input
                      type="text"
                      placeholder="2412044050108 or BC24099"
                      value={editUserForm.roll_number}
                      onChange={(e) => setEditUserForm({ ...editUserForm, roll_number: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Reset Password Box */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-purple-600" />
                    <span>Reset User Password</span>
                  </label>
                  <span className="text-[10px] text-purple-600">Leave blank to keep unchanged</span>
                </div>
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 chars)"
                  value={editUserForm.new_password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, new_password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-purple-200 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {updatingUser ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete account <span className="font-mono font-bold text-slate-700">{userToDelete.email}</span>? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUserConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD / EDIT SUBJECT & STRUCTURED UNITS */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isEditingSubject ? 'Edit Subject & Structured Units' : 'Add Subject & Units'}
                </h3>
              </div>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject Code <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA-501 / CS-402"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono uppercase focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department <span className="text-rose-500">*</span></label>
                  <select
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Computer Application (BCA)">Computer Application (BCA)</option>
                    <option value="Computer Science & Engineering (B.Tech CSE)">Computer Science & Engg (B.Tech CSE)</option>
                    <option value="Information Technology (B.Tech IT)">Information Technology (B.Tech IT)</option>
                    <option value="Business Administration (BBA)">Business Administration (BBA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile Computing & Android Development"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Syllabus Overview & Description</label>
                <textarea
                  rows="2"
                  placeholder="Enter high-level course objectives, prerequisites, and learning outcomes..."
                  value={subjectForm.syllabus_overview}
                  onChange={(e) => setSubjectForm({ ...subjectForm, syllabus_overview: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Structured Units & Topics Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Structured Syllabus Units & Topics</span>
                    <span className="text-[10px] text-slate-500">Configure modular units and specific topics taught in each module</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUnitToSubject}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Unit</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {subjectForm.units.map((unit, unitIdx) => (
                    <div key={unitIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 shrink-0">
                            Unit {unit.unit_number || unitIdx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Unit Title / Module Name"
                            value={unit.name}
                            onChange={(e) => handleUnitNameChange(unitIdx, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {subjectForm.units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnitFromSubject(unitIdx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="Remove this Unit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Topics for this unit */}
                      <div className="pl-3 border-l-2 border-purple-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Unit Topics</span>
                          <button
                            type="button"
                            onClick={() => handleAddTopicToUnit(unitIdx)}
                            className="text-[10px] font-bold text-purple-700 hover:text-purple-800 cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Topic</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          {(unit.topics || []).map((topic, topicIdx) => (
                            <div key={topicIdx} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{topicIdx + 1}.</span>
                              <input
                                type="text"
                                required
                                placeholder="Topic name (e.g. Activity Lifecycle & States)"
                                value={topic}
                                onChange={(e) => handleTopicTextChange(unitIdx, topicIdx, e.target.value)}
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-purple-500"
                              />
                              {(unit.topics || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTopicFromUnit(unitIdx, topicIdx)}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                                  title="Remove Topic"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSubject}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingSubject ? 'Saving...' : (isEditingSubject ? 'Save Structured Syllabus' : 'Add Subject & Units')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE SUBJECT CONFIRMATION */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Subject?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-700">{subjectToDelete.code} - {subjectToDelete.name}</span>? All associated student records and units will be removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubjectConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIGURE EXAM PAPER BLUEPRINT (STRUCTURED SETS) */}
      {showFormatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isEditingFormat ? 'Edit College Blueprint & Sets' : 'Configure College Exam Blueprint'}
                </h3>
              </div>
              <button onClick={() => setShowFormatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormatSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Blueprint Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formatForm.name}
                    onChange={(e) => setFormatForm({ ...formatForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Exam Type Code</label>
                  <select
                    value={formatForm.exam_type}
                    onChange={(e) => setFormatForm({ ...formatForm, exam_type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="quiz_30">quiz_30 (Quiz - 30 Marks)</option>
                    <option value="pre_end_100">pre_end_100 (Pre-End Semester Exam - 100 Marks)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Marks <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={formatForm.total_marks}
                    onChange={(e) => setFormatForm({ ...formatForm, total_marks: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-black focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    required
                    value={formatForm.time_allowed_minutes}
                    onChange={(e) => setFormatForm({ ...formatForm, time_allowed_minutes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Multiple Sets</label>
                  <select
                    value={formatForm.has_sets ? 'yes' : 'no'}
                    onChange={(e) => setFormatForm({ ...formatForm, has_sets: e.target.value === 'yes' })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="yes">Yes (Set A, B...)</option>
                    <option value="no">Single Paper</option>
                  </select>
                </div>
              </div>

              {/* Structured Paper Sets Manager */}
              {formatForm.has_sets && (
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-950 block">Paper Sets Configuration</span>
                      <span className="text-[10px] text-purple-700">Add or remove individual question paper sets</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPaperSet}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Set</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {formatForm.paper_sets.map((setName, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 p-1 px-2.5 rounded-xl bg-white border border-purple-200 shadow-2xs">
                        <Layers className="h-3 w-3 text-purple-600" />
                        <input
                          type="text"
                          required
                          value={setName}
                          onChange={(e) => handlePaperSetNameChange(idx, e.target.value)}
                          className="w-20 text-xs font-mono font-bold text-purple-900 border-none bg-transparent focus:outline-none"
                        />
                        {formatForm.paper_sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePaperSet(idx)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove Set"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Blueprint Guidelines & Instructions</label>
                <textarea
                  rows="2"
                  placeholder="Specify rules for faculty paper setters, compulsory sections, and student evaluation guidelines..."
                  value={formatForm.description}
                  onChange={(e) => setFormatForm({ ...formatForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Dynamic Section Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Question Structure & Marks Allocation</span>
                    <span className="text-[10px] text-slate-500">Configure parts, question counts, and marks per question</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSectionToForm}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Part</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formatForm.sections_data.map((sec, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Part / Section Name</label>
                        <input
                          type="text"
                          required
                          value={sec.section_name}
                          onChange={(e) => handleSectionFieldChange(idx, 'section_name', e.target.value)}
                          placeholder="e.g. Part A"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Questions</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={sec.questions_count}
                          onChange={(e) => handleSectionFieldChange(idx, 'questions_count', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-bold"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Marks/Q</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={sec.marks_per_q}
                          onChange={(e) => handleSectionFieldChange(idx, 'marks_per_q', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4 sm:pt-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!sec.is_compulsory}
                            onChange={(e) => handleSectionFieldChange(idx, 'is_compulsory', e.target.checked)}
                            className="rounded text-purple-600"
                          />
                          <span>Compulsory</span>
                        </label>

                        {formatForm.sections_data.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSectionFromForm(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Part"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFormat}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingFormat ? 'Saving...' : (isEditingFormat ? 'Update Blueprint' : 'Save Blueprint')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE FORMAT CONFIRMATION */}
      {formatToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Paper Blueprint?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove blueprint <span className="font-bold text-slate-700">{formatToDelete.name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setFormatToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFormatConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
