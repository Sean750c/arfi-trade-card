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
  prize_id: number;
  prize_name: string;
  prize_value: string;
  prize_type: number;
  prize_image?: string;
  remaining_points?: number; // User's remaining points after draw
}

export type LotteryActivityResponse = APIResponse<LotteryActivity>;
export type LotteryDrawResponse = APIResponse<LotteryDrawResult>;