import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import PromoBanner from '@/components/home/PromoBanner';
import QuickActions from '@/components/home/QuickActions';
import RecentTransactions from '@/components/home/RecentTransactions';
import PromoTimer from '@/components/home/PromoTimer';

// Mock user data - in a real app, this would come from your auth system
const user = {
  isLoggedIn: false,
  country: null,
};

// Available countries
const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <TouchableOpacity
              style={[styles.countrySelector, { backgroundColor: `${colors.primary}10` }]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={[styles.countryText, { color: colors.text }]}>
                {selectedCountry.flag} {selectedCountry.name}
              </Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
            {showCountryPicker && (
              <View style={[styles.countryDropdown, { backgroundColor: colors.card }]}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={[styles.countryOptionText, { color: colors.text }]}>
                      {country.flag} {country.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: `${colors.primary}10` }]}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color={colors.primary} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <PromoBanner />
        <QuickActions />
        <PromoTimer />
        <RecentTransactions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  countryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Spacing.xs,
  },
  countryDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  countryOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  countryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});