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

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
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
  askDoubt: (query, mode = 'detailed', subject_id = null, conversation_id = null, model = 'gemini-1.5-flash') =>
    request('/ai/query/', {
      method: 'POST',
      body: JSON.stringify({ query, mode, subject_id, conversation_id, model }),
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

  getRoadmap: (subject_id) =>
    request('/ai/roadmap/', {
      method: 'POST',
      body: JSON.stringify({ subject_id }),
    }),

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
