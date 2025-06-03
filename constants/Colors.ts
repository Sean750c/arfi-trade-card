import { Theme } from '@react-navigation/native';

type ColorScheme = {
  text: string;
  textSecondary: string;
  background: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  notification: string;
  tabIconDefault: string;
};

type Colors = {
  light: ColorScheme;
  dark: ColorScheme;
};

const Colors: Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#008751', // Nigerian Green
    secondary: '#FFFFFF', // White
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    notification: '#EF4444',
    tabIconDefault: '#9CA3AF',
  },
  dark: {
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    background: '#111827',
    card: '#1F2937',
    border: '#374151',
    primary: '#008751', // Nigerian Green
    secondary: '#FFFFFF', // White
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    notification: '#F87171',
    tabIconDefault: '#6B7280',
  },
};

export default Colors;