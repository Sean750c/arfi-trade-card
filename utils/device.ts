import { Platform, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function getDeviceType(): Promise<string> {
  // const deviceType = Device.deviceType === 1 ? 'phone' :
  //   Device.deviceType === 2 ? 'tablet' :
  //     Device.deviceType === 3 ? 'desktop' :
  //       Device.deviceType === 4 ? 'tv' : 'unknown';
  // return deviceType;
  if (Device.modelName) {
    return Device.modelName; // 更友好的设备名称
  }

  if (Device.modelId) {
    return Device.modelId; // 比如 "iPhone16,1" 或 "SM-G998B"
  }

  return 'unknown';
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

// 获取状态栏高度
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    return Constants.statusBarHeight || 0;
  } else {
    // Android 状态栏高度
    return StatusBar.currentHeight || 0;
  }
};

// 获取安全区域顶部高度（状态栏 + 可能的刘海屏区域）
export const getSafeAreaTopHeight = (): number => {
  const statusBarHeight = getStatusBarHeight();
  
  if (Platform.OS === 'ios') {
    // iOS 需要额外的安全区域
    return statusBarHeight + (Constants.statusBarHeight ? 0 : 44);
  } else {
    // Android 通常只需要状态栏高度
    return statusBarHeight;
  }
};

// 获取屏幕尺寸
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// 检查是否为刘海屏设备
export const isNotchDevice = (): boolean => {
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // 根据屏幕比例判断是否为刘海屏
  return aspectRatio > 2.1;
};

// 获取设备信息
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    statusBarHeight: getStatusBarHeight(),
    safeAreaTopHeight: getSafeAreaTopHeight(),
    screenDimensions: getScreenDimensions(),
    isNotch: isNotchDevice(),
  };
};