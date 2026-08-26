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
  list: () => api.get('/challenges').then((r) => r.data),
  create: (data) => api.post('/challenges', data).then((r) => r.data),
  submit: (data) => api.post('/challenges/submit', data).then((r) => r.data),
  leaderboard: (id) => api.get(`/challenges/${id}/leaderboard`).then((r) => r.data),
};

export const copilotApi = {
  chat: (session_id, message) => api.post('/copilot/chat', { session_id, message }).then((r) => r.data),
  history: (session_id) => api.get(`/copilot/history/${session_id}`).then((r) => r.data),
};

export const saveSession = (token, user) => {
  localStorage.setItem('ltc_token', token);
  localStorage.setItem('ltc_user', JSON.stringify(user));
};

export const getSession = () => {
  const token = localStorage.getItem('ltc_token');
  const userStr = localStorage.getItem('ltc_user');
  return { token, user: userStr ? JSON.parse(userStr) : null };
};

export const clearSession = () => {
  localStorage.removeItem('ltc_token');
  localStorage.removeItem('ltc_user');
};
