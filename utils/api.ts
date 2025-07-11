import md5 from 'crypto-js/md5';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Use environment variable for API host, with fallback to original value
const API_HOST = process.env.EXPO_PUBLIC_API_URL || 'https://api.giftcard8.com';

// Platform-specific configurations
const getAppConfig = () => {
  switch (Platform.OS) {
    case 'android':
      return {
        appid: 'android-cardking-v1',
        appKey: 'kxI2tTK5iQNMzAOYiZDh0XdD3OmgPSnK'
      };
    case 'ios':
      return {
        appid: 'ios-cardking-v1',
        appKey: 'iScF9BJLCZwkaUPR5QrTSPHYNhlKivnL'
      };
    case 'web':
    default:
      return {
        appid: 'web-cardking-v1',
        appKey: '8yQB4Nl70iYmw1lP4Za5evyGAt1nbVAE'
      };
  }
};

export class APIRequest {
  private static generateSignature(params: Record<string, string>): string {
    const { appKey } = getAppConfig();
    
    // 1. 移除sign参数（如果存在）
    const { sign, ...filteredParams } = params;
    
    // 2. 保持参数原始顺序（与服务器一致）
    const paramString = Object.entries(filteredParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const signString = paramString + appKey;
    
    // 3. 添加APP_KEY并生成MD5（确保与服务器的$appkey相同）
    return md5(signString).toString();
  }

  private static async handleTokenExpiration(code: string) {
    if (code === 'common.004') {
      // Token expired, clear auth state and redirect to login
      console.log('Token expired, clearing auth and redirecting to login');
      
      try {
        // Import auth store dynamically to avoid circular dependencies
        const { useAuthStore } = await import('@/stores/useAuthStore');
        const { clearAuth } = useAuthStore.getState();
        
        // Clear authentication state
        clearAuth();
        
        // Redirect to login page
        router.replace('/(auth)/login');
      } catch (error) {
        console.error('Error clearing auth state:', error);
        // Still redirect even if clearing fails
        router.replace('/(auth)/login');
      }
      
      // throw new Error('Session expired. Please login again.');
    }
  }

  static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const { appid } = getAppConfig();
      
      // Add default parameters with platform-specific appid
      const requestParams = {
        ...params,
        appid,
        app_version: '1.0',
      };
  
      // Generate signature
      const sign = this.generateSignature(requestParams);
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded' 
      };

      // 准备请求体
      const requestBody = {
        ...requestParams,
        sign
      };
      
      const requestOptions: RequestInit = {
        method,
        headers,
        body: new URLSearchParams(requestBody).toString()
      };

      //console.log(`Making API request to: ${API_HOST}${endpoint}`);
      
      const response = await fetch(`${API_HOST}${endpoint}`, requestOptions);
    
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Check for token expiration before checking success
      if (data.code) {
        await this.handleTokenExpiration(data.code);
      }
      
      if (!data.success) {
        throw new Error(data.msg || 'API request failed');
      }

      return data as T;
    } catch (error) {
      console.error('API Request failed:', endpoint, error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to API server at ${API_HOST}. Please check your internet connection and API configuration.`);
      }
      
      throw error;
    }
  }
}