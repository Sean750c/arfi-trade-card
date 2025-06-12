import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
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
    { key: '1', label: 'NGN Wallet', symbol: '₦' },
    { key: '2', label: 'USDT Wallet', symbol: 'USDT' },
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            {
              borderBottomColor: activeWalletType === tab.key ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => onWalletTypeChange(tab.key as '1' | '2')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeWalletType === tab.key ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.lg,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});