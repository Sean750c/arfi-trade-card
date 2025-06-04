import { create } from 'zustand';
import { User } from '@/types/api';
import { AuthService } from '@/services/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (params: {
    username: string;
    password: string;
    country_id: string;
    register_type: '1' | '2' | '3';
    email?: string;
    whatsapp?: string;
    recommend_code?: string;
    code?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(username, password);
      set({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },
  logout: () => set({ isAuthenticated: false, user: null, error: null }),
  register: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(params);
      set({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },
}));