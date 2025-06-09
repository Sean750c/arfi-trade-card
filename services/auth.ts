import { APIRequest } from '@/utils/api';
import { generateDeviceId } from '@/utils/device';
import type { RegisterRequest, UserRegisterResponse, UserLoginResponse } from '@/types/api';

export class AuthService {
  static async register(params: Omit<RegisterRequest, 'device_no' | 'channel_type'>) {
    let deviceNo: string;
    try {
      deviceNo = await generateDeviceId();
    } catch (error) {
      // 设备ID生成失败时使用备用方案
      deviceNo = `temp_${Date.now()}`;
    }

    const requestData: RegisterRequest = {
      ...params,
      device_no: deviceNo,
      channel_type: '1', // Web platform
    };

    try {
      const response = await APIRequest.request<UserRegisterResponse>(
        '/gc/user/appregister',
        'POST',
        requestData
      );

      if (!response.success) {
        throw new Error(response.msg || 'Registration failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed');
    }
  }

  static async login(username: string, password: string) {
    let deviceNo: string;
    try {
      deviceNo = await generateDeviceId();
    } catch (error) {
      // 设备ID生成失败时使用备用方案
      deviceNo = `temp_${Date.now()}`;
    }

    try {
      const response = await APIRequest.request<UserLoginResponse>(
        '/gc/user/applogin',
        'POST',
        {
          username,
          password,
          device_no: deviceNo,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed');
    }
  }

  static async logout(token: string) {
    try {
      const response = await APIRequest.request(
        '/gc/user/applogout',
        'POST',
        {
          token,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Logout failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed');
    }
  }
}