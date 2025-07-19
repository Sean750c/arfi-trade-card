import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe,
  Zap,
  Shield,
  Award,
  CheckCircle,
  ArrowLeft
} from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuthStore();
  const { countries, selectedCountry } = useCountryStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    recommendCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerType, setRegisterType] = useState<'1' | '2' | '3'>('1');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.username.trim()) {
      Alert.alert('Missing Information', 'Please enter a username');
      return;
    }

    if (registerType === '2' && !formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address');
      return;
    }

    if (registerType === '3' && !formData.whatsapp.trim()) {
      Alert.alert('Missing Information', 'Please enter your WhatsApp number');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Missing Information', 'Please enter a password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      await register({
        username: formData.username.trim(),
        password: formData.password,
        country_id: selectedCountry?.id.toString() || '1',
        register_type: registerType,
        email: registerType === '2' ? formData.email.trim() : undefined,
        whatsapp: registerType === '3' ? formData.whatsapp.trim() : undefined,
        recommend_code: formData.recommendCode.trim() || undefined,
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const registerTypes = [
    { id: '1', title: 'Username', subtitle: 'Quick registration', icon: <User size={20} color="#FFFFFF" /> },
    { id: '2', title: 'Email', subtitle: 'Secure verification', icon: <Mail size={20} color="#FFFFFF" /> },
    { id: '3', title: 'WhatsApp', subtitle: 'Instant verification', icon: <Phone size={20} color="#FFFFFF" /> },
  ];

  const benefits = [
    {
      icon: <Shield size={16} color={colors.success} />,
      text: 'Bank-level security protection',
    },
    {
      icon: <Zap size={16} color={colors.primary} />,
      text: 'Instant trading capabilities',
    },
    {
      icon: <Award size={16} color={colors.warning} />,
      text: 'VIP membership benefits',
    },
  ];

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Professional Header */}
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.logoCircle}
                  >
                    <Zap size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.headerTitle}>Join TradePro</Text>
                <Text style={styles.headerSubtitle}>Start your professional trading journey</Text>
                
                <View style={styles.benefitsContainer}>
                  {benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      {benefit.icon}
                      <Text style={styles.benefitText}>{benefit.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Registration Form */}
          <View style={styles.formSection}>
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              {/* Registration Type Selector */}
              <View style={styles.typeSelector}>
                <Text style={[styles.typeSelectorTitle, { color: colors.text }]}>
                  Choose Registration Method
                </Text>
                <View style={styles.typeButtons}>
                  {registerTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: registerType === type.id ? colors.primary : colors.background,
                          borderColor: registerType === type.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setRegisterType(type.id as '1' | '2' | '3')}
                    >
                      <View style={[
                        styles.typeIcon,
                        { backgroundColor: registerType === type.id ? 'rgba(255, 255, 255, 0.2)' : `${colors.primary}15` }
                      ]}>
                        {React.cloneElement(type.icon, {
                          color: registerType === type.id ? '#FFFFFF' : colors.primary
                        })}
                      </View>
                      <Text style={[
                        styles.typeTitle,
                        { color: registerType === type.id ? '#FFFFFF' : colors.text }
                      ]}>
                        {type.title}
                      </Text>
                      <Text style={[
                        styles.typeSubtitle,
                        { color: registerType === type.id ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary }
                      ]}>
                        {type.subtitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formFields}>
                <Input
                  label="Username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {registerType === '2' && (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {registerType === '3' && (
                  <Input
                    label="WhatsApp Number"
                    placeholder="Enter your WhatsApp number"
                    value={formData.whatsapp}
                    onChangeText={(value) => updateFormData('whatsapp', value)}
                    keyboardType="phone-pad"
                  />
                )}

                <Input
                  label="Trading Password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
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

                <Input
                  label="Referral Code (Optional)"
                  placeholder="Enter referral code if you have one"
                  value={formData.recommendCode}
                  onChangeText={(value) => updateFormData('recommendCode', value)}
                  autoCapitalize="characters"
                />

                {/* Terms Agreement */}
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View style={[
                    styles.checkbox,
                    {
                      backgroundColor: agreedToTerms ? colors.primary : 'transparent',
                      borderColor: agreedToTerms ? colors.primary : colors.border,
                    }
                  ]}>
                    {agreedToTerms && <CheckCircle size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                    I agree to the{' '}
                    <Text style={{ color: colors.primary }}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.registerGradient}
                >
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.registerButtonText}>Creating Account...</Text>
                    ) : (
                      <>
                        <Zap size={20} color="#FFFFFF" />
                        <Text style={styles.registerButtonText}>Create Professional Account</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>

            {/* Social Registration */}
            <View style={styles.socialSection}>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                  Or register with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <SocialLoginButtons />
            </View>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have a professional account?
              </Text>
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: `${colors.primary}15` }]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={[styles.loginButtonText, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
  },
  benefitsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },

  // Form Section
  formSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  formCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // Type Selector
  typeSelector: {
    marginBottom: Spacing.xl,
  },
  typeSelectorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  typeSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // Form Fields
  formFields: {
    gap: Spacing.lg,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  registerGradient: {
    borderRadius: 16,
    marginTop: Spacing.md,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Social Section
  socialSection: {
    marginTop: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: Spacing.md,
  },

  // Login Section
  loginSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  loginButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});