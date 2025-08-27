import { create } from 'zustand';
import { useRef } from 'react';
import { User, SocialLoginResult, GoogleLoginRequest, FacebookLoginRequest, AppleLoginRequest } from '@/types';
import { AuthService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService } from '@/services/user';
import { router } from 'expo-router';

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
    country_id: string; // Changed to number based on API
    register_type: '1' | '2' | '3';
    email?: string; // Optional for social register
    whatsapp?: string;
    recommend_code?: string;
    code?: string;
    sign_to_coupon?: string;
    social_id?: string;
    social_type?: string;
  }) => Promise<void>;
  reloadUser: () => Promise<void>;
  setUser: (user: User) => void; // Add method to set user directly (for social login)
  googleLogin: (params: GoogleLoginRequest) => Promise<void>;
  facebookLogin: (params: FacebookLoginRequest) => Promise<void>;
  appleLogin: (params: AppleLoginRequest) => Promise<void>;
  socialLoginCallback: (result: SocialLoginResult) => Promise<void>; // New callback for social login
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
          // If token is invalid, clear user data and mark as initialized
          set({ user: null, isAuthenticated: false, isInitialized: true });
          await AsyncStorage.removeItem('user');
        }
      } else {
        // No stored user, mark as initialized with no user
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      // On any error, ensure we mark as initialized to prevent infinite loading
      console.error('Auth initialization error:', error);
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
  googleLogin: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.googleLogin(params);
      response.social_email = params.social_email ?? '';
      response.social_type = 'google';
      await get().socialLoginCallback(response); // Use the new callback
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      });
      throw error;
    }
  },
  facebookLogin: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.facebookLogin(params);
      response.social_email = params.social_email ?? '';
      response.social_type = 'facebook';
      await get().socialLoginCallback(response); // Use the new callback
      set({
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
  appleLogin: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.appleLogin(params);
      response.social_email = params.social_email ?? '';
      response.social_type = 'apple';
      await get().socialLoginCallback(response); // Use the new callback
      set({
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
  socialLoginCallback: async (result: SocialLoginResult) => {
    set({ isLoading: true, error: null });
    
    // Create a ref to track if the operation should continue
    let shouldContinue = true;
    
    try {
      console.log('🔍 Social Login Callback Debug - Received result:', result);
      console.log('🔍 is_social_bind:', result.is_social_bind);
      console.log('🔍 token exists:', !!result.token);
      console.log('🔍 username:', result.username);
      console.log('🔍 social_id:', result.social_id);
      console.log('🔍 social_email:', result.social_email);
      
      if (result.is_social_bind === true && result.token) {
        console.log('Already bound. Fetching user info...');
        // If already bound, fetch user info and log in
        const userInfo = await UserService.getUserInfo(result.token);
        const freshUser = { ...userInfo, token: result.token };
        console.log('Fetched user info:', freshUser);
        set({
          isAuthenticated: true, // Ensure isAuthenticated is set before navigation
          user: freshUser,
          isLoading: false,
          error: null,
        });
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        setTimeout(() => {
          console.log('✅ Social Login Debug - User logged in successfully, redirecting to home');
          if (shouldContinue) {
            router.replace('/(tabs)');
          }
        }, 100); // Add a small delay
      } else {
        console.log('User not bound. Navigating to social-register screen...');
        // Not bound, navigate to social register screen
        // Pass social login data to the new screen
        setTimeout(() => {
          console.log('🔍 Social Login Debug - Redirecting to social-register with params');
          if (shouldContinue) {
            router.replace({
              pathname: '/(auth)/social-register', params: {
                username: result.username,
                social_id: result.social_id,
                social_email: result.social_email,
              }
            });
          }
        }, 100); // Add a small delay
        set({
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Social login error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Social login failed',
      });
      throw error;
    }
    
    // Mark operation as complete to prevent further navigation
    // return () => {
    //   shouldContinue = false;
    // };
  },
}));