import type { APIResponse } from './api';

export interface CheckinRule {
  id: number;
  activity_id: number;
  day_number: number;
  base_reward: string;
  extra_reward: string;
  extra_reward_type: number;
  brand_id: number;
  is_checkin: boolean;
  date: string;
  extra_reward_data: any;
}

export interface MakeUpSignRule {
  sign_count: string;
  sign_point: string;
}

export interface AccumulateCheckinReward {
  checkin_count: string;
  prize_type: string;
  prize: string;
  prize_data: any;
  is_checkin: boolean;
}

export interface FirstCheckinReward {
  prize: string;
  prize_type: number;
  enable: boolean;
  is_checkin: boolean;
}

export interface DailyAccumulateAmountReward {
  amount: string;
  prize: string;
  prize_type: number;
  prize_data: any;
  is_checkin: boolean;
}

export interface CheckinTask {
  name: string;
  code: string;
  prize: string;
  prize_type: number;
  enable: boolean;
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
  rule: CheckinRule[];
  checkin_logs: any[];
  cycle_week: string;
  cycle_year: string;
  checkin: boolean;
  make_up_sign_rule: MakeUpSignRule[];
  accumulate_checkin_reward: AccumulateCheckinReward[];
  first_checkin_reward: FirstCheckinReward;
  daily_accumulate_amount_reward: DailyAccumulateAmountReward[];
  max_make_up_sign_rule: number;
  used_make_up_sign_count: number;
  task: CheckinTask[];
  user_point: number;
  system_time: number;
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