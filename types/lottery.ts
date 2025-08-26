import type { APIResponse } from './api';

export interface LotteryPrize {
  id: number;
  activity_id: number;
  prize_name: string;
  prize_type: number; // 1: points, 2: money, 3: USDT, 4: physical prize
  prize_value: string;
  prize_image: string;
}

export interface LotteryActivity {
  id: number;
  activity_no: string;
  name: string;
  details: string;
  desc: string;
  link: string;
  point: number; // Points required per draw
  start_time: number;
  end_time: number;
  prizes: LotteryPrize[];
  user_point: number; // User's current points
}

export interface LotteryActivityRequest {
  token: string;
}

export interface LotteryDrawRequest {
  token: string;
  activity_id: number;
}

export interface LotteryDrawResult {
  id: number;
  prize_name: string;
  prize_data: any;
  prize_type: number;
  prize_image?: string;
}

export interface LotteryLogEntry {
  id: number;
  activity_no: string;
  activity_name: string;
  user_id: number;
  config_id: number;
  prize: string;
  prize_name: string;
  prize_type: number;
  create_time: number;
  brand_id: number;
  prize_data: any;
}

export interface LotteryLogsData {
  list: LotteryLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface LotteryLogsRequest {
  token: string;
  page: number;
  page_size: number;
}

export type LotteryActivityResponse = APIResponse<LotteryActivity>;
export type LotteryDrawResponse = APIResponse<LotteryDrawResult>;
export type LotteryLogsResponse = APIResponse<LotteryLogEntry[]>;