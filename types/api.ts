export interface APIResponse<T> {
  success: boolean;
  code: string;
  msg: string;
  data: T;
}

export interface Data {
}

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

export interface Banner {
  id: number;
  image: string;
  action: string;
  new_params: string;
  params: string;
}

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
}

export interface SocialMediaLink {
  code: string;
  platform: string;
  url: string;
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
  notice_time: string;
  notice_new: boolean;
  notice_jump: string;
  notice_action: string;
  notice_order?: NoticeOrder;
  type: 'motion' | 'system' | 'all';
}

export interface NoticeListRequest {
  token: string;
  type: 'all' | 'motion' | 'system';
  page: number;
  pageSize: number;
}

export interface NoticeListData {
  list: Notice[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type EmptyReponse = APIResponse<Data>;
export type JSONReponse = APIResponse<JSON>;
export type CountryListResponse = APIResponse<Country[]>;
export type InitResponse = APIResponse<InitData>;
export type UserRegisterResponse = APIResponse<User>;
export type UserLoginResponse = APIResponse<User>;
export type BannerListResponse = APIResponse<Banner[]>;
export type NoticeListResponse = APIResponse<NoticeListData>;