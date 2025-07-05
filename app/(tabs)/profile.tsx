import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { User, Star, Settings, Users, Tag, ShieldCheck, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard, LogIn, Receipt, CircleUser as UserCircle, Camera, Check, X, Edit3, } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/UI/Button';
import { UserService } from '@/services/user';
import { UploadService } from '@/services/upload';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { PerformanceMonitor } from '@/utils/performance';

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
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { isAuthenticated, user, logout, isLoading, setUser } = useAuthStore();
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [updatingNickname, setUpdatingNickname] = useState(false);

  const handleLogout = useCallback(() => {
    const confirmLogout = async () => {
      const endTimer = PerformanceMonitor.getInstance().startTimer('profile_logout');
      
      try {
        await logout();
        // No need to navigate as the UI will update automatically
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert('Error', 'Failed to logout completely. Please try again.');
      } finally {
        endTimer();
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
  }, [logout]);

  const handleLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  const handleUpdateNickname = useCallback(async () => {
    if (!user?.token || !newNickname.trim()) return;

    const endTimer = PerformanceMonitor.getInstance().startTimer('profile_update_nickname');
    
    setUpdatingNickname(true);
    try {
      await UserService.modifyNickname({
        token: user.token,
        nickname: newNickname.trim(),
      });

      // Update local state
      if (user) {
        setUser({ ...user, nickname: newNickname.trim() });
      }

      setEditingNickname(false);
      Alert.alert('Success', 'Nickname updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update nickname');
    } finally {
      setUpdatingNickname(false);
      endTimer();
    }
  }, [user?.token, newNickname, setUser]);

  const handleUpdateAvatar = useCallback(async () => {
    const endTimer = PerformanceMonitor.getInstance().startTimer('profile_update_avatar');
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user?.token) {
        setUpdatingAvatar(true);

        // Convert image to base64
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
          try {
            const uploadUrls = await UploadService.getUploadUrls({
              token: user.token,
              image_count: 1,
            });

            if (uploadUrls.length === 0) {
              throw new Error('No upload URL received');
            }
      
            const uploadUrl = uploadUrls[0];
            const imageUrl = uploadUrl.url.split("?")[0];
            const imageUri = result.assets[0].uri;

            await UploadService.uploadImageToGoogleStorage(
              uploadUrl.url,
              imageUri
            );

            await UserService.uploadAvatar({
              token: user.token,
              avatar: imageUrl,
            });

            // Update local state
            if (user) {
              setUser({ ...user, avatar: imageUrl });
            }

            Alert.alert('Success', 'Avatar updated successfully');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update avatar');
          } finally {
            setUpdatingAvatar(false);
            endTimer();
          }
        };

        reader.readAsDataURL(blob);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      setUpdatingAvatar(false);
      endTimer();
    }
  }, [user?.token, setUser]);

  const handleEditNickname = useCallback(() => {
    setEditingNickname(true);
    setNewNickname(user?.nickname || user?.username || '');
  }, [user?.nickname, user?.username]);

  const handleCancelEditNickname = useCallback(() => {
    setEditingNickname(false);
    setNewNickname(user?.nickname || user?.username || '');
  }, [user?.nickname, user?.username]);

  const renderMenuItem = useCallback((item: MenuItemType) => (
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
  ), [colors.border, colors.primary, colors.text, colors.textSecondary]);

  // 使用 useMemo 缓存菜单项数据
  const authenticatedAccountMenu = useMemo((): MenuItemType[] => [
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
  ], [colors.primary, user?.vip_level]);

  // 使用 useMemo 缓存访客菜单项
  const guestAccountMenu = useMemo((): MenuItemType[] => [
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
  ], [colors.primary, handleLogin]);

  const referralMenu = useMemo((): MenuItemType[] => [
    {
      id: '1',
      icon: <Users size={20} color={colors.primary} />,
      title: 'Refer & Earn',
      subtitle: 'Invite friends, earn cash rewards',
      route: '/refer',
    },
  ], [colors.primary]);

  const otherMenu = useMemo((): MenuItemType[] => [
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
  ], [colors.primary]);

  // 使用 useMemo 缓存动态样式
  const headerStyle = useMemo(() => [
    styles.header, 
    { 
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      shadowColor: 'rgba(0, 0, 0, 0.05)',
    }
  ], [colors.card, colors.border]);

  const titleStyle = useMemo(() => [styles.title, { color: colors.text }], [colors.text]);
  const menuSectionTitleStyle = useMemo(() => [styles.menuSectionTitle, { color: colors.text }], [colors.text]);
  const userNameStyle = useMemo(() => [styles.userName, { color: colors.text }], [colors.text]);
  const guestTitleStyle = useMemo(() => [styles.guestTitle, { color: colors.text }], [colors.text]);
  const guestSubtitleStyle = useMemo(() => [styles.guestSubtitle, { color: colors.textSecondary }], [colors.textSecondary]);
  const guestAvatarStyle = useMemo(() => [styles.guestAvatar, { backgroundColor: `${colors.primary}20` }], [colors.primary]);
  const avatarEditButtonStyle = useMemo(() => [styles.avatarEditButton, { backgroundColor: colors.secondary }], [colors.secondary]);
  const nicknameInputStyle = useMemo(() => [styles.nicknameInput, { backgroundColor: 'lightgray' }], []);
  const nicknameActionButtonSuccessStyle = useMemo(() => [styles.nicknameActionButton, { backgroundColor: colors.success }], [colors.success]);
  const nicknameActionButtonErrorStyle = useMemo(() => [styles.nicknameActionButton, { backgroundColor: colors.error }], [colors.error]);
  const logoutButtonStyle = useMemo(() => [
    styles.logoutButton,
    {
      borderColor: colors.error,
      backgroundColor: 'transparent',
      opacity: isLoading ? 0.6 : 1,
    },
  ], [colors.error, isLoading]);
  const logoutTextStyle = useMemo(() => [styles.logoutText, { color: colors.error }], [colors.error]);
  const versionTextStyle = useMemo(() => [styles.versionText, { color: colors.textSecondary }], [colors.textSecondary]);

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        <View style={headerStyle}>
          <Text style={titleStyle}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {isAuthenticated && user ? (
            // Authenticated User Profile
            <>
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: user?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
                    }}
                    style={styles.avatar}
                    resizeMode="cover"
                    fadeDuration={300}
                  />
                  <TouchableOpacity
                    style={avatarEditButtonStyle}
                    onPress={handleUpdateAvatar}
                    disabled={updatingAvatar}
                  >
                    {updatingAvatar ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Camera size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.nicknameContainer}>
                {editingNickname ? (
                  <View style={styles.nicknameEditContainer}>
                    <TextInput
                      style={nicknameInputStyle}
                      value={newNickname}
                      onChangeText={setNewNickname}
                      placeholder="Enter nickname"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      autoFocus
                      maxLength={20}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    <View style={styles.nicknameActions}>
                      <TouchableOpacity
                        style={nicknameActionButtonSuccessStyle}
                        onPress={handleUpdateNickname}
                        disabled={updatingNickname}
                      >
                        {updatingNickname ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={nicknameActionButtonErrorStyle}
                        onPress={handleCancelEditNickname}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.nicknameDisplayContainer}>
                    <Text style={userNameStyle}>
                      {user?.nickname || user?.username}
                    </Text>
                    <TouchableOpacity
                      style={styles.editNicknameButton}
                      onPress={handleEditNickname}
                    >
                      <Edit3 size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            // Guest User Profile
            <View style={styles.guestProfile}>
              <View style={guestAvatarStyle}>
                <User size={40} color={colors.primary} />
              </View>
              <View style={styles.guestInfo}>
                <Text style={guestTitleStyle}>
                  Welcome to AfriTrade
                </Text>
                <Text style={guestSubtitleStyle}>
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
          <Text style={menuSectionTitleStyle}>Account</Text>
          {isAuthenticated ? authenticatedAccountMenu.map(renderMenuItem) : guestAccountMenu.map(renderMenuItem)}
        </View>

        {/* Only show referral section for authenticated users */}
        {isAuthenticated && (
          <View style={styles.menuSection}>
            <Text style={menuSectionTitleStyle}>Referrals</Text>
            {referralMenu.map(renderMenuItem)}
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={menuSectionTitleStyle}>Other</Text>
          {otherMenu.map(renderMenuItem)}
        </View>

        {/* Logout Button - Only for authenticated users */}
        {isAuthenticated && !isLoading && (
          <TouchableOpacity
            style={logoutButtonStyle}
            onPress={handleLogout}
            disabled={isLoading}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={logoutTextStyle}>
              {isLoading ? 'Logging out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.versionContainer}>
          <Text style={versionTextStyle}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxs,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  profileSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // 改为宽度的一半，确保完美圆形
    marginBottom: Spacing.sm,
    alignSelf: 'center', // 改为center确保居中
    backgroundColor: '#f0f0f0', // 添加默认背景色，图片加载时显示
  },
  nicknameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nicknameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  editNicknameButton: {
    padding: Spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nicknameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  nicknameInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  nicknameActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  nicknameActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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