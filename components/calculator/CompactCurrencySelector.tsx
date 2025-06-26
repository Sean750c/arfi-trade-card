import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CompactCurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
}

export default function CompactCurrencySelector({
  currencies,
  selectedCurrency,
  onSelectCurrency,
}: CompactCurrencySelectorProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Receive In</Text>
      
      <View style={styles.currencyRow}>
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyOption,
              {
                backgroundColor: selectedCurrency === currency.code
                  ? colors.primary
                  : colors.card,
                borderColor: selectedCurrency === currency.code ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelectCurrency(currency.code)}
          >
            <View style={styles.currencyContent}>
              <Text style={[
                styles.currencySymbol,
                { color: selectedCurrency === currency.code ? '#FFFFFF' : colors.primary }
              ]}>
                {currency.symbol}
              </Text>
              <Text style={[
                styles.currencyCode,
                { color: selectedCurrency === currency.code ? '#FFFFFF' : colors.text }
              ]}>
                {currency.code}
              </Text>
            </View>
            {selectedCurrency === currency.code && (
              <CheckCircle size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  currencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
  },
  currencyContent: {
    alignItems: 'center',
    gap: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  currencyCode: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});