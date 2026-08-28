import axios from 'axios';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ltc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  sendOtp: (email, name) => api.post('/auth/send-otp', { email, name }).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const profileApi = {
  getStudentProfile: () => api.get('/profile/student').then((r) => r.data),
  updateStudentProfile: (data) => api.put('/profile/student', data).then((r) => r.data),
  getCompanyProfile: () => api.get('/profile/company').then((r) => r.data),
  updateCompanyProfile: (data) => api.put('/profile/company', data).then((r) => r.data),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data),
  updateProgress: (data) => api.post('/dashboard/progress', data).then((r) => r.data),
  listTalents: () => api.get('/talents').then((r) => r.data),
  scheduleInterview: (data) => api.post('/interviews/schedule', data).then((r) => r.data),
  addEndorsement: (data) => api.post('/endorsements', data).then((r) => r.data),
};

export const assessmentApi = {
  skills: () => api.get('/assessments/skills').then((r) => r.data),
  start: (skill) => api.post('/assessments/start', { skill }).then((r) => r.data),
  submit: (payload) => api.post('/assessments/submit', payload).then((r) => r.data),
  my: () => api.get('/assessments/my').then((r) => r.data),
};

export const challengeApi = {
  list: (params = {}) => api.get('/challenges', { params }).then((r) => r.data),
  getRecommended: () => api.get('/challenges/recommended').then((r) => r.data),
  getDetails: (id) => api.get(`/challenges/${id}`).then((r) => r.data),
  create: (data) => api.post('/challenges', data).then((r) => r.data),
  apply: (id, notes) => api.post(`/challenges/${id}/apply`, { notes }).then((r) => r.data),
  submitSolution: (id, data) => api.post(`/challenges/${id}/submit`, data).then((r) => r.data),
  submit: (data) => api.post('/challenges/submit', data).then((r) => r.data),
  leaderboard: (id) => api.get(`/challenges/${id}/leaderboard`).then((r) => r.data),
  getApplicants: (id, params = {}) => api.get(`/challenges/${id}/applicants`, { params }).then((r) => r.data),
  updateStatus: (appId, status, notes) => api.post(`/applications/${appId}/status`, { status, notes }).then((r) => r.data),
  evaluate: (appId, data) => api.post(`/applications/${appId}/evaluate`, data).then((r) => r.data),
  myApplications: () => api.get('/applications/my').then((r) => r.data),
};

export const analyticsApi = {
  college: () => api.get('/analytics/college').then((r) => r.data),
};

export const leaderboardApi = {
  get: (params = {}) => api.get('/leaderboard', { params }).then((r) => r.data),
  syncLeetcode: (username) => api.post('/profile/leetcode/sync', { username }).then((r) => r.data),
};

export const eventsApi = {
  list: (params = {}) => api.get('/events', { params }).then((r) => r.data),
};

export const supportApi = {
  createTicket: (data) => api.post('/support/tickets', data).then((r) => r.data),
  getTickets: () => api.get('/support/tickets').then((r) => r.data),
};

export const adminApi = {
  getVerifications: () => api.get('/admin/verifications').then((r) => r.data),
  verifyCompany: (userId, status) => api.post('/admin/verify-company', { user_id: userId, status }).then((r) => r.data),
  verifyChallenge: (challId, status) => api.post('/admin/verify-challenge', { challenge_id: challId, status }).then((r) => r.data),
};

export const copilotApi = {
  chat: (session_id, message) => api.post('/copilot/chat', { session_id, message }).then((r) => r.data),
  history: (session_id) => api.get(`/copilot/history/${session_id}`).then((r) => r.data),
};

export const saveSession = (token, user) => {
  if (token) localStorage.setItem('ltc_token', token);
  if (user) localStorage.setItem('ltc_user', JSON.stringify(user));
};

export const getSession = () => {
  try {
    const token = localStorage.getItem('ltc_token');
    const userStr = localStorage.getItem('ltc_user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return { token: token || null, user: null };
    }
    const user = JSON.parse(userStr);
    return { token: token || null, user: user && typeof user === 'object' ? user : null };
  } catch (e) {
    return { token: null, user: null };
  }
};

export const clearSession = () => {
  localStorage.removeItem('ltc_token');
  localStorage.removeItem('ltc_user');
};
