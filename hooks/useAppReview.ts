import { useEffect, useCallback } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  REVIEW_REQUESTED: 'app_review_requested',
  REVIEW_LAST_PROMPTED: 'app_review_last_prompted',
  APP_LAUNCH_COUNT: 'app_launch_count',
  FIRST_LAUNCH_DATE: 'app_first_launch_date',
  SIGNIFICANT_EVENTS_COUNT: 'app_significant_events_count',
};

const REVIEW_CONFIG = {
  MIN_LAUNCHES: 10,
  MIN_DAYS_SINCE_INSTALL: 7,
  MIN_SIGNIFICANT_EVENTS: 3,
  COOLDOWN_DAYS: 90,
};

export function useAppReview() {
  useEffect(() => {
    incrementLaunchCount();
  }, []);

  const incrementLaunchCount = async () => {
    try {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCH_COUNT);
      const count = countStr ? parseInt(countStr, 10) : 0;
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LAUNCH_COUNT, (count + 1).toString());

      const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH_DATE);
      if (!firstLaunch) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH_DATE, new Date().toISOString());
      }
    } catch (error) {
      console.error('Error incrementing launch count:', error);
    }
  };

  const recordSignificantEvent = useCallback(async () => {
    try {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.SIGNIFICANT_EVENTS_COUNT);
      const count = countStr ? parseInt(countStr, 10) : 0;
      await AsyncStorage.setItem(STORAGE_KEYS.SIGNIFICANT_EVENTS_COUNT, (count + 1).toString());
    } catch (error) {
      console.error('Error recording significant event:', error);
    }
  }, []);

  const shouldRequestReview = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') return false;

      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return false;

      const hasRequested = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED);
      if (hasRequested === 'true') return false;

      const lastPromptedStr = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_LAST_PROMPTED);
      if (lastPromptedStr) {
        const lastPrompted = new Date(lastPromptedStr);
        const daysSinceLastPrompt = (Date.now() - lastPrompted.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPrompt < REVIEW_CONFIG.COOLDOWN_DAYS) {
          return false;
        }
      }

      const launchCountStr = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCH_COUNT);
      const launchCount = launchCountStr ? parseInt(launchCountStr, 10) : 0;
      if (launchCount < REVIEW_CONFIG.MIN_LAUNCHES) return false;

      const firstLaunchStr = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH_DATE);
      if (firstLaunchStr) {
        const firstLaunch = new Date(firstLaunchStr);
        const daysSinceInstall = (Date.now() - firstLaunch.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceInstall < REVIEW_CONFIG.MIN_DAYS_SINCE_INSTALL) return false;
      }

      const eventsCountStr = await AsyncStorage.getItem(STORAGE_KEYS.SIGNIFICANT_EVENTS_COUNT);
      const eventsCount = eventsCountStr ? parseInt(eventsCountStr, 10) : 0;
      if (eventsCount < REVIEW_CONFIG.MIN_SIGNIFICANT_EVENTS) return false;

      return true;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  };

  const requestReview = useCallback(async () => {
    try {
      const shouldRequest = await shouldRequestReview();

      if (shouldRequest) {
        await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_LAST_PROMPTED, new Date().toISOString());
        await StoreReview.requestReview();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting review:', error);
      return false;
    }
  }, []);

  const requestReviewAfterEvent = useCallback(async () => {
    await recordSignificantEvent();
    return requestReview();
  }, [recordSignificantEvent, requestReview]);

  const markReviewCompleted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, 'true');
    } catch (error) {
      console.error('Error marking review as completed:', error);
    }
  }, []);

  return {
    recordSignificantEvent,
    requestReview,
    requestReviewAfterEvent,
    markReviewCompleted,
    shouldRequestReview,
  };
}
