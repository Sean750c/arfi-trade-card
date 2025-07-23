import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Shield, 
  Lock, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import { AuthService } from '@/services/auth';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

// Modal Components
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import ChangeWithdrawPasswordModal from '@/components/profile/ChangeWithdrawPasswordModal';
import BindPhoneModal from '@/components/profile/BindPhoneModal';
import BindEmailModal from '@/components/profile/BindEmailModal';
import BindWhatsAppModal from '@/components/profile/BindWhatsAppModal';

function SecurityScreenContent() {
  const { colors } = useTheme();
  const { user, reloadUser } = useAuthStore();
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeWithdrawPasswordModal, setShowChangeWithdrawPasswordModal] = useState(false);
  const [showBindPhoneModal, setShowBindPhoneModal] = useState(false);
  const [showBindEmailModal, setShowBindEmailModal] = useState(false);
  const [showBindWhatsAppModal, setShowBindWhatsAppModal] = useState(false);

  const securityItems = [
    {
      id: 'password',
      title: 'Login Password',
      subtitle: user?.password_null ? 'Not set' : 'Set',
      icon: <Lock size={24} color={colors.primary} />,
      status: !user?.password_null,
      onPress: () => setShowChangePasswordModal(true),
    },
    {
      id: 'withdraw_password',
      title: 'Withdraw Password',
      subtitle: user?.t_password_null ? 'Not set' : 'Set',
      icon: <Shield size={24} color={colors.primary} />,
      status: !user?.t_password_null,
      onPress: () => setShowChangeWithdrawPasswordModal(true),
    },
    {
      id: 'phone',
      title: 'Phone Number',
      subtitle: user?.phone || 'Not bound',
      icon: <Phone size={24} color={colors.primary} />,
      status: !!user?.phone,
      onPress: () => setShowBindPhoneModal(true),
    },
    {
      id: 'email',
      title: 'Email Address',
      subtitle: user?.email || 'Not bound',
      icon: <Mail size={24} color={colors.primary} />,
      status: user?.is_email_bind || false,
      onPress: () => setShowBindEmailModal(true),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: user?.whatsapp || 'Not bound',
      icon: <MessageCircle size={24} color={colors.primary} />,
      status: user?.whatsapp_bind || false,
      onPress: () => setShowBindWhatsAppModal(true),
    },
  ];

  const handleModalClose = async (shouldReload = false) => {
    if (shouldReload) {
      try {
        await reloadUser();
      } catch (error) {
        console.error('Failed to reload user:', error);
      }
    }
  };

  const renderSecurityItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.securityItem,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.securityItemLeft}>
        <View style={[
          styles.securityItemIcon,
          { backgroundColor: `${colors.primary}15` }
        ]}>
          {item.icon}
        </View>
        <View style={styles.securityItemContent}>
          <Text style={[styles.securityItemTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[
            styles.securityItemSubtitle, 
            { color: item.status ? colors.success : colors.textSecondary }
          ]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
      
      <View style={styles.securityItemRight}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status ? colors.success : colors.border }
        ]}>
          {item.status ? (
            <Check size={12} color="#FFFFFF" />
          ) : (
            <X size={12} color={colors.textSecondary} />
          )}
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header 
        title="Security Settings" 
        subtitle="Manage your account security"
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Overview */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Shield size={32} color={colors.primary} />
            <View style={styles.overviewContent}>
              <Text style={[styles.overviewTitle, { color: colors.text }]}>
                Account Security
              </Text>
              <Text style={[styles.overviewSubtitle, { color: colors.textSecondary }]}>
                Keep your account safe and secure
              </Text>
            </View>
          </View>
          
          <View style={styles.securityScore}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
              Security Score
            </Text>
            <View style={styles.scoreContainer}>
              <View style={[
                styles.scoreBar,
                { backgroundColor: colors.border }
              ]}>
                <View style={[
                  styles.scoreProgress,
                  { 
                    backgroundColor: colors.success,
                    width: `${(securityItems.filter(item => item.status).length / securityItems.length) * 100}%`
                  }
                ]} />
              </View>
              <Text style={[styles.scoreText, { color: colors.success }]}>
                {securityItems.filter(item => item.status).length}/{securityItems.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Security Items */}
        <View style={styles.securityList}>
          {securityItems.map(renderSecurityItem)}
        </View>

        {/* Security Tips */}
        <Card style={[styles.tipsCard, { backgroundColor: `${colors.warning}10` }]}>
          <Text style={[styles.tipsTitle, { color: colors.warning }]}>
            🔒 Security Tips
          </Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            • Use a strong, unique password for your account{'\n'}
            • Set up a withdraw password different from your login password{'\n'}
            • Bind your phone number and email for account recovery{'\n'}
            • Enable WhatsApp for important security notifications
          </Text>
        </Card>
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setShowChangePasswordModal(false);
          handleModalClose(true);
        }}
      />

      <ChangeWithdrawPasswordModal
        visible={showChangeWithdrawPasswordModal}
        onClose={() => setShowChangeWithdrawPasswordModal(false)}
        onSuccess={() => {
          setShowChangeWithdrawPasswordModal(false);
          handleModalClose(true);
        }}
      />

      <BindPhoneModal
        visible={showBindPhoneModal}
        onClose={() => setShowBindPhoneModal(false)}
        onSuccess={() => {
          setShowBindPhoneModal(false);
          handleModalClose(true);
        }}
      />

      <BindEmailModal
        visible={showBindEmailModal}
        onClose={() => setShowBindEmailModal(false)}
        onSuccess={() => {
          setShowBindEmailModal(false);
          handleModalClose(true);
        }}
      />

      <BindWhatsAppModal
        visible={showBindWhatsAppModal}
        onClose={() => setShowBindWhatsAppModal(false)}
        onSuccess={() => {
          setShowBindWhatsAppModal(false);
          handleModalClose(true);
        }}
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
  
  // Overview Card
  overviewCard: {
    marginBottom: Spacing.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overviewContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  overviewSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  securityScore: {
    marginTop: Spacing.md,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },

  // Security List
  securityList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  securityItemContent: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  securityItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  securityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tips Card
  tipsCard: {
    padding: Spacing.lg,
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
});