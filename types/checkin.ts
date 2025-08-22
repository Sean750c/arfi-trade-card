import type { APIResponse } from './api';

// Reward Types Enum (for better readability)
export enum RewardType {
  POINTS = 1,
  COUPON = 2,
  CASH = 3,
  PHYSICAL_PRODUCT = 4,
  OTHER = 5,
}

export interface CheckinRule {
  id: number;
  activity_id: number;
  day_number: number;
  base_reward: string; // Base reward is always points
  extra_reward: string; // Value of extra reward
  extra_reward_type: RewardType; // Type of extra reward
  brand_id: number;
  is_checkin: boolean; // True if already checked in for this day
  date: string; // YYYY-MM-DD format
  extra_reward_data: any; // Additional data for extra reward (e.g., coupon code)
}

export interface MakeUpSignRule {
  sign_count: string; // Number of make-up signs
  sign_point: string; // Points required for make-up sign
}

export interface AccumulateCheckinReward {
  checkin_count: string; // Number of accumulated check-ins required
  prize_type: RewardType | `${RewardType}`; // Type of prize
  prize: string; // Value of prize
  prize_data: any; // Additional data for prize
  is_checkin: boolean; // True if already claimed
}

export interface FirstCheckinReward {
  prize: string; // Value of prize
  prize_type: RewardType; // Type of prize
  enable: boolean; // Is this reward enabled
  is_checkin: boolean; // True if already claimed
}

export interface DailyAccumulateAmountReward {
  amount: string; // Amount required
  prize: string; // Value of prize
  prize_type: RewardType; // Type of prize
  prize_data: any; // Additional data for prize
  is_checkin: boolean; // True if already claimed
}

export interface CheckinTask {
  name: string;
  code: string;
  prize: string;
  prize_type: RewardType;
  enable: boolean;
}

export interface CheckinLogEntry {
  id: number; // log id
  activity_id: number; // activity id
  rule_id: number; // rule id
  user_id: number; // user id
  base_reward: string;
  extra_reward: string;
  extra_reward_type: RewardType;
  accumulate_reward: string;
  accumulate_reward_type: RewardType;
  type: number; // 1: checkin, 2: makeup sign
  date: string; // YYYY-MM-DD format
}

export interface CheckinConfig {
  id: number;
  activity_no: string;
  name: string;
  details: string;
  desc: string;
  link: string;
  cycle: number;
  cycle_num: number;
  start_time: number;
  end_time: number;
  status: number;
  create_time: number;
  create_user: number;
  update_time: number;
  update_user: number;
  brand_id: number;
  rule: CheckinRule[]; // Daily check-in rules for the current cycle
  checkin_logs: CheckinLogEntry[]; // Not used in UI directly, but part of API
  cycle_week: string; // Week number of the cycle
  cycle_year: string; // Year of the cycle
  checkin: boolean; // True if today's check-in is done
  make_up_sign_rule: MakeUpSignRule[]; // Rules for make-up signs (cost)
  accumulate_checkin_reward: AccumulateCheckinReward[]; // Accumulated check-in rewards
  first_checkin_reward: FirstCheckinReward; // First check-in reward
  daily_accumulate_amount_reward: DailyAccumulateAmountReward[]; // Daily accumulated amount rewards
  max_make_up_sign_rule: number; // Max make-up signs allowed
  used_make_up_sign_count: number; // Used make-up signs
  task: CheckinTask[]; // Additional tasks
  user_point: number; // User's current points
  system_time: number; // Current system timestamp (seconds)
}

export interface CheckinConfigRequest {
  token: string;
  date: string;
}

export interface CheckinRequest {
  token: string;
  rule_id: number;
}

export type CheckinConfigResponse = APIResponse<CheckinConfig>;
export type CheckinResponse = APIResponse<{}>;