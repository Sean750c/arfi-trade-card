import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { User, RegisterRequest, Country } from '@/types';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { Eye, EyeOff, User as UserIcon, Mail, MessageCircle, ChevronDown } from 'lucide-react-native';

interface SocialRegisterParams {
  username?: string;
  social_id: string;
  social_type?: string;
  social_email?: string;
}

export default function SocialRegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading, error, setUser } = useAuthStore();
  const { countries, setSelectedCountry, selectedCountry } = useCountryStore();
  const params = useLocalSearchParams() as unknown as SocialRegisterParams;

  const [username, setUsername] = useState(params.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
    }
  }, [error]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    // 强制关闭键盘
    Keyboard.dismiss();
    
    if (!validateForm() || !selectedCountry) return;

    const registerData: RegisterRequest = {
      username: username.trim(),
      password: password,
      country_id: selectedCountry.id.toString(),
      register_type: '1', // Assuming '3' for social registration
      email: params.social_email,
      social_id: params.social_id,
      social_type: params.social_type
      // whatsapp: params.whatsapp, // If WhatsApp is part of social data
      // recommend_code: params.recommend_code, // If applicable
      // code: params.code, // If verification code is needed
    };

    try {
      // Call the register method from useAuthStore
      await register(registerData);
      Alert.alert('Success', 'Account created and linked successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e) {
      // Error handled by useAuthStore and displayed via useEffect
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  // 页面获得焦点时关闭键盘
  useFocusEffect(
    React.useCallback(() => {
      // 页面获得焦点时关闭键盘
      Keyboard.dismiss();
    }, [])
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Complete Your Registration</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Just a few more steps to set up your account.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Country</Text>
            <TouchableOpacity
              style={[
                styles.countrySelector,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.country ? colors.error : colors.border,
                },
              ]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              {selectedCountry ? (
                <View style={styles.selectedCountry}>
                  <Image
                    source={{ uri: selectedCountry.image }}
                    style={styles.countryFlag}
                    resizeMode="cover"
                  />
                  <Text style={[styles.countryName, { color: colors.text }]}>
                    {selectedCountry.name}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Select your country
                </Text>
              )}
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>

            {showCountryPicker && (
              <View
                style={[
                  styles.countryDropdown,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ScrollView
                  style={styles.countryScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {countries.map((country) => (
                    <TouchableOpacity
                      key={country.id}
                      style={[
                        styles.countryOption,
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Image
                        source={{ uri: country.image }}
                        style={styles.countryFlag}
                        resizeMode="cover"
                      />
                      <Text style={[styles.countryName, { color: colors.text }]}>
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {errors.country && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.country}
              </Text>
            )}

            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              keyboardType="default"
              autoCapitalize="none"
              error={errors.username}
            />

            {params.social_email && (
              <Input
                label="Email (from social login)"
                value={params.social_email}
                editable={false}
                inputStyle={{ opacity: 0.7 }}
              />
            )}

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              rightElement={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Button
              title={isLoading ? 'Registering...' : 'Complete Registration'}
              onPress={handleRegister}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={[styles.loginText, { color: colors.primary }]}>
                Already have an account? <Text style={styles.loginLink}>Login here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: Spacing.md,
  },
  registerButton: {
    marginTop: Spacing.lg,
  },
  loginText: {
    marginTop: Spacing.md,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.sm,
  },
  countryName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  countryDropdown: {
    position: 'absolute',
    top: 80,
    left: Spacing.lg,
    right: Spacing.lg,
    maxHeight: 250,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countryScrollView: {
    maxHeight: 250,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
});