import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '../store/authStore';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('agentcare-auth-storage');
        if (token) {
          try {
            const parsed = JSON.parse(token);
            if (parsed.state?.token) {
              config.headers.Authorization = `Bearer ${parsed.state.token}`;
            }
          } catch (error) {
            console.warn('Failed to parse auth token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('agentcare-auth-storage');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  // User management
  async getProfile(): Promise<User> {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.api.put('/user/profile', updates);
    return response.data;
  }

  async updatePreferences(preferences: any): Promise<User> {
    const response = await this.api.put('/user/preferences', preferences);
    return response.data;
  }

  // AI Agents
  async processMessage(message: string): Promise<{
    response: string;
    intent?: string;
    confidence?: number;
    agent?: string;
    responseTime?: number;
  }> {
    const response = await this.api.post('/agents/process', { message });
    return response.data;
  }

  async getAgentStatus(): Promise<{
    supervisor: { active: boolean; status: string };
    services: Record<string, boolean>;
    metrics: any;
  }> {
    const response = await this.api.get('/agents/status');
    return response.data;
  }

  // Conversation
  async resetConversation(): Promise<void> {
    await this.api.post('/conversation/reset');
  }

  // System health
  async getSystemHealth(): Promise<{
    status: string;
    services: Record<string, boolean>;
    features: Record<string, boolean>;
  }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getOllamaStatus(): Promise<{
    status: string;
    model?: string;
  }> {
    const response = await this.api.get('/ollama/status');
    return response.data;
  }

  // Administrator functions
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    organization?: string;
    department?: string;
    permissions?: string[];
  }): Promise<User> {
    const response = await this.api.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.api.put(`/admin/users/${userId}`, updates);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/admin/users/${userId}`);
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalAppointments: number;
    systemUptime: number;
    agentStats: any;
  }> {
    const response = await this.api.get('/admin/stats');
    return response.data;
  }

  async getSystemLogs(params?: {
    level?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.api.get('/admin/logs', { params });
    return response.data;
  }

  // Appointments (for future use)
  async getAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    providerId?: string;
    patientId?: string;
    date?: string;
  }): Promise<{
    appointments: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.api.get('/appointments', { params });
    return response.data;
  }

  async createAppointment(appointmentData: {
    patientId: string;
    providerId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
  }): Promise<any> {
    const response = await this.api.post('/appointments', appointmentData);
    return response.data;
  }

  async updateAppointment(appointmentId: string, updates: any): Promise<any> {
    const response = await this.api.put(`/appointments/${appointmentId}`, updates);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    await this.api.delete(`/appointments/${appointmentId}`, {
      data: { reason }
    });
  }
}

export const apiService = new ApiService(); 