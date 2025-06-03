import { APIRequest } from '@/utils/api';
import { generateDeviceId } from '@/utils/device';
import type { RegisterRequest, UserRegisterResponse } from '@/types/api';

export class AuthService {
  static async register(params: Omit<RegisterRequest, 'device_no' | 'channel_type'>) {
    const deviceNo = generateDeviceId();

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
}