import React from 'react';
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
  ChevronLeft, 
  Shield, 
  Lock, 
  Key, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronRight,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  Apple,
  Facebook,
} from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

function SecurityScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const securityItems = [
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: <Lock size={20} color={colors.primary} />,
      status: 'secure',
      onPress: () => handleChangePassword(),
    },
    {
      id: 'security-questions',
      title: 'Security Questions',
      description: 'Set up security questions for account recovery',
      icon: <Key size={20} color={colors.primary} />,
      status: 'not-set',
      onPress: () => handleSecurityQuestions(),
    },
    {
      id: 'phone',
      title: 'Phone Number',
      description: user?.whatsapp_bind ? 'Phone number verified' : 'Add phone number for security',
      icon: <Phone size={20} color={colors.primary} />,
      status: user?.whatsapp_bind ? 'verified' : 'not-verified',
      onPress: () => handlePhoneBinding(),
    },
    {
      id: 'email',
      title: 'Email Address',
      description: user?.is_email_bind ? 'Email verified' : 'Add email for security',
      icon: <Mail size={20} color={colors.primary} />,
      status: user?.is_email_bind ? 'verified' : 'not-verified',
      onPress: () => handleEmailBinding(),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: user?.whatsapp_bind ? 'WhatsApp connected' : 'Connect WhatsApp for notifications',
      icon: <MessageCircle size={20} color={colors.primary} />,
      status: user?.whatsapp_bind ? 'verified' : 'not-verified',
      onPress: () => handleWhatsAppBinding(),
    },
  ];

  const socialItems = [
    {
      id: 'google',
      title: 'Google Account',
      description: 'Connect your Google account',
      icon: <Shield size={20} color={colors.primary} />,
      status: 'not-connected',
      onPress: () => handleGoogleBinding(),
    },
    {
      id: 'facebook',
      title: 'Facebook Account',
      description: 'Connect your Facebook account',
      icon: <Facebook size={20} color={colors.primary} />,
      status: 'not-connected',
      onPress: () => handleFacebookBinding(),
    },
    {
      id: 'apple',
      title: 'Apple ID',
      description: 'Connect your Apple ID',
      icon: <Apple size={20} color={colors.primary} />,
      status: 'not-connected',
      onPress: () => handleAppleBinding(),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'secure':
        return <CheckCircle size={16} color={colors.success} />;
      case 'not-verified':
      case 'not-set':
      case 'not-connected':
        return <AlertCircle size={16} color={colors.warning} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'secure':
        return colors.success;
      case 'not-verified':
      case 'not-set':
      case 'not-connected':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality would be implemented here');
  };

  const handleSecurityQuestions = () => {
    Alert.alert('Security Questions', 'Security questions setup would be implemented here');
  };

  const handlePhoneBinding = () => {
    Alert.alert('Phone Binding', 'Phone number binding functionality would be implemented here');
  };

  const handleEmailBinding = () => {
    Alert.alert('Email Binding', 'Email binding functionality would be implemented here');
  };

  const handleWhatsAppBinding = () => {
    Alert.alert('WhatsApp Binding', 'WhatsApp binding functionality would be implemented here');
  };

  const handleGoogleBinding = () => {
    Alert.alert('Google Binding', 'Google account binding functionality would be implemented here');
  };

  const handleFacebookBinding = () => {
    Alert.alert('Facebook Binding', 'Facebook account binding functionality would be implemented here');
  };

  const handleAppleBinding = () => {
    Alert.alert('Apple Binding', 'Apple ID binding functionality would be implemented here');
  };

  const renderSecurityItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.securityItem,
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.itemIcon, { backgroundColor: `${colors.primary}15` }]}>
        {item.icon}
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
      
      <View style={styles.itemRight}>
        {getStatusIcon(item.status)}
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
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
          <Text style={[styles.title, { color: colors.text }]}>Security</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Protect your account
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Overview */}
        <View style={[
          styles.overviewCard,
          { backgroundColor: `${colors.primary}15` }
        ]}>
          <Shield size={32} color={colors.primary} />
          <Text style={[styles.overviewTitle, { color: colors.primary }]}>
            Account Security
          </Text>
          <Text style={[styles.overviewDescription, { color: colors.text }]}>
            Keep your account secure by enabling two-factor authentication and keeping your contact information up to date.
          </Text>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Security
          </Text>
          {securityItems.map(renderSecurityItem)}
        </View>

        {/* Social Account Binding */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Social Account Binding
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Connect your social accounts for easier login and account recovery
          </Text>
          {socialItems.map(renderSecurityItem)}
        </View>

        {/* Security Tips */}
        <View style={[
          styles.tipsCard,
          { backgroundColor: `${colors.warning}10` }
        ]}>
          <Text style={[styles.tipsTitle, { color: colors.warning }]}>
            🔒 Security Tips
          </Text>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, { color: colors.text }]}>
              • Use a strong, unique password
            </Text>
            <Text style={[styles.tipItem, { color: colors.text }]}>
              • Enable two-factor authentication
            </Text>
            <Text style={[styles.tipItem, { color: colors.text }]}>
              • Keep your contact information updated
            </Text>
            <Text style={[styles.tipItem, { color: colors.text }]}>
              • Never share your login credentials
            </Text>
            <Text style={[styles.tipItem, { color: colors.text }]}>
              • Log out from shared devices
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function SecurityScreen() {
  const { colors } = useTheme();
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  overviewCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  overviewTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  overviewDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 2,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipsCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});