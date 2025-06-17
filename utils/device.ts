import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

export async function getDeviceType(): Promise<string> {
  const deviceType = Device.deviceType === 1 ? 'phone' :
    Device.deviceType === 2 ? 'tablet' :
      Device.deviceType === 3 ? 'desktop' :
        Device.deviceType === 4 ? 'tv' : 'unknown';
  return deviceType;
}

// 主函数（异步）
export async function generateDeviceId(): Promise<string> {
  if (Platform.OS === 'web') {
    return generateWebFingerprint();
  }

  try {
    // Try to get a combination of device and installation info
    const deviceId = await getExpoDeviceId();
    return `${Platform.OS}_${deviceId}`;
  } catch (error) {
    // Fallback to persistent installation ID
    const installationId = await getPersistentInstallationId();
    return `${Platform.OS}_${installationId}`;
  }
}

// Expo-specific device ID generation
async function getExpoDeviceId(): Promise<string> {
  const parts = [];

  // Add device info that's relatively stable
  if (Device.modelName) parts.push(Device.modelName.replace(/\s+/g, '_'));
  if (Device.osName) parts.push(Device.osName);
  if (Device.osVersion) parts.push(Device.osVersion);

  // Add application-specific info
  if (Application.getAndroidId()) parts.push(Application.getAndroidId());
  if (Application.applicationId) parts.push(Application.applicationId);

  // Add installation ID (separate from our persistent one)
  const installationId = Application.getIosIdForVendorAsync
    ? await Application.getIosIdForVendorAsync()
    : null;
  if (installationId) parts.push(installationId);

  // Fallback if we couldn't get any device-specific info
  if (parts.length === 0) {
    throw new Error('No device identifiers available');
  }

  return parts.join('_');
}

// 持久化安装ID（异步）
async function getPersistentInstallationId(): Promise<string> {
  const storageKey = 'app_installation_id';
  try {
    const storedId = await AsyncStorage.getItem(storageKey);
    if (storedId) return storedId;

    const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(storageKey, newId);
    return newId;
  } catch (error) {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
}

// 浏览器指纹（同步）
function generateWebFingerprint(): string {
  const navigator = window.navigator as any;
  const screen = window.screen;

  const components = [
    navigator.userAgent,
    navigator.hardwareConcurrency,
    navigator.deviceMemory,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.platform,
    navigator.languages?.join(','),
    new Date().getTimezoneOffset(),
  ].filter(Boolean).join('|');

  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return `web_${Math.abs(hash).toString(36)}`;
}