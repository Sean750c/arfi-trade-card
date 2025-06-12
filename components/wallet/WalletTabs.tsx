import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
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
      icon: DollarSign,
      description: 'Nigerian Naira'
    },
    { 
      key: '2', 
      label: 'USDT Wallet', 
      symbol: 'USDT',
      icon: Coins,
      description: 'Tether USD'
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select Wallet Type
      </Text>
      
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeWalletType === tab.key;
          const IconComponent = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onWalletTypeChange(tab.key as '1' | '2')}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabIcon,
                { backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : `${colors.primary}15` }
              ]}>
                <IconComponent 
                  size={20} 
                  color={isActive ? '#FFFFFF' : colors.primary} 
                />
              </View>
              
              <View style={styles.tabContent}>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
                <Text
                  style={[
                    styles.tabDescription,
                    { color: isActive ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary },
                  ]}
                >
                  {tab.description}
                </Text>
              </View>
              
              <View style={styles.tabSymbol}>
                <Text
                  style={[
                    styles.symbolText,
                    { color: isActive ? '#FFFFFF' : colors.primary },
                  ]}
                >
                  {tab.symbol}
                </Text>
              </View>
              
              {isActive && (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeIndicatorDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8, // 8px compact spacing
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16, // 16px base spacing
  },
  tabsContainer: {
    gap: 12, // 12px moderate spacing
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // 16px base spacing
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
    minHeight: 72,
  },
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // 16px base spacing
  },
  tabContent: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  tabDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  tabSymbol: {
    marginLeft: 16, // 16px base spacing
  },
  symbolText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  activeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});