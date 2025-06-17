import { create } from 'zustand';
import { InitData, InitResponse } from '@/types';
import { APIRequest } from '@/utils/api';
import { Platform } from 'react-native';
import { generateDeviceId, getDeviceType } from '@/utils/device';

interface AppState {
  initData: InitData | null;
  isLoading: boolean;
  error: string | null;
  initialize: (userToken?: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  initData: null,
  isLoading: false,
  error: null,
  initialize: async (userToken?: string) => {
    set({ isLoading: true, error: null });
    try {
      const deviceNo = await generateDeviceId();
      const deviceType = await getDeviceType();
      
      // Prepare request parameters
      const requestParams: any = {
        os_type: Platform.OS,
        device_no: deviceNo,
        device_type: deviceType,
      };
      
      // Include token if user is logged in
      if (userToken) {
        requestParams.token = userToken;
      }
      
      const response = await APIRequest.request<InitResponse>(
        '/gc/public/appinit',
        'POST',
        requestParams
      );
      
      set({ initData: response.data, isLoading: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Don't set error state for token expiration, as it's handled by redirect
        set({ isLoading: false });
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false,
      });
    }
  },
}));