import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { DollarSign, Coins } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface WalletTabsProps {
  activeWalletType: '1' | '2';
  onWalletTypeChange: (type: '1' | '2') => void;
}

export default function WalletTabs({
  activeWalletType,
  onWalletTypeChange,
}: WalletTabsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = [
    { 
      key: '1', 
      label: 'NGN Wallet', 
      symbol: '₦',
      icon: <Coins size={16} color={activeWalletType === '1' ? '#FFFFFF' : colors.primary} />
    },
    { 
      key: '2', 
      label: 'USDT Wallet', 
      symbol: 'USDT',
      icon: <DollarSign size={16} color={activeWalletType === '2' ? '#FFFFFF' : colors.primary} />
    },
  ];

  return (
    <View style={[styles.tabsContainer, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            {
              backgroundColor: activeWalletType === tab.key ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => onWalletTypeChange(tab.key as '1' | '2')}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            {tab.icon}
            <Text
              style={[
                styles.tabText,
                {
                  color: activeWalletType === tab.key ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});