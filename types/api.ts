// Add new types for the rates page APIs
export interface CardCategory {
  category_id: number;
  category_name: string;
  category_logo: string;
  category_logo_img: string;
  category_icon: string;
  timeout_seconds: string;
  category_introduction: string;
  sticky_status: number;
  order_sort: number;
}

export interface Currency {
  currency_id: number;
  currency_name: string;
  currency_symbol: string;
  currency_code: string;
  sort: number;
}

export interface RateDetail {
  rate: number;
  type: 'base' | 'coupon' | 'vip';
  per?: string;
  level?: number;
}

export interface CardRate {
  card_id: number;
  rate: number;
  rate_detail: RateDetail[];
  all_per: string;
  optimal_rate: string;
  currency: string;
  currency_symbol: string;
  name: string;
}

export interface CurrencyGroup {
  currency: string;
  list: CardRate[];
}

export interface CategoryData {
  category_name: string;
  category_logo: string;
  category_logo_img: string;
  category_icon: string;
  category_id: number;
  timeout_seconds: string;
  category_introduction: string;
  sticky_status: number;
  order_sort: number;
  list: CurrencyGroup[];
  top_currency: string;
  top_rate: number;
  top_optimal_rate: string;
  top_currency_symbol: string;
  top_rate_range: string;
}

export interface RatesData {
  card_list: CategoryData[];
  batch_time: number;
  first_card_name: string;
}

// API Response types
export type CardCategoryListResponse = APIResponse<CardCategory[]>;
export type CurrencyListResponse = APIResponse<Currency[]>;
export type RatesDataResponse = APIResponse<RatesData>;

// Wallet API Types
export interface WalletBalanceData {
  total_amount: number;
  usd_amount: string;
  frozen_amount: number;
  withdraw_amount: number;
  transfer_rebate: string;
  rebate_amount: number;
  usd_rebate_money: number;
  checkin_status: boolean;
  lottery_status: boolean;
  rank_status: boolean;
  default_wallet_type: string;
  dealing_cnt: number;
  currency_name: string;
  rate: string;
  point: number;
}

export interface WalletTransaction {
  currency_name: string;
  currency_symbol: string;
  log_id: number;
  memo: string;
  order_no: string;
  create_time: number;
  amount: number;
  balance_amount: number;
  order_amount: string;
  platform_fee: string;
  vip_rate: string;
  remark: string;
  name: string;
  type: 'order' | 'withdraw' | 'admin' | 'transfer' | 'dispute' | 'activity' | 'rank' | 'platform';
  order_status: string;
  image: string;
  account_no: string;
  account_name: string;
  bank_name: string;
  bank_logo: string;
}

export interface WalletTransactionRequest {
  token: string;
  type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  wallet_type: '1' | '2'; // 1: national currency, 2: USDT
  page: number;
  page_size: number;
}

export interface WalletTransactionsData {
  total: number;
  page: number;
  page_size: number;
  data: WalletTransaction[];
}

// Withdrawal Payment Types
export interface PaymentAccount {
  bank_id: number;
  is_def: number; // 1: default, 2: not default
  bank_logo: string;
  bank_logo_image: string;
  bank_name: string;
  account_no: string;
  account_name?: string;
  timeout_desc: string;
}

export interface PaymentMethod {
  payment_id: number;
  code: string;
  name: string;
  data_list: PaymentAccount[];
}

export interface FormField {
  code: string;
  name: string;
  desc: string;
  type: number;
  len: number;
  seq: number;
  disp_type: number;
  placeholder: string;
}

export interface AvailablePaymentMethod {
  payment_id: number;
  code: string;
  name: string;
  logo: string;
  background_color: string;
  logo_image: string;
  form_list: FormField[];
}

export interface Bank {
  bank_id: number;
  bank_name: string;
  bank_logo: string;
  bank_logo_image: string;
}

export interface CoinNetwork {
  coin_id: number;
  coin_name: string;
  coin_symbol: string;
  network_name: string;
  network_logo: string;
}

export interface UserPaymentListRequest {
  token: string;
  type: '1' | '2'; // 1: national currency, 2: USDT
}

export interface PaymentListRequest {
  token: string;
  type: '1' | '2'; // 1: national currency, 2: USDT
  country_id: number;
}

export interface BankListRequest {
  token: string;
  country_id: number;
}

// Existing types...
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

// Updated banner response structure to match API
export interface BannerData {
  announcement_content: any[];
  banner: Banner[];
  home_activity: Record<string, any>;
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
  notice_time: number; // Changed from string to number (timestamp)
  notice_new: boolean;
  notice_jump: boolean; // Changed from string to boolean
  notice_action: string;
  notice_order?: NoticeOrder;
  notice_type: string; // Added notice_type field
  notice_params?: string; // Added notice_params field
}

export interface NoticeListRequest {
  token: string;
  type: 'all' | 'motion' | 'system';
  page: number;
  pageSize: number;
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

// Calculator API Types
export interface VIPLevel {
  level: number;
  rate: number;
}

export interface VIPDetail {
  level: number;
  rate: string;
  next_level: number;
  next_level_rate: string;
  exp_efficiency: number;
  upgrade_point: number;
}

export interface AmountOrderBonus {
  bonus_amount: number;
  order_amount: number;
}

export interface CardItem {
  card_id: number;
  rate: number;
  usdt_rate: number;
  name: string;
  category_id: number;
}

export interface CardCategory {
  category_name: string;
  category_logo: string;
  category_image: string;
  sort: number;
  list: CardItem[];
}

export interface CalculatorData {
  first_order_bonus: number;
  amount_order_bonus: AmountOrderBonus;
  vip_info: number;
  vip: VIPLevel[];
  vip_detail: VIPDetail;
  card_list: CardCategory[];
}

export interface CalculatorRequest {
  country_id: number;
  token?: string;
}

// The API returns a direct array of notices, not an object with pagination metadata
export type NoticeListData = Notice[];

export type EmptyReponse = APIResponse<Data>;
export type JSONReponse = APIResponse<JSON>;
export type CountryListResponse = APIResponse<Country[]>;
export type InitResponse = APIResponse<InitData>;
export type UserRegisterResponse = APIResponse<User>;
export type UserLoginResponse = APIResponse<User>;
export type BannerListResponse = APIResponse<BannerData>; // Updated to use BannerData
export type NoticeListResponse = APIResponse<NoticeListData>;
export type CalculatorResponse = APIResponse<CalculatorData>;
export type WalletBalanceResponse = APIResponse<WalletBalanceData>;
export type WalletTransactionsResponse = APIResponse<WalletTransaction[]>;
export type PaymentMethodsResponse = APIResponse<PaymentMethod[]>;
export type AvailablePaymentMethodsResponse = APIResponse<AvailablePaymentMethod[]>;
export type BankListResponse = APIResponse<Bank[]>;
export type CoinListResponse = APIResponse<CoinNetwork[]>;