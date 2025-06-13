import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface WalletTabsProps {
  activeWalletType: '1' | '2';
  onWalletTypeChange: (type: '1' | '2') => void;
}

export default function WalletTabs({ activeWalletType, onWalletTypeChange }: WalletTabsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeWalletType === '1' 
              ? colors.primary 
              : colorScheme === 'dark' ? colors.card : '#F9FAFB',
            borderColor: activeWalletType === '1' ? colors.primary : colors.border,
            shadowColor: activeWalletType === '1' ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => onWalletTypeChange('1')}
      >
        <View style={styles.tabContent}>
          <View style={[
            styles.tabIcon, 
            { 
              backgroundColor: activeWalletType === '1' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : `${colors.primary}15` 
            }
          ]}>
            <Text style={[
              styles.currencySymbol, 
              { color: activeWalletType === '1' ? '#FFFFFF' : colors.primary }
            ]}>
              ₦
            </Text>
          </View>
          <Text style={[
            styles.tabText, 
            { color: activeWalletType === '1' ? '#FFFFFF' : colors.text }
          ]}>
            NGN Wallet
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeWalletType === '2' 
              ? colors.primary 
              : colorScheme === 'dark' ? colors.card : '#F9FAFB',
            borderColor: activeWalletType === '2' ? colors.primary : colors.border,
            shadowColor: activeWalletType === '2' ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => onWalletTypeChange('2')}
      >
        <View style={styles.tabContent}>
          <View style={[
            styles.tabIcon, 
            { 
              backgroundColor: activeWalletType === '2' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : `${colors.primary}15` 
            }
          ]}>
            <DollarSign 
              size={16} 
              color={activeWalletType === '2' ? '#FFFFFF' : colors.primary} 
            />
          </View>
          <Text style={[
            styles.tabText, 
            { color: activeWalletType === '2' ? '#FFFFFF' : colors.text }
          ]}>
            USDT Wallet
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});