import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail, Phone } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';

type RegistrationType = 'email' | 'whatsapp';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { selectedCountry } = useCountryStore();
  const { register, isLoading } = useAuthStore();
  
  const [registrationType, setRegistrationType] = useState<RegistrationType>('email');
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    verificationCode: '',
  });
  
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
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
    
    if (!formData.verificationCode && isVerificationSent) {
      newErrors.verificationCode = 'Verification code is required';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerificationCode = () => {
    if (registrationType === 'email' && !formData.email) {
      setErrors({ email: 'Please enter your email first' });
      return;
    }
    if (registrationType === 'whatsapp' && !formData.whatsapp) {
      setErrors({ whatsapp: 'Please enter your WhatsApp number first' });
      return;
    }
    
    // In a real app, you would make an API call here to send the verification code
    setIsVerificationSent(true);
    Alert.alert('Verification Code Sent', 'Please check your email/WhatsApp for the verification code');
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await register({
          register_type: registrationType === 'email' ? '1' : '2',
          country_id: selectedCountry?.id.toString() || '',
          username: registrationType === 'email' ? formData.email : formData.whatsapp,
          password: formData.password,
          email: registrationType === 'email' ? formData.email : undefined,
          whatsapp: registrationType === 'whatsapp' ? formData.whatsapp : undefined,
          recommend_code: formData.referralCode || undefined,
          code: formData.verificationCode,
        });
        
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Please try again');
      }
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join AfriTrade to start trading gift cards
            </Text>
          </View>
        </View>

        <View style={styles.registrationTypeContainer}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              {
                backgroundColor:
                  registrationType === 'email'
                    ? `${colors.primary}20`
                    : colorScheme === 'dark'
                    ? colors.card
                    : '#F9FAFB',
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
                    : colorScheme === 'dark'
                    ? colors.card
                    : '#F9FAFB',
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

        <View style={styles.formContainer}>
          {registrationType === 'email' ? (
            <Input
              label="Email Address"
              placeholder="Enter your email address"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              rightElement={
                <Button
                  title="Send Code"
                  variant="outline"
                  size="sm"
                  onPress={handleSendVerificationCode}
                  disabled={isVerificationSent}
                />
              }
            />
          ) : (
            <Input
              label="WhatsApp Number"
              placeholder="Enter your WhatsApp number"
              keyboardType="phone-pad"
              value={formData.whatsapp}
              onChangeText={(value) => updateField('whatsapp', value)}
              error={errors.whatsapp}
              rightElement={
                <Button
                  title="Send Code"
                  variant="outline"
                  size="sm"
                  onPress={handleSendVerificationCode}
                  disabled={isVerificationSent}
                />
              }
            />
          )}

          {isVerificationSent && (
            <Input
              label="Verification Code"
              placeholder="Enter verification code"
              keyboardType="number-pad"
              value={formData.verificationCode}
              onChangeText={(value) => updateField('verificationCode', value)}
              error={errors.verificationCode}
            />
          )}
          
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
          />
          
          <Input
            label="Referral Code (Optional)"
            placeholder="Enter referral code if any"
            value={formData.referralCode}
            onChangeText={(value) => updateField('referralCode', value)}
          />
          
          <View style={styles.termsContainer}>
            <Switch
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              trackColor={{ false: '#D1D5DB', true: `${colors.primary}50` }}
              thumbColor={termsAccepted ? colors.primary : '#F4F4F5'}
            />
            <Text style={[styles.termsText, { color: colors.text }]}>
              I agree to the{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
          {errors.terms && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.terms}
            </Text>
          )}
          
          <Button
            title="Create Account"
            onPress={handleRegister}
            style={styles.registerButton}
            loading={isLoading}
            fullWidth
          />
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  registrationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
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
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.xs,
  },
  formContainer: {
    width: '100%',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  registerButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: Spacing.xs,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});