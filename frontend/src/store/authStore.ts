import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  organization?: string;
  department?: string;
  permissions?: string[];
  avatar?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  theme: string;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setTheme: (theme: string) => void;
  getThemeForUser: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      theme: 'patient', // Default theme
      
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          theme: user.role.toLowerCase() || 'patient'
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          theme: 'patient'
        });
        // Clear any cached data
        localStorage.removeItem('agentcare-conversation-id');
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates }
          });
        }
      },
      
      setTheme: (theme: string) => {
        set({ theme });
        // Update user preferences if authenticated
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: {
                ...currentUser.preferences,
                theme
              }
            }
          });
        }
      },
      
      getThemeForUser: () => {
        const state = get();
        if (state.user?.preferences?.theme) {
          return state.user.preferences.theme;
        }
        return state.user?.role?.toLowerCase() || state.theme;
      }
    }),
    {
      name: 'agentcare-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
); 