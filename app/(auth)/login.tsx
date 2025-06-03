import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { login, isLoading } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};
    
    if (!phoneNumber) {
      newErrors.phone = 'WhatsApp number is required';
    } else if (!/^\d{10,11}$/.test(phoneNumber)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await login(phoneNumber, password);
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Login Failed', error instanceof Error ? error.message : 'Please try again');
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
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/6969809/pexels-photo-6969809.jpeg' }}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: colors.text }]}>AfriTrade</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Trade gift cards at the best rates
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Log In</Text>
          
          <Input
            label="WhatsApp Number"
            placeholder="Enter your WhatsApp number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={errors.phone}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          
          <Button
            title="Log In"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={isLoading}
            fullWidth
          />
          
          <View style={styles.orContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          <Button
            title="Continue with Google"
            variant="outline"
            onPress={() => {}}
            style={styles.socialButton}
            fullWidth
          />
          
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
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
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  socialButton: {
    marginBottom: Spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: Spacing.xs,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});