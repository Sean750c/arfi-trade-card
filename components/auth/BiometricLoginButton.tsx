import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Fingerprint, Scan } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import Spacing from '@/constants/Spacing';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
}

export default function BiometricLoginButton({ onSuccess }: BiometricLoginButtonProps) {
  const { colors } = useTheme();
  const {
    isSupported,
    isEnrolled,
    isEnabled,
    isLoading,
    availableTypes,
    getBiometricTypeName,
    authenticateWithBiometric,
  } = useBiometricAuth();

  // Don't show on web or if not supported/enabled
  if (!isSupported || !isEnrolled || !isEnabled) {
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});