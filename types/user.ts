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
    google_bind?: boolean; // Added for social bind status
    facebook_bind?: boolean; // Added for social bind status
    apple_bind?: boolean; // Added for social bind status
    whatsapp_bind: boolean;
    password_null: boolean;
    t_password_null: boolean;
    register_time: number;
    last_login_time: number;
    point: number;
    coupon_num: number;
    charge_discount: number;
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
    email?: string;
    whatsapp?: string;
    recommend_code?: string;
    push_device_token?: string;
    code?: string;
    sign_to_coupon?: string;
    social_id?: string;
    social_type?: string;
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
    social_name?: string; // Added for consistency
    version: string;
}

export interface SocialBindResult {
    is_social_bind: boolean;
}

export interface SocialLoginResult {
    is_social_bind: boolean;
    username: string;
    social_id: string;
    social_email: string;
    social_type: string;
    token: string;
}

export interface GoogleLoginRequest {
    // Google authorization code from OAuth flow
    code: string;
    redirect_uri: string;
}

export interface FacebookLoginRequest {
    facebook_token: string;
    version?: number;
    social_id: string;
    social_name?: string;
    social_email?: string;
    social_picture?: string;
}

export interface AppleLoginRequest {
    social_id: string;
    social_name?: string;
    social_email?: string;
    social_code: string;
    version?: number;
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
export type SocialBindResponse = APIResponse<SocialBindResult>;