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