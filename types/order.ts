import type { APIResponse } from './api';

export interface OrderImage {
  url: string;
  refused_reason: string;
  type: number;
}

export interface OrderDetail {
  coupon_code: string;
  coupon_amount: string;
  order_no: string;
  user_memo: string;
  amount: string;
  status: number;
  wallet_type: number;
  currency: string;
  status_desc: string;
  create_time: number;
  finish_time: number;
  first_order_bonus: number;
  reach_amount_bonus: number;
  full_amount_bonus: number;
  vip_bonus: number;
  keyList: any[];
  imageList: OrderImage[];
  order_activity_result: any[];
}

export interface OrderDetailRequest {
  token: string;
  order_no: string;
}

export interface OrderListItem {
  order_no: string;
  amount: number;
  status: number;
  wallet_type: number;
  currency: string;
  order_rebate: number;
  refused_reason: string;
  images: string;
  card_name: string;
  is_multi: number;
  status_desc: string; // Succeed/Refused/Pending
  show_time: number;
  all_money: string;
}

export interface OrderListRequest {
  token: string;
  status: 'all' | 'inprocess' | 'done';
  start_time?: number;
  end_time?: number;
  page: number;
  page_size: number;
}

export interface OrderSellRequest {
  token: string;
  images: string[];
  user_memo: string;
  wallet_type: number;
  coupon_code: string;
  channel_type: '1' | '7' | '8';
}

export interface OrderBonus {
  bonus_amount: number;
  order_amount: number;
}

export interface OrderSell {
  order_no: string;
  create_time: string;
  images: string;
  is_firstorder: true | false;
  amount_order_bonus: OrderBonus[];
  left_transfer_rebate: number;
  currency_symbol: string;
  overdue_msg: number;
}

export interface OrderSellDetailRequest {
  token?: string;
}

export interface OrderOverdueItem {
  name: string;
  value: string;
  start: number;
}

export interface OrderVip {
  level: number;
  rate: number;
}

export interface OrderActivity {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
  memo: string;
  activity_type: number;
  activity_url: string;
  remark: string;
  html_url: string;
}

export interface OrderVipInfo {
  level: number;
  rate: string;
  next_level: number;
  next_level_rate: string;
  exp_coefficient: number;
  upgrade_point: number;
}

export interface OrderAmountOrderBonus {
  bonus_amount: number;
  order_amount: number;
}

export interface OrderSellDetail {
  overdue_max_percent: string;
  overdue_data: OrderOverdueItem[];
  vip: OrderVip[];
  activity: OrderActivity[];
  vip_info: number;
  vip_detail: OrderVipInfo;
  sell_card_tips: string;
  first_order_bonus: number;
  amount_order_bonus: OrderAmountOrderBonus[];
  rank: number;
  is_active: number;
}

export type OrderListResponse = APIResponse<OrderListItem[]>;
export type OrderDetailResponse = APIResponse<OrderDetail>;
export type OrderSellResponse = APIResponse<OrderSell>;
export type OrderSellDetailResponse = APIResponse<OrderSellDetail>;
