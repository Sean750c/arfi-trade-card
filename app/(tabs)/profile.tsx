import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { User, Star, Settings, Users, Tag, ShieldCheck, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

type MenuItemType = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  route?: string;
  badge?: React.ReactNode;
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const renderMenuItem = (item: MenuItemType) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => item.route && router.push(item.route as any)}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        {item.icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
        {item.subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      <View style={styles.menuRightContainer}>
        {item.badge}
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const accountMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <User size={20} color={colors.primary} />,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      route: '/profile/personal-info',
    },
    {
      id: '2',
      icon: <Star size={20} color={colors.primary} />,
      title: 'VIP Membership',
      subtitle: 'Level 2 (Silver)',
      route: '/profile/vip',
      badge: (
        <View style={[styles.vipBadge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.vipBadgeText}>2</Text>
        </View>
      ),
    },
    {
      id: '3',
      icon: <CreditCard size={20} color={colors.primary} />,
      title: 'Bank Accounts',
      subtitle: 'Manage your withdrawal accounts',
      route: '/profile/bank-accounts',
    },
  ];

  const referralMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <Users size={20} color={colors.primary} />,
      title: 'Refer & Earn',
      subtitle: 'Invite friends, earn cash rewards',
      route: '/profile/refer',
    },
  ];

  const otherMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <Tag size={20} color={colors.primary} />,
      title: 'Promo Codes',
      subtitle: 'View your available coupons',
      route: '/profile/promo-codes',
    },
    {
      id: '2',
      icon: <ShieldCheck size={20} color={colors.primary} />,
      title: 'Security',
      subtitle: 'Protect your account',
      route: '/profile/security',
    },
    {
      id: '3',
      icon: <HelpCircle size={20} color={colors.primary} />,
      title: 'Help & Support',
      subtitle: 'Get help with using AfriTrade',
      route: '/profile/support',
    },
    {
      id: '4',
      icon: <Settings size={20} color={colors.primary} />,
      title: 'Settings',
      subtitle: 'App preferences',
      route: '/profile/settings',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>Tunde Adeyemi</Text>
            <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>
              +234 801 234 5678
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Account</Text>
          {accountMenu.map(renderMenuItem)}
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Referrals</Text>
          {referralMenu.map(renderMenuItem)}
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Other</Text>
          {otherMenu.map(renderMenuItem)}
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: colors.error },
          ]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  profilePhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuSectionTitle: {
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  menuRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});