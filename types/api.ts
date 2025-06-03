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

export type CountryListResponse = APIResponse<Country[]>;

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

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    country: Country;
  };
}

export type UserRegisterResponse = APIResponse<RegisterResponse>;