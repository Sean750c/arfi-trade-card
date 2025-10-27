import { APIResponse } from './api'; // Import the APIResponse type from api.ts

// Country
export interface Country {
    id: number;
    name: string;
    short_name: string;
    currency_name: string;
    currency_symbol: string;
    national_flag: string;
    withdrawal_method: number;
    money_detail: number;
    image: string;
    area_number: string;
    code: string;
    rebate_money: string;
    rebate_money_register: string;
}

// Banner
export interface Banner {
    id: number;
    image: string;
    action: string;
    new_params: string;
    params: string;
}

// Updated banner response structure to match API
export interface BannerData {
    announcement_content: string[];
    banner: Banner[];
    home_activity: Record<string, any>;
}

// Init Data Response Type
export interface InitData {
    fqa_url: string;
    vip_url: string;
    share_link: string;
    service_phone: string;
    whatsapp_phone: string;
    vip_phone: string;
    email: string;
    have_notice: boolean;
    notice_count: number;
    social_media_links: SocialMediaLink[];
    hidden_flag: string;
    comment_flag: string;
    rating_flag: string;
    init_version: number;
    sell_link: string;
    support_link: string;
    whatsapp_enable: boolean;
    facebook_disable: boolean;
    register_type: string;
    is_need_verify: string;
    is_update: boolean;
    force_update: boolean;
    up_text: string;
    apk_url: string;
    ios_url: string;
    apk_size: number;
    widget_url: string;
    auto_identify_card: boolean;
    whatsapp_register: boolean;
    whatsapp_chuanying: boolean;
    platform_fee: string;
    recommend_fee: string;
    google_login_enable?: boolean;
    facebook_login_enable?: boolean;
    apple_login_enable?: boolean;
    biometric_enable?: boolean;
    checkin_enable?: boolean;
    lottery_enable?: boolean;
    utility_enable?: boolean;
    recharge_tv?: boolean;
    recharge_electrity?: boolean;
    recharge_network?: boolean;
    recharge_betting?: boolean;
    coupon_num?: number;
}

export interface SocialMediaLink {
    code: string;
    platform: string;
    url: string;
}

// Notification Types
export interface NoticeOrder {
    image?: string;
    order_id?: string;
    status?: string;
}

export interface Notice {
    id: number;
    notice_title: string;
    notice_content: string;
    notice_time: number; // Changed from string to number (timestamp)
    notice_new: boolean;
    notice_jump: boolean; // Changed from string to boolean
    notice_action: string;
    notice_order?: NoticeOrder;
    notice_type: string; // Added notice_type field
    notice_params?: string; // Added notice_params field
}

export type NoticeListData = Notice[];

export interface NoticeListRequest {
    token: string;
    type: 'all' | 'notice' | 'system';
    page: number;
    page_size: number;
}

// Coupon Types for Discount Code API
export interface Coupon {
    code: string;
    valid_start_time: number;
    valid_end_time: number;
    use_status: number; // 1. Not started 2. Normal 3. Expired 4. Exceeded usage limit
    new_use_status: number;
    max_use: number;
    type: number;
    discount_type: number;
    discount_value: string;
    used_times: number;
    asc_sort: number;
    coupon_amount: number;
    coupon_type: string;
    symbol: string;
    enough_money: string;
    enough_money_usd: string;
}

export interface CouponListRequest {
    token: string;
    type: number; // 0 all, 1 country currency related discount code, 2 USDT related discount code
    page: number;
    page_size: number;
}

export interface CouponListResponse {
    success: boolean;
    code: string;
    msg: string;
    total: number;
    page: number;
    page_size: number;
    data: Coupon[];
}

// FAQ Types
export interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category_name: string;
}

export interface FAQListRequest {
    keywords?: string;
    page: number;
    page_size: number;
}

export type CountryListResponse = APIResponse<Country[]>;
export type InitResponse = APIResponse<InitData>;
export type BannerListResponse = APIResponse<BannerData>; // Updated to use BannerData
export type NoticeListResponse = APIResponse<NoticeListData>;
export type FAQListResponse = APIResponse<FAQItem[]>;

// /gc/public/lead 返回数据结构
export interface LeadData {
    status: number;
    value: string;
    title: string;
}

export type LeadResponse = APIResponse<LeadData>;

export interface PopDataDetail {
    image: string; // 弹窗图片
    url: string; // 点击弹窗后跳转地址，可能是外部链接，也可能是内部跳转
    jump_type: 1 | 2; // 1 APP内链 2 外部链接
    condition: string; // 弹窗条件：0 重启程序触发，1 注册成功触发，2 订单创建成功触发，3提现发起成功触发
}

export interface PopData {
    pop: true | false;
    data: PopDataDetail;
}

export type PopResponse = APIResponse<PopData>;

export interface Transaction {
    id: string;
    username: string;
    amount: string;
    currency: string;
    timeAgo: number;
}

export interface Announcement {
    id: string;
    content: string;
}

export interface LiveContent {
    announcement: Announcement[];
    transaction: Transaction[];
}

export type LiveContentResponse = APIResponse<LiveContent>; // Updated to use BannerData