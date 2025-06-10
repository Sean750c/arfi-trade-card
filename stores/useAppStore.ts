import { create } from 'zustand';
import { InitData, InitResponse } from '@/types/api';
import { APIRequest } from '@/utils/api';
import { generateDeviceId } from '@/utils/device';

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
      
      // Prepare request parameters
      const requestParams: any = {
        os_type: 'web',
        device_no: deviceNo,
        device_type: 'web',
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
      set({
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false,
      });
    }
  },
}));