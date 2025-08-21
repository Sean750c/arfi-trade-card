```typescript
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
        return \`${value} Pts`;
      case RewardType.CASH:
        return \`${currencySymbol}${parseFloat(value as string).toFixed(2)}`;
      case RewardType.COUPON:
      case RewardType.PHYSICAL_PRODUCT:
      case RewardType.OTHER:
        return value; // Display as is for non-numeric types
      default:
        return value;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: \`${iconColor}15`,
          },
        ]}
      >
        {renderIcon()}
      </View>
      {showValue && (
        <Text style={[styles.valueText, { fontSize, color: colors.text }]}>
          {formatValue()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: 'Inter-SemiBold',
  },
});

```