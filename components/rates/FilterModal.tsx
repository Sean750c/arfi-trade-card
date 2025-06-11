import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { Currency } from '@/types/api';

interface FilterModalProps {
  visible: boolean;
  currencies: Currency[];
  selectedCurrency: string | null;
  onClose: () => void;
  onCurrencySelect: (currency: string | null) => void;
  onClearFilters: () => void;
}

export default function FilterModal({
  visible,
  currencies,
  selectedCurrency,
  onClose,
  onCurrencySelect,
  onClearFilters,
}: FilterModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!visible) return null;

  return (
    <View style={styles.filterOverlay}>
      <View style={[styles.filterModal, { backgroundColor: colors.card }]}>
        <View style={styles.filterHeader}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>
            Filter by Currency
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Currency Filter Only */}
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                { 
                  backgroundColor: !selectedCurrency ? colors.primary : 'transparent',
                  borderColor: colors.border,
                }
              ]}
              onPress={() => onCurrencySelect(null)}
            >
              <Text style={[
                styles.filterOptionText,
                { color: !selectedCurrency ? '#FFFFFF' : colors.text }
              ]}>
                All Currencies
              </Text>
            </TouchableOpacity>
            
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.currency_id}
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: selectedCurrency === currency.currency_code ? colors.primary : 'transparent',
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => onCurrencySelect(currency.currency_code)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: selectedCurrency === currency.currency_code ? '#FFFFFF' : colors.text }
                ]}>
                  {currency.currency_symbol} {currency.currency_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Clear Filters */}
        <Button
          title="Clear Filter"
          variant="outline"
          onPress={onClearFilters}
          style={styles.clearFiltersButton}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '60%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  clearFiltersButton: {
    marginTop: Spacing.md,
  },
});