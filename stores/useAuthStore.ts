import { create } from 'zustand';
import { Country } from '@/types/api';
import { AuthService } from '@/services/auth';

interface User {
  id: string;
  username: string;
  email?: string;
  country: Country | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  register: (params: {
    username: string;
    password: string;
    country_id: string;
    register_type: '1' | '2' | '3';
    email?: string;
    whatsapp?: string;
    recommend_code?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: (user) => set({ isAuthenticated: true, user, error: null }),
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