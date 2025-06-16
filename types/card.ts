import type { APIResponse } from './api';

export interface SimpleCardCategory {
    category_id: number;
    category_name: string;
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

// API Response types
export type CardCategoryListResponse = APIResponse<SimpleCardCategory[]>;
export type CurrencyListResponse = APIResponse<Currency[]>;
export type RatesDataResponse = APIResponse<RatesData>;
export type CalculatorResponse = APIResponse<CalculatorData>;