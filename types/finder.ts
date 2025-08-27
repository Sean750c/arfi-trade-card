import type { APIResponse } from './api';

// Activity Types
export interface Activity {
  id: number;
  active_title: string;
  active_memo: string;
  active_url: string;
  active_start_time: string;
  active_end_time: string;
  active_image: string;
}

export interface FinderData {
  active: Activity[];
}

export interface FinderRequest {
  token?: string;
  country_id: number;
}

export type FinderResponse = APIResponse<FinderData>;