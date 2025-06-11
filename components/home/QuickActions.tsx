import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { router } from 'expo-router';
import { Gift, TrendingUp, Users, CreditCard, Zap, Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

type QuickActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  isPrimary?: boolean;
  badge?: string;
};

export default function QuickActions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the primary button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const actions: QuickActionItem[] = [
    {
      id: '1',
      title: 'Sell Cards',
      subtitle: 'Trade instantly',
      icon: <Gift size={28} color="#FFFFFF" />,
      route: '/(tabs)/sell',
      color: '#0066CC', // Bright blue for prominence
      isPrimary: true,
      badge: 'HOT',
    },
    {
      id: '2',
      title: 'Live Rates',
      subtitle: 'Current prices',
      icon: <TrendingUp size={24} color="#FFFFFF" />,
      route: '/rates',
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Refer & Earn',
      subtitle: 'Get rewards',
      icon: <Users size={24} color="#FFFFFF" />,
      route: '/refer',
      color: '#8B5CF6',
    },
    {
      id: '4',
      title: 'My Wallet',
      subtitle: 'Manage funds',
      icon: <CreditCard size={24} color="#FFFFFF" />,
      route: '/(tabs)/wallet',
      color: '#F59E0B',
    },
  ];

  const renderPrimaryAction = (action: QuickActionItem) => (
    <Animated.View
      key={action.id}
      style={[
        styles.primaryActionContainer,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.primaryActionItem,
          { 
            backgroundColor: action.color,
            shadowColor: action.color,
          },
        ]}
        onPress={() => router.push(action.route as any)}
        activeOpacity={0.8}
        accessibilityLabel={`${action.title} - ${action.subtitle}`}
        accessibilityRole="button"
        accessibilityHint="Tap to sell your gift cards instantly"
      >
        {action.badge && (
          <View style={[styles.badge, { backgroundColor: '#FF4444' }]}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.badgeText}>{action.badge}</Text>
          </View>
        )}
        
        <View style={styles.primaryIconContainer}>
          {action.icon}
        </View>
        
        <View style={styles.primaryTextContainer}>
          <Text style={styles.primaryActionTitle}>{action.title}</Text>
          <Text style={styles.primaryActionSubtitle}>{action.subtitle}</Text>
        </View>
        
        <View style={styles.primaryActionIndicator}>
          <Zap size={20} color="rgba(255, 255, 255, 0.8)" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSecondaryAction = (action: QuickActionItem) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.secondaryActionItem,
        { backgroundColor: action.color },
      ]}
      onPress={() => router.push(action.route as any)}
      activeOpacity={0.8}
      accessibilityLabel={`${action.title} - ${action.subtitle}`}
      accessibilityRole="button"
    >
      <View style={styles.secondaryContent}>
        <View style={styles.secondaryIconContainer}>
          {action.icon}
        </View>
        <View style={styles.secondaryTextContainer}>
          <Text style={styles.secondaryActionTitle}>{action.title}</Text>
          <Text style={styles.secondaryActionSubtitle}>{action.subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const primaryAction = actions.find(action => action.isPrimary);
  const secondaryActions = actions.filter(action => !action.isPrimary);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Zap size={16} color={colors.primary} />
          <Text style={[styles.viewAllText, { color: colors.primary }]}>Fast Trade</Text>
        </TouchableOpacity>
      </View>
      
      {/* Primary Action - Sell Cards */}
      {primaryAction && renderPrimaryAction(primaryAction)}
      
      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      {/* Secondary Actions Grid */}
      <View style={styles.secondaryActionsGrid}>
        {secondaryActions.map(renderSecondaryAction)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg, // Reduced from xl (24px to 16px)
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md, // Reduced from lg
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Primary Action Styles (Sell Cards)
  primaryActionContainer: {
    marginBottom: Spacing.sm, // Reduced spacing
  },
  primaryActionItem: {
    borderRadius: 20, // More rounded for prominence
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120, // 15% larger than secondary actions
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  primaryIconContainer: {
    width: 56, // Larger icon container
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryTextContainer: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 20, // Larger title
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  primaryActionIndicator: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Divider
  divider: {
    height: 1,
    marginVertical: Spacing.sm, // Reduced spacing
    opacity: 0.3,
  },
  
  // Secondary Actions Grid
  secondaryActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm, // Reduced gap
  },
  secondaryActionItem: {
    width: '31%', // Three items per row with small gaps
    borderRadius: 16,
    padding: Spacing.sm, // Reduced padding
    position: 'relative',
    overflow: 'hidden',
    minHeight: 85, // Compact height
  },
  secondaryContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  secondaryIconContainer: {
    width: 36, // Smaller than primary
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  secondaryTextContainer: {
    alignItems: 'center',
  },
  secondaryActionTitle: {
    fontSize: 13, // Smaller font
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  secondaryActionSubtitle: {
    fontSize: 10, // Smaller subtitle
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});