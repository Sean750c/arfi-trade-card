import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Lock, 
  Shield, 
  ChevronRight, 
  Key, 
  Smartphone,
  Bell,
  Trash2,
  AlertTriangle,
  MessageCircle
} from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import CustomerServiceButton from '@/components/UI/CustomerServiceButton';
import SocialBindingCard from '@/components/profile/SocialBindingCard';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import ChangeWithdrawPasswordModal from '@/components/profile/ChangeWithdrawPasswordModal';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

interface SecurityOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  status?: string;
  statusColor?: string;
  showChevron?: boolean;
}

function SecurityScreenContent() {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWithdrawPasswordModal, setShowWithdrawPasswordModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Please enter your password to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async (password) => {
                    if (!password || !user?.token) return;
                    
                    setIsDeletingAccount(true);
                    try {
                      await UserService.deleteAccount(user.token, password);
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been successfully deleted.',
                        [{ text: 'OK', onPress: () => logout() }]
                      );
                    } catch (error) {
                      Alert.alert(
                        'Error',
                        error instanceof Error ? error.message : 'Failed to delete account'
                      );
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ]
    );
  };

  const securityOptions: SecurityOption[] = [
    {
      id: 'change_password',
      title: 'Change Login Password',
      description: 'Update your account login password',
      icon: <Lock size={20} color={colors.primary} />,
      action: () => setShowPasswordModal(true),
      status: user?.password_null ? 'Not Set' : 'Set',
      statusColor: user?.password_null ? colors.warning : colors.success,
      showChevron: true,
    },
    {
      id: 'withdraw_password',
      title: 'Withdraw Password',
      description: 'Set or change your withdrawal security password',
      icon: <Key size={20} color={colors.primary} />,
      action: () => setShowWithdrawPasswordModal(true),
      status: user?.t_password_null ? 'Not Set' : 'Set',
      statusColor: user?.t_password_null ? colors.warning : colors.success,
      showChevron: true,
    },
    {
      id: 'two_factor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: <Smartphone size={20} color={colors.primary} />,
      action: () => {
        Alert.alert('Coming Soon', 'Two-factor authentication will be available in a future update');
      },
      status: 'Coming Soon',
      statusColor: colors.textSecondary,
      showChevron: true,
    },
    {
      id: 'notification_settings',
      title: 'Notification Settings',
      description: 'Manage push notifications, email alerts, and rate subscriptions',
      icon: <Bell size={20} color={colors.primary} />,
      action: () => router.push('/profile/notification-settings'),
      showChevron: true,
    },
  ];

  const renderSecurityOption = (option: SecurityOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionItem,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={styles.optionIcon}>
        {option.icon}
      </View>
      
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>
          {option.title}
        </Text>
        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
          {option.description}
        </Text>
        {option.status && (
          <Text style={[styles.optionStatus, { color: option.statusColor }]}>
            Status: {option.status}
          </Text>
        )}
      </View>
      
      {option.showChevron && (
        <ChevronRight size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header 
        title="Security & Privacy"
        subtitle="Manage your account security settings"
      />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Security
          </Text>
          <View style={styles.optionsGroup}>
            {securityOptions.map(renderSecurityOption)}
          </View>
        </View>

        {/* Social Account Binding Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Social Account Binding
          </Text>
          <SocialBindingCard />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Danger Zone
          </Text>
          <Card style={[styles.dangerCard, { backgroundColor: `${colors.error}10` }]}>
            <View style={styles.dangerHeader}>
              <AlertTriangle size={24} color={colors.error} />
              <View style={styles.dangerContent}>
                <Text style={[styles.dangerTitle, { color: colors.error }]}>
                  Delete Account
                </Text>
                <Text style={[styles.dangerDescription, { color: colors.text }]}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Text>
              </View>
            </View>
            
            <Button
              title={isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              variant="outline"
              onPress={handleDeleteAccount}
              loading={isDeletingAccount}
              style={[styles.deleteButton, { borderColor: colors.error }]}
              textStyle={{ color: colors.error }}
            />
          </Card>
        </View>

        {/* Security Tips */}
        <Card style={[styles.tipsCard, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.tipsTitle, { color: colors.primary }]}>
            🛡️ Security Tips
          </Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            • Use a strong, unique password for your account{'\n'}
            • Enable two-factor authentication when available{'\n'}
            • Bind multiple social accounts for easier recovery{'\n'}
            • Set a secure withdraw password different from your login password{'\n'}
            • Regularly review your account activity and settings
          </Text>
        </Card>
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          // Reload user data to reflect changes
          // reloadUser();
        }}
      />

      <ChangeWithdrawPasswordModal
        visible={showWithdrawPasswordModal}
        onClose={() => setShowWithdrawPasswordModal(false)}
        onSuccess={() => {
          setShowWithdrawPasswordModal(false);
          // Reload user data to reflect changes
          // reloadUser();
        }}
      />

      {/* Customer Service Button */}
      <CustomerServiceButton
        style={styles.customerServiceButton}
        size={48}
        draggable={true}
        opacity={0.9}
      />
    </SafeAreaWrapper>
  );
}

export default function SecurityScreen() {
  return (
    <AuthGuard>
      <SecurityScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },
  optionsGroup: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionIcon: {
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  optionStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  dangerCard: {
    padding: Spacing.lg,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  dangerContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dangerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  dangerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  deleteButton: {
    alignSelf: 'flex-start',
  },
  tipsCard: {
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  customerServiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
});