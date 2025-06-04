import { create } from 'zustand';
import { InitData, InitResponse } from '@/types/api';
import { APIRequest } from '@/utils/api';
import { generateDeviceId } from '@/utils/device';

interface AppState {
  initData: InitData | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  initData: null,
  isLoading: false,
  error: null,
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const deviceNo = await generateDeviceId();
      const response = await APIRequest.request<InitResponse>(
        '/gc/public/appinit',
        'POST',
        {
          os_type: 'web',
          device_no: deviceNo,
          device_type: 'web',
        }
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