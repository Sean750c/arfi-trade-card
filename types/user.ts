import { APIResponse } from './api'; // Import the APIResponse type from api.ts

// User Profile API Types
export interface UserInfo {
    user_id: number;
    username: string;
    nickname: string;
    avatar: string;
    email: string;
    whatsapp: string;
    country_name: string;
    currency_symbol: string;
    vip_level: number;
    money: string;
    rebate_money: string;
    is_email_bind: boolean;
    whatsapp_bind: boolean;
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
    country_name: string;
    currency_symbol: string;
    currency_name: string;
    national_flag: string;
    withdrawal_method: number;
    money_detail: number;
    country_logo_image: string;
    email: string;
    is_email_bind: boolean;
    whatsapp_bind: boolean;
    code: string;
    whatsapp_register: boolean;
    password_null: boolean;
    t_password_null: boolean;
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

export interface GoogleLoginRequest extends SocialLoginRequest {
    // Google specific fields if needed
}

export interface FacebookLoginRequest extends SocialLoginRequest {
    // Facebook specific fields if needed
}

export interface AppleLoginRequest extends SocialLoginRequest {
    // Apple specific fields if needed
}

export type UserRegisterResponse = APIResponse<User>;
export type UserLoginResponse = APIResponse<User>;
export type UserInfoResponse = APIResponse<UserInfo>;

// Password Recovery Response Types
export type SendResetEmailResponse = APIResponse<{}>;
export type SendWhatsAppCodeResponse = APIResponse<{}>;
export type UpdatePasswordResponse = APIResponse<{}>;

// Social Login Response Types
export type SocialLoginResponse = APIResponse<User>;