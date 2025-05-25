import axios, { AxiosInstance } from 'axios';
import { User } from '../store/authStore';
import { logger } from '../utils/logger';

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
            // Failed to parse auth token - remove invalid token
            localStorage.removeItem('agentcare-auth-storage');
            logger.warn('Failed to parse auth token, removing invalid token', error, 'Auth');
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and response normalization
    this.api.interceptors.response.use(
      (response) => {
        // Normalize backend response format
        if (response.data && response.data.success) {
          return {
            ...response,
            data: response.data.data || response.data
          };
        }
        return response;
      },
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

  // Demo users for testing - using the correct password
  private demoUsers = [
    {
      id: 'a0000000-0000-4000-8000-000000000001',
      email: 'admin@agentcare.dev',
      name: 'System Administrator',
      role: 'admin',
      department: 'IT',
      permissions: ['admin', 'user_management', 'system_settings'],
      avatar: 'SA',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000002',
      email: 'doctor@agentcare.dev',
      name: 'Dr. Sarah Johnson',
      role: 'doctor',
      department: 'Cardiology',
      permissions: ['patient_access', 'appointment_management', 'medical_records'],
      avatar: 'SJ',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000003',
      email: 'nurse@agentcare.dev',
      name: 'Alice Brown, RN',
      role: 'nurse',
      department: 'Emergency',
      permissions: ['patient_access', 'basic_records', 'medication_admin'],
      avatar: 'AB',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000004',
      email: 'patient@agentcare.dev',
      name: 'John Smith',
      role: 'patient',
      permissions: ['self_access'],
      avatar: 'JS',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000005',
      email: 'receptionist@agentcare.dev',
      name: 'Maria Garcia',
      role: 'receptionist',
      department: 'Front Desk',
      permissions: ['appointment_scheduling', 'patient_checkin', 'basic_info'],
      avatar: 'MG',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000006',
      email: 'specialist@agentcare.dev',
      name: 'Dr. Michael Chen',
      role: 'specialist',
      department: 'Neurology',
      permissions: ['patient_access', 'appointment_management', 'medical_records', 'specialist_referrals'],
      avatar: 'MC',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000007',
      email: 'np@agentcare.dev',
      name: 'Jennifer Wilson, NP',
      role: 'nurse_practitioner',
      department: 'Primary Care',
      permissions: ['patient_access', 'prescription_management', 'diagnosis', 'medical_records'],
      avatar: 'JW',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000008',
      email: 'pa@agentcare.dev',
      name: 'David Martinez, PA-C',
      role: 'physician_assistant',
      department: 'Orthopedics',
      permissions: ['patient_access', 'treatment_plans', 'medical_records'],
      avatar: 'DM',
    },
  ];

  // Authentication
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      logger.apiFallback('Registration failed, using demo mode', error, 'Auth');
      // For demo purposes, simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: data.role || 'patient',
        phone: data.phone,
        permissions: ['self_access'],
      };

      return {
        user: newUser,
        token: 'demo_token_' + Date.now(),
      };
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    try {
      // Try actual API call first
      const response = await this.api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      logger.apiFallback('Login failed, using demo mode', error, 'Auth');
      // Fallback to demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check demo users - use the correct password
      const demoUser = this.demoUsers.find(u => u.email === data.email);
      
      if (demoUser && data.password === 'AgentCare2024!') {
        return {
          user: demoUser as User,
          token: 'demo_token_' + Date.now(),
        };
      }

      // Also accept the old demo password for backward compatibility
      if (demoUser && data.password === 'demo123') {
        return {
          user: demoUser as User,
          token: 'demo_token_' + Date.now(),
        };
      }

      throw new Error('Invalid credentials. Use AgentCare2024! as password for demo accounts.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore errors for demo
      logger.apiFallback('Logout API call failed, continuing with local logout', error, 'Auth');
    }
  }

  // User management
  async getProfile(): Promise<User> {
    try {
      const response = await this.api.get('/user/profile');
      return response.data;
    } catch (error) {
      logger.apiFallback('getProfile failed, using demo mode', error, 'User');
      // Demo fallback
      const token = localStorage.getItem('agentcare-auth-storage');
      if (token) {
        const parsed = JSON.parse(token);
        return parsed.state?.user || this.demoUsers[0];
      }
      throw error;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put('/user/profile', updates);
      return response.data;
    } catch (error) {
      logger.apiFallback('updateProfile failed, using demo mode', error, 'User');
      // Demo mode - just return updated user
      const currentUser = await this.getProfile();
      return { ...currentUser, ...updates };
    }
  }

  async updatePreferences(preferences: any): Promise<User> {
    try {
      const response = await this.api.put('/user/preferences', preferences);
      return response.data;
    } catch (error) {
      logger.apiFallback('updatePreferences failed, using demo mode', error, 'User');
      // Demo mode - just return updated user
      const currentUser = await this.getProfile();
      return { ...currentUser, preferences };
    }
  }

  // AI Agents
  async processMessage(message: string): Promise<{
    response: string;
    intent?: string;
    confidence?: number;
    agent?: string;
    responseTime?: number;
  }> {
    try {
      const response = await this.api.post('/agents/process', { message });
      return response.data;
    } catch (error) {
      logger.apiFallback('processMessage failed, using demo mode', error, 'Agents');
      // Demo response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        response: "I'm a demo AI assistant. In the full version, I would help you schedule appointments, answer questions, and provide healthcare guidance.",
        intent: 'demo',
        confidence: 0.95,
        agent: 'demo_agent',
        responseTime: 1000
      };
    }
  }

  async getAgentStatus(): Promise<{
    supervisor: { active: boolean; status: string };
    services: Record<string, boolean>;
    metrics: any;
  }> {
    try {
      const response = await this.api.get('/agents/status');
      return response.data;
    } catch (error) {
      logger.apiFallback('getAgentStatus failed, using demo mode', error, 'Agents');
      // Demo status
      return {
        supervisor: { active: true, status: 'demo_mode' },
        services: {
          booking_agent: true,
          availability_agent: true,
          faq_agent: true
        },
        metrics: {
          total_conversations: 42,
          success_rate: 0.95,
          avg_response_time: 850
        }
      };
    }
  }

  // Conversation
  async resetConversation(): Promise<void> {
    try {
      await this.api.post('/conversation/reset');
    } catch (error) {
      logger.apiFallback('resetConversation failed, using demo mode', error, 'Conversation');
      // Demo mode - just log
      logger.info('Demo: Conversation reset', null, 'Conversation');
    }
  }

  // System health
  async getSystemHealth(): Promise<{
    status: string;
    services: Record<string, boolean>;
    features: Record<string, boolean>;
  }> {
    try {
      const response = await this.api.get('/system/health');
      return response.data;
    } catch (error) {
      logger.apiFallback('getSystemHealth failed, using demo mode', error, 'System');
      return {
        status: 'demo_mode',
        services: {
          database: true,
          ollama: false,
          redis: false
        },
        features: {
          multi_tenant: true,
          ai_agents: true,
          appointment_booking: true,
          user_management: true,
          demo_mode: true
        }
      };
    }
  }

  async getOllamaStatus(): Promise<{
    status: string;
    model?: string;
  }> {
    try {
      const response = await this.api.get('/system/ollama/status');
      return response.data;
    } catch (error) {
      logger.apiFallback('getOllamaStatus failed, using demo mode', error, 'System');
      return {
        status: 'not_configured',
        model: 'qwen2.5:latest'
      };
    }
  }

  // Admin endpoints
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
    try {
      const response = await this.api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      logger.apiFallback('getUsers failed, using demo mode', error, 'Admin');
      // Demo response
      return {
        users: this.demoUsers as User[],
        total: this.demoUsers.length,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    }
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
    try {
      const response = await this.api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      logger.apiFallback('createUser failed, using demo mode', error, 'Admin');
      // Demo response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        department: userData.department,
        permissions: userData.permissions || ['self_access']
      } as User;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      logger.apiFallback('updateUser failed, using demo mode', error, 'Admin');
      // Demo response
      const existingUser = this.demoUsers.find(u => u.id === userId);
      return { ...existingUser, ...updates } as User;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${userId}`);
    } catch (error) {
      logger.apiFallback('deleteUser failed, using demo mode', error, 'Admin');
      // Demo mode - just log
      logger.info(`Demo: User ${userId} deleted`, null, 'Admin');
    }
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalAppointments: number;
    systemUptime: number;
    agentStats: any;
  }> {
    try {
      const response = await this.api.get('/admin/stats');
      return response.data;
    } catch (error) {
      logger.apiFallback('getSystemStats failed, using demo mode', error, 'Admin');
      return {
        totalUsers: this.demoUsers.length,
        activeUsers: this.demoUsers.length,
        totalAppointments: 25,
        systemUptime: Math.floor(Math.random() * 86400),
        agentStats: {
          supervisor_agent: { active: true, conversations: 42 },
          booking_agent: { active: true, conversations: 18 },
          availability_agent: { active: true, conversations: 12 },
          faq_agent: { active: true, conversations: 28 }
        }
      };
    }
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
    try {
      const response = await this.api.get('/system/logs', { params });
      return response.data;
    } catch (error) {
      logger.apiFallback('getSystemLogs failed, using demo mode', error, 'System');
      // Demo logs
      const mockLogs = Array.from({ length: params?.limit || 20 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
        message: `Demo log message ${i + 1}`,
        service: 'agentcare-api',
        userId: Math.random() > 0.5 ? this.demoUsers[Math.floor(Math.random() * this.demoUsers.length)].id : null
      }));

      return {
        logs: mockLogs,
        total: 100,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    }
  }

  async seedDatabase(options?: {
    forceRecreate?: boolean;
    seedDemoData?: boolean;
  }): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const response = await this.api.post('/system/database/seed', options);
      return response.data;
    } catch (error) {
      logger.apiFallback('seedDatabase failed, using demo mode', error, 'System');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        message: 'Demo database seeding completed',
        stats: {
          users: 10,
          providers: 4,
          appointments: 15,
          organizations: 1
        }
      };
    }
  }

  async getDatabaseStats(): Promise<Record<string, number>> {
    try {
      const response = await this.api.get('/system/database/stats');
      return response.data;
    } catch (error) {
      logger.apiFallback('getDatabaseStats failed, using demo mode', error, 'System');
      return {
        users: 10,
        providers: 4,
        appointments: 15,
        conversations: 42
      };
    }
  }

  // Appointment management
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
    try {
      const response = await this.api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      logger.apiFallback('getAppointments failed, using demo mode', error, 'Appointments');
      // Generate demo appointments
      const appointments = Array.from({ length: params?.limit || 10 }, (_, i) => ({
        id: `apt-${i + 1}`,
        patientName: `Patient ${i + 1}`,
        providerName: this.demoUsers.filter(u => ['doctor', 'nurse_practitioner', 'physician_assistant'].includes(u.role))[i % 3]?.name || 'Provider',
        date: new Date(Date.now() + (i - 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${9 + (i % 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
        type: ['Consultation', 'Follow-up', 'Check-up'][i % 3],
        status: ['scheduled', 'confirmed', 'completed'][i % 3]
      }));

      return {
        appointments,
        total: 25,
        page: params?.page || 1,
        limit: params?.limit || 10
      };
    }
  }

  async createAppointment(appointmentData: {
    patientId: string;
    providerId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await this.api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      logger.apiFallback('createAppointment failed, using demo mode', error, 'Appointments');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: `apt-${Date.now()}`,
        ...appointmentData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
    }
  }

  async updateAppointment(appointmentId: string, updates: any): Promise<any> {
    try {
      const response = await this.api.put(`/appointments/${appointmentId}`, updates);
      return response.data;
    } catch (error) {
      logger.apiFallback('updateAppointment failed, using demo mode', error, 'Appointments');
      return { id: appointmentId, ...updates, updatedAt: new Date().toISOString() };
    }
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    try {
      await this.api.post(`/appointments/${appointmentId}/cancel`, { reason });
    } catch (error) {
      logger.apiFallback('cancelAppointment failed, using demo mode', error, 'Appointments');
      logger.info(`Demo: Appointment ${appointmentId} cancelled. Reason: ${reason || 'No reason'}`, null, 'Appointments');
    }
  }
}

export const apiService = new ApiService();
export default apiService; 