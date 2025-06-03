import { Country } from './country';

export interface APIResponse<T> {
  success: boolean;
  code: string;
  msg: string;
  data: T;
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

export type CountryListResponse = APIResponse<Country[]>;
export type InitResponse = APIResponse<InitData>;