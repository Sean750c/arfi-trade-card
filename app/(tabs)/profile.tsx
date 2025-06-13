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
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { User, Star, Settings, Users, Tag, ShieldCheck, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard, LogIn, Receipt, CircleUser as UserCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/UI/Button';

type MenuItemType = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  route?: string;
  badge?: React.ReactNode;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    const confirmLogout = async () => {
      try {
        await logout();
        // No need to navigate as the UI will update automatically
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert('Error', 'Failed to logout completely. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      // For web, use a simple confirm dialog
      if (window.confirm('Are you sure you want to logout?')) {
        confirmLogout();
      }
    } else {
      // For mobile, use React Native Alert
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: confirmLogout,
          },
        ]
      );
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const renderMenuItem = (item: MenuItemType) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={item.onPress || (() => item.route && router.push(item.route as any))}
      activeOpacity={0.7}
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

  // Menu items for authenticated users
  const authenticatedAccountMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <UserCircle size={20} color={colors.primary} />,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      route: '/profile/personal-info',
    },
    {
      id: '2',
      icon: <Star size={20} color={colors.primary} />,
      title: 'VIP Membership',
      subtitle: `Level ${user?.vip_level || 1}`,
      route: '/profile/vip',
      badge: (
        <View style={[styles.vipBadge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.vipBadgeText}>{user?.vip_level || 1}</Text>
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
    {
      id: '4',
      icon: <Receipt size={20} color={colors.primary} />,
      title: 'My Orders',
      subtitle: 'View your trading history',
      route: '/orders',
    },
  ];

  // Menu items for guest users
  const guestAccountMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <LogIn size={20} color={colors.primary} />,
      title: 'Login to Your Account',
      subtitle: 'Access your profile and transactions',
      onPress: handleLogin,
    },
    {
      id: '2',
      icon: <User size={20} color={colors.primary} />,
      title: 'Create Account',
      subtitle: 'Join AfriTrade today',
      route: '/(auth)/register',
    },
  ];

  const referralMenu: MenuItemType[] = [
    {
      id: '1',
      icon: <Users size={20} color={colors.primary} />,
      title: 'Refer & Earn',
      subtitle: 'Invite friends, earn cash rewards',
      route: '/refer',
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

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {isAuthenticated && user ? (
            // Authenticated User Profile
            <>
              <Image
                source={{ 
                  uri: user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' 
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user.nickname || user.username}
                </Text>
                <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>
                  {user.email || 'No email provided'}
                </Text>
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.currency_symbol}{user.money}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Balance
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.secondary }]}>
                      VIP {user.vip_level}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Level
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            // Guest User Profile
            <View style={styles.guestProfile}>
              <View style={[styles.guestAvatar, { backgroundColor: `${colors.primary}20` }]}>
                <User size={40} color={colors.primary} />
              </View>
              <View style={styles.guestInfo}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>
                  Welcome to AfriTrade
                </Text>
                <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                  Login or create an account to get started
                </Text>
                <Button
                  title="Get Started"
                  onPress={handleLogin}
                  style={styles.getStartedButton}
                  size="sm"
                />
              </View>
            </View>
          )}
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Account</Text>
          {isAuthenticated ? authenticatedAccountMenu.map(renderMenuItem) : guestAccountMenu.map(renderMenuItem)}
        </View>

        {/* Only show referral section for authenticated users */}
        {isAuthenticated && (
          <View style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Referrals</Text>
            {referralMenu.map(renderMenuItem)}
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Other</Text>
          {otherMenu.map(renderMenuItem)}
        </View>

        {/* Logout Button - Only for authenticated users */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { 
                borderColor: colors.error,
                backgroundColor: 'transparent',
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleLogout}
            disabled={isLoading}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              {isLoading ? 'Logging out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        )}

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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
    alignSelf: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  profileDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  guestProfile: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  guestInfo: {
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  guestSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  getStartedButton: {
    paddingHorizontal: Spacing.xl,
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
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    minHeight: 56,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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