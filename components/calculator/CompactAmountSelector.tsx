import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface CompactAmountSelectorProps {
  denominations: string[];
  selectedDenomination: string;
  customAmount: string;
  onSelectDenomination: (denom: string) => void;
  onCustomAmountChange: (amount: string) => void;
}

export default function CompactAmountSelector({
  denominations,
  selectedDenomination,
  customAmount,
  onSelectDenomination,
  onCustomAmountChange,
}: CompactAmountSelectorProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Amount (USD)</Text>
      
      {/* Quick Denominations */}
      <View style={styles.denominationRow}>
        {denominations.map((denom) => (
          <TouchableOpacity
            key={denom}
            style={[
              styles.denominationChip,
              {
                backgroundColor: selectedDenomination === denom && !customAmount
                  ? colors.primary
                  : colors.card,
                borderColor: selectedDenomination === denom && !customAmount 
                  ? colors.primary 
                  : colors.border,
              },
            ]}
            onPress={() => {
              onSelectDenomination(denom);
              onCustomAmountChange('');
            }}
          >
            <Text style={[
              styles.denominationText,
              { 
                color: selectedDenomination === denom && !customAmount 
                  ? '#FFFFFF' 
                  : colors.text 
              }
            ]}>
              {denom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Amount Input */}
      <TextInput
        style={[
          styles.customInput,
          {
            color: colors.text,
            borderColor: customAmount ? colors.primary : colors.border,
            backgroundColor: colors.card,
          },
        ]}
        placeholder="Custom amount"
        placeholderTextColor={colors.textSecondary}
        value={customAmount}
        onChangeText={(text) => {
          onCustomAmountChange(text);
          if (text) onSelectDenomination('');
        }}
        keyboardType="numeric"
      />
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
  denominationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  denominationChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  denominationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  customInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});