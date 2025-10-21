export type UpdateType = 'force' | 'recommend' | 'optional';
export type Platform = 'ios' | 'android' | 'all';

export interface AppVersion {
  id: string;
  version: string;
  build_number: number;
  platform: Platform;
  update_type: UpdateType;
  min_required_version: string | null;
  title: string;
  description: string | null;
  download_url_ios: string | null;
  download_url_android: string | null;
  is_active: boolean;
  is_in_review: boolean;
  release_date: string;
  created_at: string;
  updated_at: string;
}

export interface VersionCheckResult {
  needsUpdate: boolean;
  updateType: UpdateType;
  currentVersion: string;
  latestVersion: string;
  versionInfo: AppVersion | null;
  canSkip: boolean;
}
