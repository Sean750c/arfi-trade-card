import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
}

export default function Header({ 
  title, 
  subtitle, 
  showBack = true, 
  onBack,
  rightComponent,
  backgroundColor 
}: HeaderProps) {
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[
      styles.header,
      { 
        backgroundColor: backgroundColor || colors.card,
        borderBottomColor: colors.border,
        // 为Android设备添加额外的顶部padding
        paddingTop: Platform.OS === 'android' ? Spacing.md : Spacing.sm,
      }
    ]}>
      {showBack && (
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.backButton, 
            { backgroundColor: `${colors.primary}15` },
            // 为Android设备增加按钮大小
            Platform.OS === 'android' && {
              width: 44,
              height: 44,
              borderRadius: 22,
            }
          ]}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
      
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  rightComponent: {
    marginLeft: Spacing.md,
  },
}); 