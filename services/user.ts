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

  static async changePassword(token: string, password: string, new_password: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/modipassword',
        'POST',
        { token, password, new_password }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to modify password');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to modify password: ${error.message}`);
      }
      throw new Error('Failed to modify password');
    }
  }

  static async changeWithdrawPassword(token: string, password: string, new_password: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/withdraw/upTPassword',
        'POST',
        { token, password, new_password }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to modify withdraw password');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to modify withdraw password: ${error.message}`);
      }
      throw new Error('Failed to modify withdraw password');
    }
  }

  static async bindPhone(token: string, phone: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/bindPhone',
        'POST',
        { token, phone }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to bind phone');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to bind phone: ${error.message}`);
      }
      throw new Error('Failed to bind phone');
    }
  }

  static async bindWhatsapp(token: string, whatsapp: string, code: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/bindWhatsapp',
        'POST',
        { token, whatsapp, code }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to bind whatsapp');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to bind whatsapp: ${error.message}`);
      }
      throw new Error('Failed to bind whatsapp');
    }
  }

  static async bindEmail(token: string, email: string, verify_code: string): Promise<void> {
    try {
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/user/bindEmail',
        'POST',
        { token, email, verify_code }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to bind email');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to bind email: ${error.message}`);
      }
      throw new Error('Failed to bind email');
    }
  }
}