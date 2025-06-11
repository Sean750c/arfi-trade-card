import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Calculator, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface FloatingCalculatorProps {
  calculatedAmount: number;
  selectedCurrency: string;
  currencies: Array<{ code: string; symbol: string; name: string }>;
  visible: boolean;
  onToggleVisibility: () => void;
}

export default function FloatingCalculator({ 
  calculatedAmount, 
  selectedCurrency, 
  currencies,
  visible,
  onToggleVisibility
}: FloatingCalculatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const currencySymbol = currencies.find(c => c.code === selectedCurrency)?.symbol || '₦';

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.primary,
        shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)',
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Calculator size={16} color="#FFFFFF" />
          <Text style={styles.label}>You'll receive</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {visible 
              ? `${currencySymbol}${calculatedAmount.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`
              : '****'
            }
          </Text>
          <TouchableOpacity 
            onPress={onToggleVisibility}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {visible ? (
              <Eye size={16} color="rgba(255, 255, 255, 0.8)" />
            ) : (
              <EyeOff size={16} color="rgba(255, 255, 255, 0.8)" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, // Fixed at the very top
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  eyeButton: {
    padding: Spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});