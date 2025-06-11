// Exchange rate system types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  currency_code: string;
  currency_name: string;
  symbol: string;
  current_rate: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
}

export interface ExchangeMetric {
  id: number;
  name: string;
  description: string;
  rates: ExchangeRate[];
}

export interface ExchangeRatesData {
  currencies: Currency[];
  metrics: ExchangeMetric[];
  last_updated: number;
  country_id: number;
}

// API Response types
export interface ExchangeRatesResponse {
  success: boolean;
  code: string;
  msg: string;
  data: ExchangeRatesData;
}