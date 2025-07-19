import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Star,
  Gift,
  Crown,
  MessageSquare,
  Lock,
  Eye,
  Smartphone,
  Globe,
  Moon,
  Sun,
  UserCircle,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

const { width } = Dimensions.get('window');

function ProfileScreenContent() {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const profileStats = [
    {
      id: 'trades',
      title: 'Total Trades',
      value: '247',
      icon: <TrendingUp size={20} color={colors.primary} />,
      gradient: [colors.primary, colors.accent],
    },
    {
      id: 'success',
      title: 'Success Rate',
      value: '98.5%',
      icon: <Award size={20} color={colors.success} />,
      gradient: [colors.success, '#0891B2'],
    },
    {
      id: 'vip',
      title: 'VIP Level',
      value: `${user?.vip_level || 1}`,
      icon: <Crown size={20} color={colors.warning} />,
      gradient: [colors.warning, '#EA580C'],
    },
  ];

  const accountMenuItems = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      subtitle: 'Manage your profile details',
      icon: <UserCircle size={24} color={colors.primary} />,
      route: '/profile/personal-info',
      badge: null,
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      subtitle: 'Password, 2FA, privacy settings',
      icon: <Shield size={24} color={colors.success} />,
      route: '/profile/security',
      badge: 'SECURE',
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Bank accounts and payment options',
      icon: <CreditCard size={24} color={colors.accent} />,
      route: '/profile/bank-accounts',
      badge: null,
    },
    {
      id: 'vip',
      title: 'VIP Membership',
      subtitle: 'Exclusive benefits and rewards',
      icon: <Crown size={24} color={colors.warning} />,
      route: '/profile/vip',
      badge: 'PREMIUM',
    },
  ];

  const appMenuItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Push notifications and alerts',
      icon: <Bell size={24} color={colors.primary} />,
      route: null,
      toggle: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or face ID',
      icon: <Smartphone size={24} color={colors.success} />,
      route: null,
      toggle: true,
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      icon: darkModeEnabled ? <Moon size={24} color={colors.accent} /> : <Sun size={24} color={colors.warning} />,
      route: null,
      toggle: true,
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
    },
  ];

  const supportMenuItems = [
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      icon: <MessageSquare size={24} color={colors.primary} />,
      action: () => setShowFeedbackModal(true),
    },
    {
      id: 'support',
      title: 'Customer Support',
      subtitle: '24/7 professional assistance',
      icon: <HelpCircle size={24} color={colors.success} />,
      route: '/profile/support',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: <Lock size={24} color={colors.accent} />,
      route: '/profile/privacy-policy',
    },
  ];

  const renderMenuItem = (item: any, section: string) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          router.push(item.route);
        }
      }}
      disabled={item.toggle}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.icon.props.color}15` }]}>
        {item.icon}
      </View>
      
      <View style={styles.menuContent}>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
        
        {item.badge && (
          <View style={[styles.menuBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.menuBadgeText}>{item.badge}</Text>
          </View>
        )}
        
        {item.toggle ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
            thumbColor={item.value ? colors.primary : colors.textSecondary}
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Professional Header */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <User size={40} color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.editAvatarButton, { backgroundColor: colors.accent }]}
                  onPress={() => router.push('/profile/personal-info')}
                >
                  <Edit3 size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.username || 'Professional Trader'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'trader@tradepro.com'}</Text>
                <View style={styles.vipBadge}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.vipText}>VIP {user?.vip_level || 1} Member</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          {profileStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <LinearGradient
                colors={stat.gradient as [string, string]}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statContent}>
                  <View style={styles.statIcon}>
                    {stat.icon}
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Account Management */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Management</Text>
          {accountMenuItems.map((item) => renderMenuItem(item, 'account'))}
        </View>

        {/* App Settings */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          {appMenuItems.map((item) => renderMenuItem(item, 'app'))}
        </View>

        {/* Support & Legal */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support & Legal</Text>
          {supportMenuItems.map((item) => renderMenuItem(item, 'support'))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error }]}
            onPress={handleLogout}
          >
            <LogOut size={24} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            TradePro v1.0.0
          </Text>
          <Text style={[styles.versionSubtext, { color: colors.textSecondary }]}>
            Professional Trading Platform
          </Text>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </SafeAreaWrapper>
  );
}

export default function ProfileScreen() {
  return (
    <AuthGuard>
      <ProfileScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  
  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  vipText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFD700',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    height: 100,
  },
  statGradient: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIcon: {
    alignSelf: 'flex-start',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  // Menu Sections
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  menuBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  menuBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Version Section
  versionSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});