import { create } from 'zustand';
import { User } from '@/types';
import { AuthService, SocialLoginResult } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '@/services/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void; // Add method to clear auth state
  register: (params: {
    username: string;
    password: string;
    country_id: number; // Changed to number based on API
    register_type: '1' | '2' | '3';
    email?: string; // Optional for social register
    whatsapp?: string;
    recommend_code?: string;
    code?: string;
  }) => Promise<void>;
  reloadUser: () => Promise<void>;
  setUser: (user: User) => void; // Add method to set user directly (for social login)
  googleLogin: (accessToken: string) => Promise<void>;
  googleLoginCallback: (result: SocialLoginResult) => Promise<void>; // New callback for social login
  facebookLogin: (accessToken: string) => Promise<void>;
  appleLogin: (accessToken: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(username, password);
      set({
        isAuthenticated: true,
        user: {
          ...response,
        },
        isLoading: false,
        error: null,
      });
      await AsyncStorage.setItem('user', JSON.stringify(response));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },
  logout: async () => {
    const { user } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Call logout API if user has a token
      if (user?.token) {
        await AuthService.logout(user.token);
      }
      
      // Clear local state regardless of API call result
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null 
      });
      await AsyncStorage.removeItem('user');
      console.log('User logged out successfully');
    } catch (error) {
      // Even if API call fails, clear local state
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null 
      });
      await AsyncStorage.removeItem('user');
      console.warn('Logout API call failed, but local state cleared:', error);
      // Don't throw error here to ensure logout always succeeds locally
    }
  },
  clearAuth: () => {
    // Method to clear auth state when token expires
    set({ 
      isAuthenticated: false, 
      user: null, 
      isLoading: false,
      error: null 
    });
    AsyncStorage.removeItem('user');
  },
  initialize: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      //console.log('userAuthStore initialize');
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: false, isInitialized: false });
        try {
          const response = await UserService.getUserInfo(user.token);
          const freshUser = { ...response, token: user.token };
          set({ user: freshUser, isAuthenticated: true, isInitialized: true });
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } catch (e) {
          set({ user: null, isAuthenticated: false, isInitialized: true });
          await AsyncStorage.removeItem('user');
        }
      } else {
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
  register: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(params);
      set({
        isAuthenticated: true,
        user: {
          ...response,
        },
        isLoading: false,
        error: null,
      });
      await AsyncStorage.setItem('user', JSON.stringify(response));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },
  reloadUser: async () => {
    const { user } = get();
    if (!user?.token) {
      set({ user: null, isAuthenticated: false, isInitialized: true });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await UserService.getUserInfo(user.token);
      const newUser = { ...response, token: user.token };
      set({
        user: newUser,
        isLoading: false,
        error: null,
      });
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reload user info',
      });
      throw error;
    }
  },
  setUser: (user) => {
    set({
      isAuthenticated: true,
      user,
      isLoading: false,
      error: null,
    });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
  googleLogin: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.googleLogin(accessToken);
      await get().googleLoginCallback(response); // Use the new callback
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      });
      throw error;
    }
  },
  googleLoginCallback: async (result: SocialLoginResult) => {
    set({ isLoading: true, error: null });
    try {
      if (result.is_social_bind) {
        // If already bound, fetch user info and log in
        const userInfo = await UserService.getUserInfo(result.token);
        const freshUser = { ...userInfo, token: result.token };
        set({
          isAuthenticated: true,
          user: freshUser,
          isLoading: false,
          error: null,
        });
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        router.replace('/(tabs)');
      } else {
        // Not bound, navigate to social register screen
        // Pass social login data to the new screen
        router.replace({ pathname: '/(auth)/social-register', params: result });
        set({
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      });
      throw error;
    }
  },
  facebookLogin: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.facebookLogin(accessToken);
      set({
        isAuthenticated: true,
        // user: response,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Facebook login failed',
      });
      throw error;
    }
  },
  appleLogin: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.appleLogin(accessToken);
      set({
        isAuthenticated: true,
        // user: response,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Apple login failed',
      });
      throw error;
    }
  },
}));