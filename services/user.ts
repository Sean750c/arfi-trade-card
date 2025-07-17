import { APIRequest } from '@/utils/api';
import type { 
  UserInfoResponse,
  User,
  UserInfoRequest,
  ModifyNicknameRequest,
  UploadAvatarRequest,
  EmptyReponse
} from '@/types';

export class UserService {
  static async getUserInfo(token: string): Promise<User> {
    try {
      const response = await APIRequest.request<UserInfoResponse>(
        '/gc/user/userInfo',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch user info');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch user info: ${error.message}`);
      }
      throw new Error('Failed to fetch user info');
    }
  }

  static async modifyNickname(params: ModifyNicknameRequest): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/modinickname',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to modify nickname');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to modify nickname: ${error.message}`);
      }
      throw new Error('Failed to modify nickname');
    }
  }

  static async uploadAvatar(params: UploadAvatarRequest): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/account/avatar',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to upload avatar');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }
      throw new Error('Failed to upload avatar');
    }
  }

  static async deleteAccount(token: string, password: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/cancellation',
        'POST',
        { token, password }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to delete account');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to delete account: ${error.message}`);
      }
      throw new Error('Failed to delete account');
    }
  }
}