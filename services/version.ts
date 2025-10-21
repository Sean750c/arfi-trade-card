import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import type { AppVersion, VersionCheckResult } from '@/types/version';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export class VersionService {
  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  static getCurrentVersion(): string {
    return Constants.expoConfig?.version || '1.0.0';
  }

  static getCurrentBuildNumber(): number {
    if (Platform.OS === 'ios') {
      return parseInt(Application.nativeBuildVersion || '1', 10);
    } else if (Platform.OS === 'android') {
      return parseInt(Application.nativeBuildVersion || '1', 10);
    }
    return 1;
  }

  static getCurrentPlatform(): 'ios' | 'android' | 'web' {
    return Platform.OS as 'ios' | 'android' | 'web';
  }

  static async getLatestVersion(): Promise<AppVersion | null> {
    try {
      const platform = this.getCurrentPlatform();

      if (platform === 'web') {
        return null;
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_versions?is_active=eq.true&or=(platform.eq.${platform},platform.eq.all)&order=build_number.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch version info');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return data[0] as AppVersion;
      }

      return null;
    } catch (error) {
      console.error('Error fetching latest version:', error);
      return null;
    }
  }

  static async checkForUpdate(): Promise<VersionCheckResult> {
    const currentVersion = this.getCurrentVersion();
    const currentBuildNumber = this.getCurrentBuildNumber();

    const defaultResult: VersionCheckResult = {
      needsUpdate: false,
      updateType: 'optional',
      currentVersion,
      latestVersion: currentVersion,
      versionInfo: null,
      canSkip: true,
    };

    try {
      const latestVersionInfo = await this.getLatestVersion();

      if (!latestVersionInfo) {
        return defaultResult;
      }

      const needsUpdate =
        this.compareVersions(latestVersionInfo.version, currentVersion) > 0 ||
        latestVersionInfo.build_number > currentBuildNumber;

      if (!needsUpdate) {
        return defaultResult;
      }

      let updateType = latestVersionInfo.update_type;
      let canSkip = updateType !== 'force';

      if (latestVersionInfo.is_in_review) {
        updateType = 'optional';
        canSkip = true;
      }

      if (latestVersionInfo.min_required_version) {
        const isCurrentVersionTooOld =
          this.compareVersions(currentVersion, latestVersionInfo.min_required_version) < 0;

        if (isCurrentVersionTooOld && !latestVersionInfo.is_in_review) {
          updateType = 'force';
          canSkip = false;
        }
      }

      return {
        needsUpdate: true,
        updateType,
        currentVersion,
        latestVersion: latestVersionInfo.version,
        versionInfo: latestVersionInfo,
        canSkip,
      };
    } catch (error) {
      console.error('Error checking for update:', error);
      return defaultResult;
    }
  }

  static getDownloadUrl(versionInfo: AppVersion): string | null {
    const platform = this.getCurrentPlatform();

    if (platform === 'ios') {
      return versionInfo.download_url_ios;
    } else if (platform === 'android') {
      return versionInfo.download_url_android;
    }

    return null;
  }
}
