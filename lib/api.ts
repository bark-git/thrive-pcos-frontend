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

// Handle 401 responses (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Check if user was logged in (has token)
      const wasLoggedIn = localStorage.getItem('token');
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Set session expired flag if user was logged in
      if (wasLoggedIn) {
        sessionStorage.setItem('sessionExpired', 'true');
      }
      
      // Redirect to login page (only if not already there)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

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
  },
  
  checkOnboarding: async () => {
    try {
      const res = await api.get('/auth/check-onboarding');
      return res.data;
    } catch (err) {
      return { needsOnboarding: false };
    }
  },
  
  completeOnboarding: async (data: {
    diagnosisStatus?: string;
    diagnosisDate?: string;
    phenotype?: string;
    primaryConcerns?: string[];
    goals?: string[];
  }) => {
    const res = await api.post('/auth/complete-onboarding', data);
    return res.data;
  }
};

// Mood
export const mood = {
  create: async (data: Omit<MoodEntry, 'id'> & { updateExisting?: boolean }) => {
    const res = await api.post('/mood', data);
    return res.data;
  },
  
  getTodayEntry: async () => {
    const res = await api.get('/mood/today');
    return res.data as { hasEntry: boolean; entry: MoodEntry | null };
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

// Symptom
export const symptom = {
  create: async (data: {
    symptomType: string;
    severity: number;
    location?: string;
    notes?: string;
    otherSymptom?: string;
  }) => {
    const res = await api.post('/symptom', data);
    return res.data.symptomEntry;
  },
  
  getAll: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    symptomType?: string;
    limit?: number 
  }) => {
    const res = await api.get('/symptom', { params });
    return res.data.symptoms;
  },
  
  getStats: async (period: number = 30) => {
    const res = await api.get('/symptom/stats', { params: { period } });
    return res.data.stats;
  },
  
  update: async (id: string, data: {
    symptomType: string;
    severity: number;
    location?: string;
    notes?: string;
    otherSymptom?: string;
  }) => {
    const res = await api.put(`/symptom/${id}`, data);
    return res.data.symptomEntry;
  },
  
  delete: async (id: string) => {
    const res = await api.delete(`/symptom/${id}`);
    return res.data;
  }
};

// User Profile
export const user = {
  getProfile: async () => {
    const res = await api.get('/user/profile');
    return res.data.user;
  },
  
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    timezone?: string;
  }) => {
    const res = await api.put('/user/profile', data);
    return res.data.user;
  },
  
  getNotificationSettings: async () => {
    const res = await api.get('/user/notification-settings');
    return res.data.settings;
  },
  
  updateNotificationSettings: async (settings: any) => {
    const res = await api.put('/user/notification-settings', settings);
    return res.data.settings;
  },
  
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const res = await api.post('/user/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return res.data;
  },
  
  getStats: async () => {
    const res = await api.get('/user/stats');
    return res.data.stats;
  },
  
  deleteAccount: async () => {
    const res = await api.delete('/user/account');
    return res.data;
  }
};

// Analytics
export interface MoodTrendData {
  date: string;
  moodScore: number;
  energyLevel?: string;
  cyclePhase?: string;
  cycleDay?: number;
}

export interface CorrelationInsight {
  type: 'mood' | 'symptom';
  finding: string;
  phase: string;
  value: number;
  comparison?: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface UnlockProgress {
  unlocked: boolean;
  current: number;
  threshold: number;
  remaining: number;
  label: string;
}

export const analytics = {
  getMoodTrends: async (days: number = 14) => {
    const res = await api.get('/analytics/mood-trends', { params: { days } });
    return res.data;
  },

  getCorrelations: async () => {
    const res = await api.get('/analytics/correlations');
    return res.data;
  },

  getInsights: async () => {
    const res = await api.get('/analytics/insights');
    return res.data;
  },

  getPhaseSummary: async () => {
    const res = await api.get('/analytics/phase-summary');
    return res.data;
  }
};

// Data Export
export const exportData = {
  moodCSV: async (range: string = 'all') => {
    const res = await api.get(`/export/mood/csv?range=${range}`, { responseType: 'blob' });
    return res.data;
  },
  
  symptomsCSV: async (range: string = 'all') => {
    const res = await api.get(`/export/symptoms/csv?range=${range}`, { responseType: 'blob' });
    return res.data;
  },
  
  allCSV: async (range: string = 'all') => {
    const res = await api.get(`/export/all/csv?range=${range}`, { responseType: 'blob' });
    return res.data;
  },
  
  moodPDF: async (range: string = 'all') => {
    const res = await api.get(`/export/mood/pdf?range=${range}`, { responseType: 'blob' });
    return res.data;
  },
  
  symptomsPDF: async (range: string = 'all') => {
    const res = await api.get(`/export/symptoms/pdf?range=${range}`, { responseType: 'blob' });
    return res.data;
  },
  
  allPDF: async (range: string = 'all') => {
    const res = await api.get(`/export/all/pdf?range=${range}`, { responseType: 'blob' });
    return res.data;
  }
};

export default api;
