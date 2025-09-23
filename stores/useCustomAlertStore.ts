import { create } from 'zustand';

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertOptions {
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
}

interface CustomAlertState {
  isVisible: boolean;
  options: CustomAlertOptions;
  showCustomAlert: (options: CustomAlertOptions) => void;
  hideCustomAlert: () => void;
}

export const useCustomAlertStore = create<CustomAlertState>((set) => ({
  isVisible: false,
  options: {
    title: '',
    message: '',
    buttons: [],
  },
  showCustomAlert: (options) => set({ isVisible: true, options }),
  hideCustomAlert: () => set({ isVisible: false, options: { title: '', message: '', buttons: [] } }),
}));