import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail, MessageCircle, ArrowRight, Shield, Phone } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { AuthService } from '@/services/auth';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import * as Linking from 'expo-linking';
import { useAppStore } from '@/stores/useAppStore';

type RecoveryMethod = 'email' | 'whatsapp';

export default function ForgotPasswordScreen() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();

  const { initData } = useAppStore();
  
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('email');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'method' | 'verify' | 'reset'>('method');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateWhatsApp = (whatsapp: string) => {
    return /^\d{10,15}$/.test(whatsapp);
  };

  const handleSendCode = async () => {
    // 强制关闭键盘
    Keyboard.dismiss();
    
    const newErrors: Record<string, string> = {};
    
    if (recoveryMethod === 'email') {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!whatsapp) {
        newErrors.whatsapp = 'WhatsApp number is required';
      } else if (!validateWhatsApp(whatsapp)) {
        newErrors.whatsapp = 'Please enter a valid WhatsApp number';
      }
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      if (recoveryMethod === 'email') {
        await AuthService.sendResetPasswordEmail(email);
        Alert.alert('Code Sent', 'A verification code has been sent to your email address.');
      } else {
        await AuthService.sendWhatsAppCode(whatsapp);
        Alert.alert('Code Sent', 'A verification code has been sent to your WhatsApp number.');
      }
      setStep('verify');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // 强制关闭键盘
    Keyboard.dismiss();
    
    const newErrors: Record<string, string> = {};
    
    if (!verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      if (recoveryMethod === 'email') {
        await AuthService.updatePasswordByEmail({
          email,
          verify_code: verificationCode,
          new_password: newPassword,
        });
      } else {
        await AuthService.updatePasswordByWhatsApp({
          whatsapp,
          verify_code: verificationCode,
          new_password: newPassword,
        });
      }
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'Login Now',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'method') {
      router.back();
    } else if (step === 'verify') {
      setStep('method');
    } else {
      setStep('verify');
    }
  };

  // 联系客服，打开 WhatsApp
  const handleContactPress = () => {
    const phone = initData?.service_phone;
    if (phone) {
      const url = `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Unable to open WhatsApp', 'Please check if WhatsApp is installed or if the phone number is correct.');
      });
    } else {
      Alert.alert('Unable to get service phone', 'Please try again later.');
    }
  };

  const renderMethodSelection = () => (
    <View style={styles.content}>
      <View style={styles.headerSection}>
        <Shield size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Reset Your Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how you'd like to receive your verification code
        </Text>
      </View>

      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={[
            styles.methodOption,
            {
              backgroundColor: recoveryMethod === 'email' ? `${colors.primary}20` : 'transparent',
              borderColor: recoveryMethod === 'email' ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setRecoveryMethod('email')}
        >
          <Mail size={24} color={recoveryMethod === 'email' ? colors.primary : colors.text} />
          <View style={styles.methodText}>
            <Text style={[styles.methodTitle, { color: colors.text }]}>
              Email Address
            </Text>
            <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
              We'll send a verification code to your email
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodOption,
            {
              backgroundColor: recoveryMethod === 'whatsapp' ? `${colors.primary}20` : 'transparent',
              borderColor: recoveryMethod === 'whatsapp' ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setRecoveryMethod('whatsapp')}
        >
          <MessageCircle size={24} color={recoveryMethod === 'whatsapp' ? colors.primary : colors.text} />
          <View style={styles.methodText}>
            <Text style={[styles.methodTitle, { color: colors.text }]}>
              WhatsApp Number
            </Text>
            <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
              We'll send a verification code to your WhatsApp
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        {recoveryMethod === 'email' ? (
          <Input
            label="Email Address"
            placeholder="Enter your email address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
        ) : (
          <Input
            label="WhatsApp Number"
            placeholder="Enter your WhatsApp number"
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
            error={errors.whatsapp}
          />
        )}
      </View>

      <Button
        title="Send Verification Code"
        onPress={handleSendCode}
        loading={isLoading}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        fullWidth
      />
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.content}>
      <View style={styles.headerSection}>
        <Shield size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Enter Verification Code
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We've sent a verification code to your {recoveryMethod === 'email' ? 'email' : 'WhatsApp'}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Input
          label="Verification Code"
          placeholder="Enter the 6-digit code"
          keyboardType="number-pad"
          value={verificationCode}
          onChangeText={setVerificationCode}
          error={errors.verificationCode}
          maxLength={6}
        />
      </View>

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: colors.textSecondary }]}>
          Didn't receive the code?
        </Text>
        <TouchableOpacity onPress={handleSendCode}>
          <Text style={[styles.resendLink, { color: colors.primary }]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Verify Code"
        onPress={() => setStep('reset')}
        disabled={!verificationCode}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        fullWidth
      />
    </View>
  );

  const renderPasswordReset = () => (
    <View style={styles.content}>
      <View style={styles.headerSection}>
        <Shield size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Create New Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your new password below
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Input
          label="New Password"
          placeholder="Enter your new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.newPassword}
        />

        <Input
          label="Confirm New Password"
          placeholder="Confirm your new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
        />
      </View>

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={isLoading}
        rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
        fullWidth
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerSpacer} />

          <TouchableOpacity
              onPress={handleContactPress}
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'method' && renderMethodSelection()}
          {step === 'verify' && renderVerificationStep()}
          {step === 'reset' && renderPasswordReset()}
        </ScrollView>
      </SafeAreaWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  content: {
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  methodContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
  },
  methodText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resendLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
    gap: Spacing.xs,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerSpacer: {
    flex: 1,
  },
});