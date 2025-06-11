import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Calculator } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface QuickCalculatorProps {
  calculatedAmount: number;
  selectedCurrency: string;
  currencies: Array<{ code: string; symbol: string; name: string }>;
}

export default function QuickCalculator({ 
  calculatedAmount, 
  selectedCurrency, 
  currencies 
}: QuickCalculatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const currencySymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || '₦';
  const currencyName = currencies.find(c => c.code === selectedCurrency)?.name || 'Nigerian Naira';

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.header}>
        <Calculator size={20} color="#FFFFFF" />
        <Text style={styles.title}>You will receive</Text>
      </View>
      
      <Text style={styles.amount}>
        {currencySymbol}{calculatedAmount.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </Text>
      
      <Text style={styles.currency}>{currencyName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  currency: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});