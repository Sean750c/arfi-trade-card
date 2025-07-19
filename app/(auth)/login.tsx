import React, { useState } from 'react';
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
import { Eye, EyeOff, Lock, User, Zap, Shield, TrendingUp } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both username and password');
      return;
    }

    try {
      await login(username.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const features = [
    {
      icon: <Shield size={20} color="#FFFFFF" />,
      title: 'Bank-Level Security',
      subtitle: 'Advanced encryption',
    },
    {
      icon: <Zap size={20} color="#FFFFFF" />,
      title: 'Instant Trading',
      subtitle: '5-15 min processing',
    },
    {
      icon: <TrendingUp size={20} color="#FFFFFF" />,
      title: 'Premium Rates',
      subtitle: 'Best market prices',
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
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.logoCircle}
                >
                  <Zap size={40} color="#FFFFFF" />
                </LinearGradient>
              </View>
              
              <Text style={styles.appTitle}>TradePro</Text>
              <Text style={styles.appSubtitle}>Professional Trading Platform</Text>
              
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      {feature.icon}
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Welcome Back
                </Text>
                <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                  Sign in to your professional trading account
                </Text>
              </View>

              <View style={styles.formContent}>
                <Input
                  label="Username or Email"
                  placeholder="Enter your username or email"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  rightElement={<User size={20} color={colors.textSecondary} />}
                />

                <Input
                  label="Trading Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Lock size={16} color={colors.primary} />
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                    Forgot your trading password?
                  </Text>
                </TouchableOpacity>

                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.loginGradient}
                >
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.loginButtonText}>Authenticating...</Text>
                    ) : (
                      <>
                        <Zap size={20} color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>

            {/* Social Login */}
            <View style={styles.socialSection}>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                  Or continue with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <SocialLoginButtons />
            </View>

            {/* Register Link */}
            <View style={styles.registerSection}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                New to professional trading?
              </Text>
              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: `${colors.primary}15` }]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={[styles.registerButtonText, { color: colors.primary }]}>
                  Create Professional Account
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xl,
  },
  featuresContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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
  formHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  formTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  formContent: {
    gap: Spacing.lg,
  },
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loginGradient: {
    borderRadius: 16,
    marginTop: Spacing.md,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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

  // Register Section
  registerSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  registerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  registerButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});