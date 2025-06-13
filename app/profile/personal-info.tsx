import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Camera, CreditCard as Edit, Save, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AuthGuard from '@/components/UI/AuthGuard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import type { UserInfo } from '@/types/api';

function PersonalInfoScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.token) {
      fetchUserInfo();
    }
  }, [user?.token]);

  const fetchUserInfo = async () => {
    if (!user?.token) return;

    setIsLoading(true);
    try {
      const info = await UserService.getUserInfo(user.token);
      setUserInfo(info);
      setNickname(info.nickname || info.username);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load user info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAvatar = async () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose how to update your profile picture',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!user?.token) return;

    try {
      // Convert image to base64 (simplified for demo)
      const base64Image = imageUri; // In real app, convert to base64
      
      await UserService.uploadAvatar({
        token: user.token,
        avatar: base64Image,
      });

      Alert.alert('Success', 'Profile picture updated successfully');
      fetchUserInfo(); // Refresh user info
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload avatar');
    }
  };

  const handleSaveNickname = async () => {
    if (!user?.token || !nickname.trim()) return;

    setSaving(true);
    try {
      await UserService.modifyNickname({
        token: user.token,
        nickname: nickname.trim(),
      });

      Alert.alert('Success', 'Nickname updated successfully');
      setIsEditing(false);
      fetchUserInfo(); // Refresh user info
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update nickname');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNickname(userInfo?.nickname || userInfo?.username || '');
  };

  if (isLoading) {
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

  if (!userInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load profile information
          </Text>
          <Button title="Try Again" onPress={fetchUserInfo} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderBottomColor: colors.border,
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Personal Information</Text>
        </View>
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity 
              onPress={handleCancelEdit}
              style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
            >
              <X size={20} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSaveNickname}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Save size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={[
          styles.avatarSection,
          { backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF' }
        ]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: selectedImage || userInfo.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' 
              }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              onPress={handleEditAvatar}
            >
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.avatarLabel, { color: colors.text }]}>
            Profile Picture
          </Text>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Tap the camera icon to change your profile picture
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[
          styles.infoSection,
          { backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF' }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Basic Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Username
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userInfo.username}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Nickname
            </Text>
            {isEditing ? (
              <Input
                value={nickname}
                onChangeText={setNickname}
                placeholder="Enter nickname"
                style={styles.nicknameInput}
                containerStyle={styles.nicknameContainer}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userInfo.nickname || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Email
            </Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userInfo.email || 'Not provided'}
              </Text>
              {userInfo.is_email_bind && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              WhatsApp
            </Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userInfo.whatsapp || 'Not provided'}
              </Text>
              {userInfo.whatsapp_bind && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Account Details */}
        <View style={[
          styles.infoSection,
          { backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF' }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Details
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Country
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userInfo.country_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              VIP Level
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              VIP {userInfo.vip_level}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Balance
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userInfo.currency_symbol}{userInfo.money}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Member Since
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(userInfo.register_time * 1000).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Last Login
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(userInfo.last_login_time * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PersonalInfoScreen() {
  return (
    <AuthGuard>
      <PersonalInfoScreenContent />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
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
  avatarLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  infoSection: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 40,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
    flex: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  verifiedBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  nicknameContainer: {
    flex: 1,
    marginBottom: 0,
  },
  nicknameInput: {
    textAlign: 'right',
  },
});