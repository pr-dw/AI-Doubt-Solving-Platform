const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('access_token');
export const setAuthToken = (token) => localStorage.setItem('access_token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
};

export const getStoredUser = () => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const setStoredUser = (user) => {
  localStorage.setItem('user_data', JSON.stringify(user));
};

export const AI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash (Cloud API)', shortName: 'Gemini 1.5 Flash', provider: 'Google DeepMind', badge: 'Cloud Fast', type: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro (Cloud API)', shortName: 'Gemini 1.5 Pro', provider: 'Google DeepMind', badge: 'Cloud Adv', type: 'gemini' },
  { id: 'ollama:qwen', name: 'Ollama Qwen 2.5 (Local Model)', shortName: 'Ollama Qwen 2.5', provider: 'Local / On-Device', badge: 'Local Ollama', type: 'ollama' },
  { id: 'ollama:gemma', name: 'Ollama Gemma 2 (Local Model)', shortName: 'Ollama Gemma 2', provider: 'Local / On-Device', badge: 'Local Ollama', type: 'ollama' },
  { id: 'gpt-4o-mini', name: 'OpenAI ChatGPT-4o Mini (Cloud API)', shortName: 'ChatGPT-4o Mini', provider: 'OpenAI', badge: 'Cloud GPT', type: 'gpt' },
];

export const getStoredAIModel = () => {
  return localStorage.getItem('selected_ai_model') || 'gemini-1.5-flash';
};

export const setStoredAIModel = (modelId) => {
  localStorage.setItem('selected_ai_model', modelId);
  window.dispatchEvent(new CustomEvent('ai-model-change', { detail: modelId }));
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const selectedModel = getStoredAIModel();
  const headers = {
    'Content-Type': 'application/json',
    'X-Selected-AI-Model': selectedModel,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Token expired or invalid
      // Only clear if we were trying an authenticated request
      if (token && !endpoint.includes('/auth/login')) {
        clearAuthToken();
        window.dispatchEvent(new Event('auth-change'));
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || Object.values(data)[0] || 'API request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.tokens?.access) {
      setAuthToken(data.tokens.access);
      setStoredUser(data.user);
      window.dispatchEvent(new Event('auth-change'));
    }
    return data;
  },

  register: async (userData) => {
    const data = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.tokens?.access) {
      setAuthToken(data.tokens.access);
      setStoredUser(data.user);
      window.dispatchEvent(new Event('auth-change'));
    }
    return data;
  },

  getProfile: () => request('/auth/me/'),
  updateProfile: (data) => request('/auth/me/', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (current_password, new_password, confirm_password) =>
    request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    }),

  // Local Private File Uploads (Images and PDFs)
  uploadFile: async (file, type = 'general') => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload/', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'File upload failed');
    }
    return data;
  },

  // Subjects & Analytics
  getSubjects: () => request('/subjects/'),
  getAcademicRecords: () => request('/academic/records/'),
  getAnalyticsReport: () => request('/analytics/report/'),

  // AI Doubt Solver
  askDoubt: (query, mode = 'detailed', conversation_id = null, model = null) =>
    request('/ai/query/', {
      method: 'POST',
      body: JSON.stringify({ query, mode, conversation_id, model: model || getStoredAIModel() }),
    }),

  getAIModels: () => request('/ai/models/'),

  getConversations: () => request('/ai/conversations/'),
  getConversationDetail: (id) => request(`/ai/conversations/${id}/`),
  deleteConversation: (id) => request(`/ai/conversations/${id}/`, { method: 'DELETE' }),
  toggleBookmark: (id) => request(`/ai/conversations/${id}/bookmark/`, { method: 'POST' }),

  // AI Learning Assistant
  summarizeTopic: (topic, subject_id) =>
    request('/ai/summarize/', {
      method: 'POST',
      body: JSON.stringify({ topic, subject_id }),
    }),

  // Personalised Study Order & Exams
  getStudyOrder: (subject_id = null, exam_id = null, student_id = null) => {
    const params = new URLSearchParams();
    if (subject_id) params.append('subject_id', subject_id);
    if (exam_id) params.append('exam_id', exam_id);
    if (student_id) params.append('student_id', student_id);
    return request(`/study-order/?${params.toString()}`);
  },

  getExams: (subject_id = null, semester = null) => {
    const params = new URLSearchParams();
    if (subject_id) params.append('subject_id', subject_id);
    if (semester) params.append('semester', semester);
    return request(`/exams/?${params.toString()}`);
  },

  getExamDetail: (id) => request(`/exams/${id}/`),

  createExam: (examData) =>
    request('/exams/', {
      method: 'POST',
      body: JSON.stringify(examData),
    }),

  uploadExamScores: (examId, scoreData) =>
    request(`/exams/${examId}/scores/`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    }),

  getStudents: (semester = null) => {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    return request(`/students/?${params.toString()}`);
  },

  analyzeExamPdf: async (formData) => {
    const token = getAuthToken();
    const selectedModel = getStoredAIModel();
    if (!formData.has('model')) {
      formData.append('model', selectedModel);
    }
    const headers = {
      'X-Selected-AI-Model': selectedModel,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const res = await fetch(`${BASE_URL}/exams/analyze-pdf/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.message || 'Failed to analyze exam PDF.');
    return data;
  },

  // Resources
  getResources: (subject = '', type = '', query = '') => {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (type) params.append('type', type);
    if (query) params.append('q', query);
    return request(`/resources/?${params.toString()}`);
  },

  // Study Planner
  getStudyGoals: () => request('/study/goals/'),
  createStudyGoal: (data) => request('/study/goals/', { method: 'POST', body: JSON.stringify(data) }),
  toggleStudyGoal: (id) => request(`/study/goals/${id}/toggle/`, { method: 'PATCH' }),

  // Quizzes
  getQuizzes: (subject_id = '', difficulty = '') => {
    const params = new URLSearchParams();
    if (subject_id) params.append('subject_id', subject_id);
    if (difficulty) params.append('difficulty', difficulty);
    return request(`/quizzes/?${params.toString()}`);
  },

  getQuizDetail: (id) => request(`/quizzes/${id}/`),
  submitQuiz: (id, answers, time_spent_seconds) =>
    request(`/quizzes/${id}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers, time_spent_seconds }),
    }),

  // Notifications
  getNotifications: () => request('/notifications/'),
  markNotificationRead: (id) => request(`/notifications/${id}/read/`, { method: 'POST' }),

  // Search & Admin
  globalSearch: (q) => request(`/search/?q=${encodeURIComponent(q)}`),
  getAdminStats: () => request('/admin/stats/'),
  getHealth: () => request('/health/'),
};
