import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail, Phone, ChevronDown } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import Spacing from '@/constants/Spacing';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Country } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useAppStore } from '@/stores/useAppStore';
import { AuthService } from '@/services/auth';

type RegistrationType = 'email' | 'whatsapp';

export default function RegisterScreen() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { countries, selectedCountry, setSelectedCountry } = useCountryStore();
  const { register, isLoading } = useAuthStore();

  const [registrationType, setRegistrationType] = useState<RegistrationType>('email');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { initData } = useAppStore();
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [verifyCodeCountdown, setVerifyCodeCountdown] = useState(0);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (verifyCodeCountdown > 0) {
      timer = setTimeout(() => setVerifyCodeCountdown(verifyCodeCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [verifyCodeCountdown]);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCountry) {
      newErrors.country = 'Please select a country';
    }

    if (registrationType === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!formData.whatsapp) {
        newErrors.whatsapp = 'WhatsApp number is required';
      } else if (!/^\d{10,11}$/.test(formData.whatsapp)) {
        newErrors.whatsapp = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    if (initData?.is_need_verify === '1') {
      if (!verifyCode) {
        newErrors.verifyCode = 'Verification code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await register({
          register_type: registrationType === 'email' ? '1' : '2',
          country_id: selectedCountry?.id.toString() || '',
          username: registrationType === 'email' ? formData.email : formData.whatsapp,
          password: formData.password,
          email: registrationType === 'email' ? formData.email : '',
          whatsapp: registrationType === 'whatsapp' ? formData.whatsapp : '',
          recommend_code: formData.referralCode || '',
          code: initData?.is_need_verify === '1' ? verifyCode : '',
        });

        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Please try again');
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleTermsPress = () => {
    router.push('/profile/terms-of-service');
  };

  const handlePrivacyPress = () => {
    router.push('/profile/privacy-policy');
  };

  const sendVerifyCode = async () => {
    if (registrationType === 'email') {
      if (!formData.email) {
        setErrors((prev) => ({ ...prev, email: 'Email is required' }));
        return;
      }
    } else {
      if (!formData.whatsapp) {
        setErrors((prev) => ({ ...prev, whatsapp: 'WhatsApp number is required' }));
        return;
      }
    }
    setVerifyCodeLoading(true);
    try {
      if (registrationType === 'email') {
        await AuthService.sendEmailVerifyCode(formData.email);
      } else {
        await AuthService.sendWhatsAppCode(formData.whatsapp);
      }
      setVerifyCodeCountdown(60);
      Alert.alert('Success', 'Verification code sent');
    } catch (error) {
      Alert.alert('Failed', error instanceof Error ? error.message : 'Failed to send code');
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaWrapper style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Join AfriTrade to start trading gift cards
              </Text>
            </View>
          </View>

          {/* Registration Type Selection */}
          <View style={styles.registrationTypeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                {
                  backgroundColor:
                    registrationType === 'email'
                      ? `${colors.primary}20`
                      : colors.card,
                  borderColor:
                    registrationType === 'email' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRegistrationType('email')}
            >
              <Mail
                size={20}
                color={registrationType === 'email' ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color: registrationType === 'email' ? colors.primary : colors.text,
                  },
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                {
                  backgroundColor:
                    registrationType === 'whatsapp'
                      ? `${colors.primary}20`
                      : colors.card,
                  borderColor:
                    registrationType === 'whatsapp' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setRegistrationType('whatsapp')}
            >
              <Phone
                size={20}
                color={registrationType === 'whatsapp' ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color: registrationType === 'whatsapp' ? colors.primary : colors.text,
                  },
                ]}
              >
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Country Selector */}
            <View style={styles.inputGroup}>
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
            </View>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
              {registrationType === 'email' ? (
                <Input
                  label="Email Address"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  error={errors.email}
                />
              ) : (
                <Input
                  label="WhatsApp Number"
                  placeholder="Enter your WhatsApp number"
                  keyboardType="phone-pad"
                  value={formData.whatsapp}
                  onChangeText={(value) => updateField('whatsapp', value)}
                  error={errors.whatsapp}
                />
              )}
            </View>

            {initData?.is_need_verify === '1' && (
              <View style={styles.inputGroup}>
                <Input
                  label="Verification Code"
                  placeholder="Enter verification code"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  error={errors.verifyCode}
                  rightElement={
                    <TouchableOpacity
                      onPress={sendVerifyCode}
                      disabled={verifyCodeCountdown > 0 || verifyCodeLoading}
                      style={{ paddingHorizontal: 8 }}
                    >
                      <Text style={{ color: verifyCodeCountdown > 0 ? colors.textSecondary : colors.primary }}>
                        {verifyCodeCountdown > 0 ? `${verifyCodeCountdown}s` : 'Send Code'}
                      </Text>
                    </TouchableOpacity>
                  }
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Input
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                error={errors.confirmPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Referral Code (Optional)"
                placeholder="Enter referral code if any"
                value={formData.referralCode}
                onChangeText={(value) => updateField('referralCode', value)}
              />
            </View>

            {/* Terms Agreement */}
            <View style={[styles.inputGroup, styles.termsContainer]}>
              <Switch
                value={termsAccepted}
                onValueChange={setTermsAccepted}
                trackColor={{ false: '#D1D5DB', true: `${colors.primary}50` }}
                thumbColor={termsAccepted ? colors.primary : '#F4F4F5'}
              />
              <Text style={[styles.termsText, { color: colors.text }]}>
                I agree to the{' '}
                <Text
                  style={[styles.termsLink, { color: colors.primary }]}
                  onPress={handleTermsPress}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={[styles.termsLink, { color: colors.primary }]}
                  onPress={handlePrivacyPress}
                >
                  Privacy Policy
                </Text>
              </Text>
              {errors.terms && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.terms}
                </Text>
              )}
            </View>

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                style={styles.registerButton}
                loading={isLoading}
                fullWidth
              />
            </View>

            {/* <View style={styles.orContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
            
            <SocialLoginButtons /> */}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'android' ? Spacing.xl + 20 : Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  registrationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.xs,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter-SemiBold',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  registerButton: {
    height: 56,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginRight: Spacing.xs,
  },
  loginLink: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});