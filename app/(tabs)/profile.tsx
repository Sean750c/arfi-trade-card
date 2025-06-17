import React, { useState, useEffect } from 'react';
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Edit3,
  Camera,
  Check,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import type { UserInfo } from '@/types';

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

function ProfileContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [updatingNickname, setUpdatingNickname] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const info = await UserService.getUserInfo(user.token);
      setUserInfo(info);
      setNewNickname(info.nickname || info.username);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
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

  const handleUpdateNickname = async () => {
    if (!user?.token || !newNickname.trim()) return;
    
    setUpdatingNickname(true);
    try {
      await UserService.modifyNickname({
        token: user.token,
        nickname: newNickname.trim(),
      });
      
      // Update local state
      if (userInfo) {
        setUserInfo({ ...userInfo, nickname: newNickname.trim() });
      }
      
      setEditingNickname(false);
      Alert.alert('Success', 'Nickname updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update nickname');
    } finally {
      setUpdatingNickname(false);
    }
  };

  const handleUpdateAvatar = async () => {
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
            const base64 = reader.result as string;
            await UserService.uploadAvatar({
              token: user.token,
              avatar: base64,
            });
            
            // Update local state
            if (userInfo) {
              setUserInfo({ ...userInfo, avatar: result.assets[0].uri });
            }
            
            Alert.alert('Success', 'Avatar updated successfully');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update avatar');
          } finally {
            setUpdatingAvatar(false);
          }
        };
        
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      setUpdatingAvatar(false);
    }
  };

  const menuItems: ProfileMenuItem[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      subtitle: 'View your account details',
      icon: <User size={20} color="#FFFFFF" />,
      route: '/profile/personal-info',
      color: '#3B82F6',
    },
    {
      id: 'bank-accounts',
      title: 'Bank Accounts',
      subtitle: 'Manage withdrawal methods',
      icon: <CreditCard size={20} color="#FFFFFF" />,
      route: '/profile/bank-accounts',
      color: '#10B981',
    },
    {
      id: 'promo-codes',
      title: 'Promo Codes',
      subtitle: 'View available discounts',
      icon: <Crown size={20} color="#FFFFFF" />,
      route: '/profile/promo-codes',
      color: '#F59E0B',
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Password & account security',
      icon: <Shield size={20} color="#FFFFFF" />,
      route: '/profile/security',
      color: '#EF4444',
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'FAQ and customer support',
      icon: <HelpCircle size={20} color="#FFFFFF" />,
      route: '/profile/support',
      color: '#8B5CF6',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences & theme',
      icon: <Settings size={20} color="#FFFFFF" />,
      route: '/profile/settings',
      color: '#6B7280',
    },
  ];

  const renderMenuItem = (item: ProfileMenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
      onPress={() => router.push(item.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
        {item.icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
          {item.subtitle}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Profile Header */}
        <Card style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
          <View style={styles.profileContent}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: userInfo?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={[styles.avatarEditButton, { backgroundColor: colors.secondary }]}
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

            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              {/* Nickname with Edit */}
              <View style={styles.nicknameContainer}>
                {editingNickname ? (
                  <View style={styles.nicknameEditContainer}>
                    <TextInput
                      style={[styles.nicknameInput, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                      value={newNickname}
                      onChangeText={setNewNickname}
                      placeholder="Enter nickname"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      autoFocus
                    />
                    <View style={styles.nicknameActions}>
                      <TouchableOpacity
                        style={[styles.nicknameActionButton, { backgroundColor: colors.success }]}
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
                        style={[styles.nicknameActionButton, { backgroundColor: colors.error }]}
                        onPress={() => {
                          setEditingNickname(false);
                          setNewNickname(userInfo?.nickname || userInfo?.username || '');
                        }}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.nicknameDisplayContainer}>
                    <Text style={styles.userName}>
                      {userInfo?.nickname || userInfo?.username}
                    </Text>
                    <TouchableOpacity
                      style={styles.editNicknameButton}
                      onPress={() => setEditingNickname(true)}
                    >
                      <Edit3 size={16} color="rgba(255, 255, 255, 0.8)" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* User Details */}
              <Text style={styles.userEmail}>@{userInfo?.username}</Text>
              
              {/* VIP Badge */}
              <View style={styles.vipBadge}>
                <Crown size={14} color="#FFD700" />
                <Text style={styles.vipText}>VIP Level {userInfo?.vip_level || 1}</Text>
              </View>

              {/* Balance Info */}
              <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceValue}>
                    {userInfo?.currency_symbol}{userInfo?.money || '0.00'}
                  </Text>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Rebate</Text>
                  <Text style={styles.balanceValue}>
                    {userInfo?.currency_symbol}{userInfo?.rebate_money || '0.00'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  
  // Enhanced Profile Header
  profileHeader: {
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  profileContent: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  
  // User Info Section
  userInfoSection: {
    alignItems: 'center',
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
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.sm,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  vipText: {
    color: '#FFD700',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: Spacing.md,
    width: '100%',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.md,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Menu Section
  menuSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Logout Button
  logoutButton: {
    marginTop: Spacing.md,
  },
});