import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Star,
  Ticket,
  DollarSign,
  Gift,
  HelpCircle,
  Coins,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { RewardType } from '@/types';

interface RewardIconProps {
  type: RewardType;
  value: string | number;
  currencySymbol?: string;
  size?: number;
  iconSize?: number;
  fontSize?: number;
  color?: string;
  showValue?: boolean;
}

export default function RewardIcon({
  type,
  value,
  currencySymbol = '₦',
  size = 32,
  iconSize = 18,
  fontSize = 12,
  color,
  showValue = true,
}: RewardIconProps) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  const renderIcon = () => {
    switch (type) {
      case RewardType.POINTS:
        return <Star size={iconSize} color={iconColor} fill={iconColor} />;
      case RewardType.COUPON:
        return <Ticket size={iconSize} color={iconColor} />;
      case RewardType.CASH:
        return <DollarSign size={iconSize} color={iconColor} />;
      case RewardType.PHYSICAL_PRODUCT:
        return <Gift size={iconSize} color={iconColor} />;
      case RewardType.OTHER:
        return <HelpCircle size={iconSize} color={iconColor} />;
      default:
        return <Coins size={iconSize} color={iconColor} />;
    }
  };

  const formatValue = () => {
    switch (type) {
      case RewardType.POINTS:
        return `${value}`;
      case RewardType.CASH:
        return `${currencySymbol}${parseFloat(value as string).toFixed(0)}`;
      case RewardType.COUPON:
      case RewardType.PHYSICAL_PRODUCT:
      case RewardType.OTHER:
        return typeof value === 'string' && value.length > 8 ? `${value.slice(0, 8)}...` : value;
      default:
        return value;
    }
  };

  return (
    <View style={[styles.container, { minWidth: size }]}>
      {showValue && (
        <Text style={[styles.valueText, { fontSize, color: iconColor }]}>
          {formatValue()}
        </Text>
      )}
      <View
        style={[
          styles.iconWrapper,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: (size * 0.7) / 2,
            backgroundColor: `${iconColor}15`,
          },
        ]}
      >
        {renderIcon()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});