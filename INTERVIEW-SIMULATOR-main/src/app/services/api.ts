const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    console.log(`📥 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error(`❌ API Error:`, error);
      throw new Error(error.error || error.msg || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ message: string; token: string; user: { id: string; name: string; email: string } }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ message: string; token: string; user: { id: string; name: string; email: string; avatar?: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return this.request<{ _id: string; name: string; email: string; avatar?: string }>('/auth/profile');
  }

  async updateProfile(updates: { name?: string; avatar?: string }) {
    return this.request<{ _id: string; name: string; email: string; avatar?: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async getResumes(): Promise<any[]> {
    return this.request<any[]>('/resume');
  }

  async getResume(id: string): Promise<any> {
    return this.request<any>(`/resume/${id}`);
  }

  async parseResume(id: string): Promise<any> {
    return this.request<any>(`/resume/${id}/parse`, { method: 'POST' });
  }

  async updateResume(id: string, updates: any): Promise<any> {
    return this.request<any>(`/resume/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteResume(id: string): Promise<void> {
    await this.request(`/resume/${id}`, { method: 'DELETE' });
  }

  async createInterview(data: any): Promise<any> {
    return this.request<any>('/interview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInterviews(status?: string): Promise<any[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<any[]>(`/interview${query}`);
  }

  async getInterview(id: string): Promise<any> {
    return this.request<any>(`/interview/${id}`);
  }

  async generateQuestions(interviewId: string): Promise<any[]> {
    return this.request<any[]>(`/interview/${interviewId}/questions`, { method: 'POST' });
  }

  async startInterview(interviewId: string, cameraVerified: boolean): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/start`, {
      method: 'POST',
      body: JSON.stringify({ cameraVerified }),
    });
  }

  async submitAnswer(interviewId: string, answer: any): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  }

  async completeInterview(interviewId: string): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/complete`, { method: 'POST' });
  }

  async getNextQuestion(interviewId: string): Promise<any | null> {
    return this.request<any | null>(`/interview/${interviewId}/next-question`);
  }

  async getAdaptiveQuestion(interviewId: string, previousAnswer: string): Promise<any | null> {
    return this.request<any | null>(`/interview/${interviewId}/adaptive-question`, {
      method: 'POST',
      body: JSON.stringify({ previousAnswer }),
    });
  }

  async evaluateCode(interviewId: string, code: string, language: string, testCases?: any[]): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/evaluate-code`, {
      method: 'POST',
      body: JSON.stringify({ code, language, testCases }),
    });
  }

  async getIntroduction(interviewId: string): Promise<{ introduction: string }> {
    return this.request<{ introduction: string }>(`/interview/${interviewId}/introduction`);
  }

  async getFeedback(interviewId: string, questionIndex: number, answer: string, speechAnalysis?: any, facialAnalysis?: any): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ questionIndex, answer, speechAnalysis, facialAnalysis }),
    });
  }

  async evaluateCodeAI(interviewId: string, code: string, language: string, questionIndex: number): Promise<any> {
    return this.request<any>(`/interview/${interviewId}/evaluate-code-ai`, {
      method: 'POST',
      body: JSON.stringify({ code, language, questionIndex }),
    });
  }

  async regenerateQuestions(interviewId: string): Promise<any[]> {
    return this.request<any[]>(`/interview/${interviewId}/regenerate-questions`, {
      method: 'POST',
    });
  }
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ParsedData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  skills: string[];
  technicalSkills: string[];
  softSkills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
    grade?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    isCurrent?: boolean;
  }>;
  internships: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year?: string;
    url?: string;
  }>;
  languages: string[];
  summary: string;
  isFresher: boolean;
}

export interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  filePath?: string;
  parsedData?: ParsedData;
  summary?: string;
  suggestions?: string[];
  isProcessed: boolean;
  createdAt?: string;
}

export interface Question {
  text: string;
  category: string;
  type: 'technical' | 'behavioral' | 'coding';
  expectedDuration?: number;
  difficulty?: number;
  focus?: string;
  isIntro?: boolean;
}

export interface Interview {
  _id: string;
  userId: string;
  resumeId: string;
  company: string;
  role: string;
  questions: Question[];
  status: string;
  createdAt?: string;
  totalDuration?: number;
  questionCount?: number;
  interviewType?: 'technical' | 'behavioral' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CreateInterviewData {
  resumeId: string;
  company: string;
  role: string;
  interviewType: 'technical' | 'behavioral' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export const apiService = new ApiService();
