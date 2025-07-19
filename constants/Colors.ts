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
  accent: string;
  surface: string;
  gradient1: string;
  gradient2: string;
};

type Colors = {
  light: ColorScheme;
  dark: ColorScheme;
};

const Colors: Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: '#7C3AED', // Purple primary
    secondary: '#F1F5F9',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    notification: '#DC2626',
    tabIconDefault: '#94A3B8',
    accent: '#EC4899', // Pink accent
    surface: '#F8FAFC',
    gradient1: '#7C3AED',
    gradient2: '#EC4899',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    primary: '#8B5CF6', // Purple primary
    secondary: '#1E293B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    notification: '#EF4444',
    tabIconDefault: '#64748B',
    accent: '#F472B6', // Pink accent
    surface: '#1E293B',
    gradient1: '#8B5CF6',
    gradient2: '#F472B6',
  },
};

export default Colors;