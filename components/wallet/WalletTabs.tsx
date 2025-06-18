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
  countryCurrencyName: string;
  countryCurrencySymbol: string;
  activeWalletType: '1' | '2';
  onWalletTypeChange: (type: '1' | '2') => void;
}

export default function WalletTabs({
  countryCurrencyName,
  countryCurrencySymbol,
  activeWalletType,
  onWalletTypeChange,
}: WalletTabsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = [
    { 
      key: '1', 
      label: countryCurrencyName || ' Wallet', 
      symbol: countryCurrencySymbol || '₦',
      icon: <Coins size={18} color={activeWalletType === '1' ? '#FFFFFF' : colors.primary} />
    },
    { 
      key: '2', 
      label: 'USDT Wallet', 
      symbol: 'USDT',
      icon: <DollarSign size={18} color={activeWalletType === '2' ? '#FFFFFF' : colors.primary} />
    },
  ];

  return (
    <View style={[
      styles.tabsContainer, 
      { 
        backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
        shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      }
    ]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            {
              backgroundColor: activeWalletType === tab.key ? colors.primary : 'transparent',
              shadowColor: activeWalletType === tab.key ? colors.primary : 'transparent',
              shadowOffset: activeWalletType === tab.key ? { width: 0, height: 4 } : { width: 0, height: 0 },
              shadowOpacity: activeWalletType === tab.key ? 0.3 : 0,
              shadowRadius: activeWalletType === tab.key ? 8 : 0,
              elevation: activeWalletType === tab.key ? 6 : 0,
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
    borderRadius: 16,
    padding: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
});