import { APIResponse } from './api'; // Import the APIResponse type from api.ts

// User Profile API Types
export interface User {
    user_id: number;
    token: string;
    country_id: number;
    channel_type: number;
    avatar: string;
    username: string;
    nickname: string;
    vip_level: number;
    money: string;
    rebate_money: string;
    usd_rebate_money: string;
    country_name: string;
    currency_symbol: string;
    currency_name: string;
    withdrawal_method: number;
    money_detail: number;
    country_logo_image: string;
    phone: string;
    email: string;
    is_email_bind: boolean;
    whatsapp: string;
    whatsapp_bind: boolean;
    password_null: boolean;
    t_password_null: boolean;
    register_time: number;
    last_login_time: number;
}

export interface UserInfoRequest {
    token: string;
}

export interface ModifyNicknameRequest {
    token: string;
    nickname: string;
}

export interface UploadAvatarRequest {
    token: string;
    avatar: string; // base64 encoded image
}

export interface RegisterRequest {
    register_type: '1' | '2' | '3';
    country_id: string;
    username: string;
    password: string;
    device_no: string;
    channel_type: '1' | '7' | '8';
    email?: string;
    whatsapp?: string;
    recommend_code?: string;
    push_device_token?: string;
    code?: string;
}

// Password Recovery API Types
export interface SendResetEmailRequest {
    email: string;
}

export interface SendWhatsAppCodeRequest {
    whatsapp: string;
}

export interface UpdatePasswordByEmailRequest {
    email: string;
    verify_code: string;
    new_password: string;
}

export interface UpdatePasswordByWhatsAppRequest {
    whatsapp: string;
    verify_code: string;
    new_password: string;
}

// Social Login API Types
export interface SocialLoginRequest {
    access_token: string;
    device_no: string;
    channel_type: '1' | '7' | '8';
}

export interface SocialBindRequest {
    token: string;
    social_type: 'google' | 'facebook' | 'apple';
    apple_code: string;
    facebook_token: string;
    social_id: string;
    social_email: string;
    social_picture: string;
    version: string;
}

export interface BindResult {
    is_social_bind: boolean;
}

export interface SocialLoginResult {
    username: string;
    is_social_bind: true | false;
    social_id: string;
    validate_email: string;
    user_id: number;
    vip_level: string;
    token: string;
}

export interface GoogleLoginRequest extends SocialLoginRequest {
    // Google specific fields if needed
    is_validate_email: 0 | 1;
    social_id: string;
    social_name: string;
    social_email: string;
    device_no: string;
    push_device_token: string;
    os_type: string;
    device_type: string;
}

export interface FacebookLoginRequest extends SocialLoginRequest {
    facebook_token: string;
    is_validate_email: 0 | 1;
    version: number;
    device_no: string;
    push_device_token: string;
    os_type: string;
    device_type: string;
}

export interface AppleLoginRequest extends SocialLoginRequest {
    social_id: string;
    social_name: string;
    social_email: string;
    social_code: string;
    version: number;
    device_no: string;
    push_device_token: string;
    os_type: string;
    device_type: string;
}

export type UserRegisterResponse = APIResponse<User>;
export type UserLoginResponse = APIResponse<User>;
export type UserInfoResponse = APIResponse<User>;

// Password Recovery Response Types
export type SendResetEmailResponse = APIResponse<{}>;
export type SendWhatsAppCodeResponse = APIResponse<{}>;
export type UpdatePasswordResponse = APIResponse<{}>;

// Social Login Response Types
export type SocialLoginResponse = APIResponse<SocialLoginResult>;
export type SocialBindResponse = APIResponse<BindResult>;