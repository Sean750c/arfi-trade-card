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
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    referralCode: '',
  });
  
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'WhatsApp number is required';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // In a real app, we would make an API call here
      router.replace('/(tabs)');
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
        
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Sign up to start trading gift cards at the best rates
          </Text>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            error={errors.name}
          />
          
          <Input
            label="WhatsApp Number"
            placeholder="Enter your WhatsApp number"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            error={errors.phoneNumber}
          />
          
          <Input
            label="Email (Optional)"
            placeholder="Enter your email address"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
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
    marginBottom: Spacing.lg,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.lg,
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