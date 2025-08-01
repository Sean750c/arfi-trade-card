import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/useAuthStore';

interface BiometricAuthState {
  isSupported: boolean;
  isEnrolled: boolean;
  isEnabled: boolean;
  availableTypes: LocalAuthentication.AuthenticationType[];
  isLoading: boolean;
}

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export function useBiometricAuth() {
  const { login } = useAuthStore();
  const [state, setState] = useState<BiometricAuthState>({
    isSupported: false,
    isEnrolled: false,
    isEnabled: false,
    availableTypes: [],
    isLoading: false,
  });

  // Check biometric support and enrollment
  const checkBiometricSupport = async () => {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const availableTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnabledStr = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const isEnabled = isEnabledStr === 'true';

      setState({
        isSupported,
        isEnrolled,
        isEnabled: isEnabled && isSupported && isEnrolled,
        availableTypes,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkBiometricSupport();
    }
  }, []);

  // Re-check when component mounts or user changes
  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkBiometricSupport();
    }
  }, []);

  // Get biometric type name for display
  const getBiometricTypeName = (): string => {
    if (state.availableTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (state.availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (state.availableTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  };

  // Save user credentials for biometric login
  const saveCredentials = async (username: string, password: string) => {
    try {
      const credentials = { username, password };
      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  // Get saved credentials
  const getSavedCredentials = async (): Promise<{ username: string; password: string } | null> => {
    try {
      const credentialsStr = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      return credentialsStr ? JSON.parse(credentialsStr) : null;
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  };

  // Enable biometric authentication
  const enableBiometric = async (username: string, password: string): Promise<boolean> => {
    try {
      if (!state.isSupported || !state.isEnrolled) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device or not set up.'
        );
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${getBiometricTypeName()} login`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        await saveCredentials(username, password);
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        setState(prev => ({ ...prev, isEnabled: true }));
        return true;
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication was not successful.');
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication.');
      return false;
    }
  };

  // Disable biometric authentication
  const disableBiometric = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
      setState(prev => ({ ...prev, isEnabled: false }));
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  };

  // Authenticate with biometrics
  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!state.isEnabled) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Login with ${getBiometricTypeName()}`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        const credentials = await getSavedCredentials();
        if (credentials) {
          await login(credentials.username, credentials.password);
          setState(prev => ({ ...prev, isLoading: false }));
          return true;
        } else {
          Alert.alert('Error', 'Saved credentials not found. Please login with password.');
          setState(prev => ({ ...prev, isLoading: false }));
          return false;
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Authentication Error', 'Biometric authentication failed.');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Prompt user to enable biometric after successful login
  const promptEnableBiometric = async (username: string, password: string) => {
    if (state.isSupported && !state.isEnrolled && !state.isEnabled) {
      Alert.alert(
        'Enable Biometric Login',
        `Would you like to enable ${getBiometricTypeName()} login for faster access?`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => enableBiometric(username, password),
          },
        ]
      );
    }
  };

  return {
    ...state,
    getBiometricTypeName,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    promptEnableBiometric,
    checkBiometricSupport,
  };
}