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
  Image,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail, Phone, ChevronDown } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Country } from '@/types/api';

type RegistrationType = 'email' | 'whatsapp';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
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
            <View style={styles.countryPickerWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>Country</Text>
              <TouchableOpacity
                style={[
                  styles.countrySelector,
                  { 
                    backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
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
        </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? Spacing.xl + 20 : Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
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
    paddingRight: Spacing.lg,
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
  countryPickerWrapper: {
    marginBottom: Spacing.md,
    zIndex: 1000,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  countryName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  countryDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 200,
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
    maxHeight: 200,
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
    marginTop: Spacing.xs,
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