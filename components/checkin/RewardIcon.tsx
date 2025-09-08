import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, Ticket, DollarSign, Gift, CircleHelp as HelpCircle, Coins, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { RewardType, Coupon } from '@/types';

interface RewardIconProps {
  type: RewardType | `${RewardType}`;
  value: string | number;
  data?: any;
  currencySymbol?: string;
  size?: number;
  iconSize?: number;
  fontSize?: number;
  color?: string;
  showValue?: boolean;
  mode?: 'full' | 'compact';
}

export default function RewardIcon({
  type,
  value,
  data,
  currencySymbol = '₦',
  size = 32,
  iconSize = 18,
  fontSize = 12,
  color,
  showValue = true,
  mode = 'full',
}: RewardIconProps) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  const renderIcon = () => {
    switch (Number(type)) {
      case RewardType.POINTS:
        return <Star size={iconSize} color={iconColor} fill={`${iconColor}`} />;
      case RewardType.COUPON:
        return <Ticket size={iconSize} color={iconColor} />;
      case RewardType.CASH:
        return <DollarSign size={iconSize} color={iconColor} />;
      case RewardType.PHYSICAL_PRODUCT:
        return <Gift size={iconSize} color={iconColor} />;
      case RewardType.OTHER:
        return <HelpCircle size={iconSize} color={iconColor} />;
      default:
        return <Sparkles size={iconSize} color={iconColor} />;
    }
  };

  const formatValue = () => {
    if (mode === 'compact') {
      switch (Number(type)) {
        case RewardType.POINTS:
          return `${value}`;
        case RewardType.CASH:
          return `$${parseFloat(value as string).toFixed(0)}`;
        case RewardType.COUPON:
          return 'COUPON';
        case RewardType.PHYSICAL_PRODUCT:
          return 'ITEM';
        default:
          return '';
      }
    } else {
      switch (Number(type)) {
        case RewardType.POINTS:
          return `${value} points`;
        case RewardType.CASH:
          return `$${parseFloat(value as string).toFixed(2)}`;
        case RewardType.COUPON:
          return formatDiscount(data);
        case RewardType.PHYSICAL_PRODUCT:
        case RewardType.OTHER:
          return typeof value === 'string' && value.length > 12 ? `${value.slice(0, 12)}...` : value;
        default:
          return value;
      }
    }
  };

  const formatDiscount = (coupon: any) => {
    const discountValue = parseFloat(coupon.discount_value);

    // 百分比类型优惠,抽奖的都是百分比类型的
    return `${coupon.code}(${(discountValue * 100).toFixed(1)}% Off)`;
  };

  return (
    <View style={[styles.container, { minWidth: size }]}>
      <View style={[styles.iconWrapper, { width: size * 0.7, height: size * 0.7, borderRadius: (size * 0.7) / 2, backgroundColor: `${iconColor}15` }]}>
        {renderIcon()}
      </View>
      {showValue && (
        <Text style={[styles.valueText, { fontSize, color: iconColor, maxWidth: size * 6 }]}>
          {formatValue()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  valueText: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});
