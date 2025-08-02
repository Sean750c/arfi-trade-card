import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Fingerprint, Scan } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAppStore } from '@/stores/useAppStore';
import Spacing from '@/constants/Spacing';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert } from 'react-native';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
}

export default function BiometricLoginButton({ onSuccess }: BiometricLoginButtonProps) {
  const { colors } = useTheme();
  const { initData } = useAppStore();
  const {
    isSupported,
    isEnrolled,
    isEnabled,
    isLoading,
    availableTypes,
    getBiometricTypeName,
    authenticateWithBiometric,
  } = useBiometricAuth();

  // Debug logging to see what's happening
  // console.log('BiometricLoginButton - isSupported:', isSupported);
  // console.log('BiometricLoginButton - isEnrolled:', isEnrolled);
  // console.log('BiometricLoginButton - isEnabled:', isEnabled);
  // console.log('BiometricLoginButton - Platform:', Platform.OS);

  // Don't show on web
  if (Platform.OS === 'web') {
    return null;
  }

  // Check if biometric is enabled in initData
  if (initData?.biometric_enable === false) {
    return null;
  }

  // Show button if supported and enrolled, regardless of enabled status
  // This allows users to enable biometric login from the login screen
  if (!isSupported || !isEnrolled) {
    return null;
  }

  const handleBiometricLogin = async () => {
    const success = await authenticateWithBiometric();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const getIcon = () => {
    if (availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return <Scan size={24} color={colors.primary} />;
    }
    return <Fingerprint size={24} color={colors.primary} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: `${colors.primary}10`,
          borderColor: colors.primary,
        },
      ]}
      onPress={handleBiometricLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        getIcon()
      )}
      <Text style={[styles.buttonText, { color: colors.primary }]}>
        {isLoading ? 'Authenticating...' : `Login with ${getBiometricTypeName()}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});