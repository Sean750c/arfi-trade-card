import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useCountryStore } from '@/stores/useCountryStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface CountrySelectorProps {
  onPress?: () => void;
}

export default function CountrySelector({ onPress }: CountrySelectorProps) {
  const { colors } = useTheme();
  const { selectedCountry, isLoading, error } = useCountryStore();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: `${colors.primary}10` }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading countries...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: `${colors.error}10` }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load countries
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: `${colors.primary}10` }]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {selectedCountry?.national_flag} {selectedCountry?.name}
      </Text>
      <ChevronDown size={16} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Spacing.xs,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});