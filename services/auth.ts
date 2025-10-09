import { APIRequest } from '@/utils/api';
import { getDeviceInfo } from '@/utils/device';
import type { 
  RegisterRequest, 
  UserRegisterResponse, 
  UserLoginResponse, 
  EmptyReponse,
  SendResetEmailRequest,
  SendResetEmailResponse,
  SendWhatsAppCodeRequest,
  SendWhatsAppCodeResponse,
  UpdatePasswordByEmailRequest,
  UpdatePasswordByWhatsAppRequest,
  UpdatePasswordResponse,
  GoogleLoginRequest,
  FacebookLoginRequest,
  AppleLoginRequest,
  SocialLoginResponse,
  SocialBindResponse,
  SocialBindRequest,
  SocialBindResult,
  GoogleInfoResponse
} from '@/types';
import { Platform } from 'react-native';

export class AuthService {
  static async register(params: RegisterRequest) {
    const deviceInfo = await getDeviceInfo();

    const requestData: RegisterRequest = {
      ...params,
      ...deviceInfo // Web platform
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
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed');
    }
  }

  static async login(username: string, password: string) {
    const deviceInfo = await getDeviceInfo();

    try {
      const response = await APIRequest.request<UserLoginResponse>(
        '/gc/user/applogin',
        'POST',
        {
          username,
          password,
          ...deviceInfo,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Login failed');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed');
    }
  }

  static async logout(token: string) {
    try {
      const response = await APIRequest.request<EmptyReponse>(
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
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed');
    }
  }

  static async checkUsername(username: string) {
    try {
      const response = await APIRequest.request<SendResetEmailResponse>(
        '/gc/user/checkUsername',
        'POST',
        { username }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to check username');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check username: ${error.message}`);
      }
      throw new Error('Failed to check username');
    }
  }

  static async sendEmailVerifyCode(email: string) {
    try {
      const response = await APIRequest.request<SendResetEmailResponse>(
        '/gc/user/sendEmailVerifyCode',
        'POST',
        { email }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to send register email');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send register email: ${error.message}`);
      }
      throw new Error('Failed to send register email');
    }
  }

  static async sendEmailBindVerifyCode(email: string, token: string) {
    try {
      const response = await APIRequest.request<SendResetEmailResponse>(
        '/gc/user/sendEmailBindVerifyCode',
        'POST',
        { email, token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to send register email');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send register email: ${error.message}`);
      }
      throw new Error('Failed to send register email');
    }
  }

  // Password Recovery Methods
  static async sendResetPasswordEmail(email: string) {
    try {
      const response = await APIRequest.request<SendResetEmailResponse>(
        '/gc/public/sendMail',
        'POST',
        { email }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to send reset email');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send reset email: ${error.message}`);
      }
      throw new Error('Failed to send reset email');
    }
  }

  static async sendWhatsAppCode(whatsapp: string) {
    try {
      const response = await APIRequest.request<SendWhatsAppCodeResponse>(
        '/gc/user/sendWhatsAppCode',
        'POST',
        { whatsapp }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to send WhatsApp code');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send WhatsApp code: ${error.message}`);
      }
      throw new Error('Failed to send WhatsApp code');
    }
  }

  static async updatePasswordByEmail(params: UpdatePasswordByEmailRequest) {
    try {
      const response = await APIRequest.request<UpdatePasswordResponse>(
        '/gc/user/updatePasswordByEmail',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to update password');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
      throw new Error('Failed to update password');
    }
  }

  static async updatePasswordByWhatsApp(params: UpdatePasswordByWhatsAppRequest) {
    try {
      const response = await APIRequest.request<UpdatePasswordResponse>(
        '/gc/user/updatePasswordByWhatsApp',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to update password');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update password: ${error.message}`);
      }
      throw new Error('Failed to update password');
    }
  }

  static async getGoogleInfoByToken(idToken: string) {
    const deviceInfo = await getDeviceInfo();

    try {
      const response = await APIRequest.request<GoogleInfoResponse>(
        '/gc/social/getGoogleInfoByToken',
        'POST',
        {
          id_token: idToken,
          ...deviceInfo
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Google login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Google login failed: ${error.message}`);
      }
      throw new Error('Google login failed');
    }
  }

  // Social Login Methods
  static async googleLogin(params: GoogleLoginRequest) {
    const deviceInfo = await getDeviceInfo();

    try {
      const response = await APIRequest.request<SocialLoginResponse>(
        '/gc/social/googleLogin',
        'POST',
        {
          social_id: params.social_id,
          social_email: params.social_email,
          social_name: params.social_name,
          ...deviceInfo
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Google login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Google login failed: ${error.message}`);
      }
      throw new Error('Google login failed');
    }
  }

  static async facebookLogin(params: FacebookLoginRequest) {
    const deviceInfo = await getDeviceInfo();

    try {
      const response = await APIRequest.request<SocialLoginResponse>(
        '/gc/social/facebookLogin',
        'POST',
        {
          ...params,
          ...deviceInfo
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Facebook login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Facebook login failed: ${error.message}`);
      }
      throw new Error('Facebook login failed');
    }
  }

  static async appleLogin(params: AppleLoginRequest) {
    const deviceInfo = await getDeviceInfo();

    try {
      const response = await APIRequest.request<SocialLoginResponse>(
        '/gc/social/appleLogin',
        'POST',
        {
          ...params,
          ...deviceInfo
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Apple login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Apple login failed: ${error.message}`);
      }
      throw new Error('Apple login failed');
    }
  }

  static async socialBind(params: SocialBindRequest): Promise<SocialBindResult> {
    try {
      const response = await APIRequest.request<SocialBindResponse>(
        '/gc/social/socialBind',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Apple login failed');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Apple login failed: ${error.message}`);
      }
      throw new Error('Apple login failed');
    }
  }
}