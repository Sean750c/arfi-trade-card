import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface WalletOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
}

interface WalletSelectorProps {
  options: WalletOption[];
  selectedWallet: string;
  onSelect: (walletId: string) => void;
}

export default function WalletSelector({
  options,
  selectedWallet,
  onSelect,
}: WalletSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wallet size={20} color={colors.text} strokeWidth={2.5} />
        <Text style={[styles.title, { color: colors.text }]}>Receive To</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedWallet === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
                index > 0 && { marginLeft: Spacing.md },
              ]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <LinearGradient
                  colors={[colors.primary + '15', colors.primary + '08']}
                  style={styles.selectedOverlay}
                />
              )}

              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.symbolContainer,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.primary + '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.symbol,
                      { color: isSelected ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    {option.symbol}
                  </Text>
                </View>

                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.name,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                  <Text
                    style={[
                      styles.label,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {option.icon}
                  </Text>
                </View>

                {isSelected && (
                  <View style={[styles.checkMark, { backgroundColor: colors.primary }]}>
                    <ChevronRight size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  option: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  optionContent: {
    padding: Spacing.md,
    minHeight: 90,
  },
  symbolContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkMark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
