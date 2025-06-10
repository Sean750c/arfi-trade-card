import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: colors.secondary,
          borderWidth: 0,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        break;
    }

    // Size styles
    switch (size) {
      case 'sm':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: Spacing.sm,
        };
        break;
      case 'md':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          borderRadius: Spacing.sm,
        };
        break;
      case 'lg':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          borderRadius: Spacing.sm,
        };
        break;
    }

    // Width
    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    // Disabled state
    if (disabled || loading) {
      buttonStyle.opacity = 0.6;
    }

    return buttonStyle;
  };

  const getTextStyles = (): TextStyle => {
    let textStyles: TextStyle = {
      fontFamily: 'Inter-Medium',
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'sm':
        textStyles.fontSize = 14;
        break;
      case 'md':
        textStyles.fontSize = 16;
        break;
      case 'lg':
        textStyles.fontSize = 18;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        textStyles.color = '#FFFFFF';
        break;
      case 'outline':
        textStyles.color = colors.primary;
        break;
      case 'ghost':
        textStyles.color = colors.primary;
        break;
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
});