import axios from 'axios';

// Use the Next.js proxy instead of calling backend directly
const API_URL = '/api/proxy';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  subscriptionTier: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  moodScore: number;
  phq2_1?: number;
  phq2_2?: number;
  gad2_1?: number;
  gad2_2?: number;
  energyLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  anxietyLevel?: 'NONE' | 'LITTLE' | 'VERY';
  notes?: string;
}

export interface MoodStats {
  averageMood: number;
  totalEntries: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  depressionRisk: { score: string; risk: string } | null;
  anxietyRisk: { score: string; risk: string } | null;
}

// Auth
export const auth = {
  register: async (data: { email: string; password: string; firstName: string; lastName?: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.session?.access_token) {
      localStorage.setItem('token', res.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Mood
export const mood = {
  create: async (data: Omit<MoodEntry, 'id'>) => {
    const res = await api.post('/mood', data);
    return res.data.moodEntry as MoodEntry;
  },
  
  getAll: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const res = await api.get('/mood', { params });
    return res.data.moodEntries as MoodEntry[];
  },
  
  getStats: async (period: number = 7) => {
    const res = await api.get('/mood/stats', { params: { period } });
    return res.data.stats as MoodStats;
  }
};

export default api;
