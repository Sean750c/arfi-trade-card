import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VersionService } from '@/services/version';
import { useVersionStore } from '@/stores/useVersionStore';

const STORAGE_KEYS = {
  LAST_CHECK_TIME: 'version_last_check_time',
  SKIPPED_VERSION: 'version_skipped_version',
};

const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export function useVersionCheck() {
  const {
    versionCheckResult,
    showUpdateModal,
    hasCheckedVersion,
    setVersionCheckResult,
    setShowUpdateModal,
    setHasCheckedVersion,
  } = useVersionStore();

  const shouldCheckVersion = useCallback(async (): Promise<boolean> => {
    try {
      const lastCheckStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECK_TIME);

      if (!lastCheckStr) {
        return true;
      }

      const lastCheck = parseInt(lastCheckStr, 10);
      const now = Date.now();

      return now - lastCheck > CHECK_INTERVAL;
    } catch (error) {
      console.error('Error checking version check time:', error);
      return true;
    }
  }, []);

  const checkVersion = useCallback(async (force: boolean = false) => {
    try {
      if (!force) {
        const shouldCheck = await shouldCheckVersion();
        if (!shouldCheck) {
          return;
        }
      }

      const result = await VersionService.checkForUpdate();

      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK_TIME, Date.now().toString());

      setVersionCheckResult(result);
      setHasCheckedVersion(true);
      if (result.needsUpdate) {
        const skippedVersion = await AsyncStorage.getItem(STORAGE_KEYS.SKIPPED_VERSION);
        if (result.updateType === 'force' || !result.canSkip) {
          setShowUpdateModal(true);
        } else if (skippedVersion !== result.latestVersion) {
          setShowUpdateModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking version:', error);
      setHasCheckedVersion(true);
    }
  }, [shouldCheckVersion, setVersionCheckResult, setShowUpdateModal, setHasCheckedVersion]);

  const skipVersion = useCallback(async () => {
    if (versionCheckResult && versionCheckResult.canSkip) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SKIPPED_VERSION,
        versionCheckResult.latestVersion
      );
      setShowUpdateModal(false);
    }
  }, [versionCheckResult, setShowUpdateModal]);

  const handleUpdate = useCallback(() => {
    setShowUpdateModal(false);
  }, [setShowUpdateModal]);

  useEffect(() => {
    checkVersion();
  }, []);

  return {
    versionCheckResult,
    showUpdateModal,
    hasCheckedVersion,
    checkVersion,
    skipVersion,
    handleUpdate,
    setShowUpdateModal,
  };
}
