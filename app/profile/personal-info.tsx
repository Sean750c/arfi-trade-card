import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import type { UserInfo } from '@/types';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

function PersonalInfoContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const info = await UserService.getUserInfo(user.token);
      setUserInfo(info);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoRow = ({ 
    icon, 
    label, 
    value, 
    isVerified = false 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    isVerified?: boolean;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          {icon}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {value || 'Not provided'}
          </Text>
        </View>
      </View>
      {isVerified && (
        <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
          <Shield size={12} color="#FFFFFF" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading personal information...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchUserInfo}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Personal Information</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Personal Details Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Details
            </Text>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon={<User size={16} color={colors.primary} />}
              label="Username"
              value={userInfo?.username || ''}
            />
            
            <InfoRow
              icon={<User size={16} color={colors.primary} />}
              label="Display Name"
              value={userInfo?.nickname || userInfo?.username || ''}
            />
            
            <InfoRow
              icon={<Mail size={16} color={colors.primary} />}
              label="Email Address"
              value={userInfo?.email || ''}
              isVerified={userInfo?.is_email_bind}
            />
            
            <InfoRow
              icon={<Phone size={16} color={colors.primary} />}
              label="WhatsApp"
              value={userInfo?.whatsapp || ''}
              isVerified={userInfo?.whatsapp_bind}
            />
            
            <InfoRow
              icon={<MapPin size={16} color={colors.primary} />}
              label="Country"
              value={userInfo?.country_name || ''}
            />
          </View>
        </Card>

        {/* Account Status Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Status
            </Text>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon={<Calendar size={16} color={colors.primary} />}
              label="Member Since"
              value={formatDate(userInfo?.register_time || 0)}
            />
            
            <InfoRow
              icon={<Calendar size={16} color={colors.primary} />}
              label="Last Login"
              value={formatDate(userInfo?.last_login_time || 0)}
            />
            
            <InfoRow
              icon={<Shield size={16} color={colors.primary} />}
              label="VIP Level"
              value={`Level ${userInfo?.vip_level}` || 'Level 1'}
            />
          </View>
        </Card>

        {/* Wallet Information Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Wallet Information
            </Text>
          </View>

          <View style={styles.walletInfo}>
            <View style={styles.walletItem}>
              <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>
                Main Balance
              </Text>
              <Text style={[styles.walletValue, { color: colors.text }]}>
                {userInfo?.currency_symbol}{userInfo?.money || '0.00'}
              </Text>
            </View>
            
            <View style={styles.walletItem}>
              <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>
                Rebate Balance
              </Text>
              <Text style={[styles.walletValue, { color: colors.success }]}>
                {userInfo?.currency_symbol}{userInfo?.rebate_money || '0.00'}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function PersonalInfoScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <PersonalInfoContent />
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
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  infoList: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 135, 81, 0.05)',
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
  },
  walletLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});