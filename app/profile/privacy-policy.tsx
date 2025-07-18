import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

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
          <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Last updated: January 1, 2025</Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Shield size={20} color={colors.primary} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Mapping */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.footerText, { color: colors.text }]}>By using CardKing, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure practices described herein.</Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const sections = [
  {
    title: '1. Introduction',
    content: 'CardKing ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gift card trading platform.'
  },
  {
    title: '2. Information We Collect',
    content: 'We collect information you provide directly to us, such as:\n\n• Account registration information (email, phone number)\n• Profile information (name, country, preferences)\n• Transaction data and gift card information\n• Communication records with our support team\n• Device information and usage analytics'
  },
  {
    title: '3. How We Use Your Information',
    content: 'We use your information to:\n\n• Provide and maintain our trading services\n• Process transactions and verify gift card authenticity\n• Communicate with you about your account and transactions\n• Improve our services and user experience\n• Comply with legal obligations and prevent fraud\n• Send you promotional communications (with your consent)'
  },
  {
    title: '4. Information Sharing',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:\n\n• With your explicit consent\n• To comply with legal obligations\n• To protect our rights and prevent fraud\n• With trusted service providers who assist in our operations\n• In connection with a business transfer or merger'
  },
  {
    title: '5. Data Security',
    content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:\n\n• Encryption of sensitive data in transit and at rest\n• Regular security assessments and updates\n• Access controls and authentication requirements\n• Employee training on data protection practices'
  },
  {
    title: '6. Data Retention',
    content: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your data, we will securely delete or anonymize it.'
  },
  {
    title: '7. Your Rights',
    content: 'Depending on your location, you may have certain rights regarding your personal information, including:\n\n• Access to your personal information\n• Correction of inaccurate or incomplete information\n• Deletion of your personal information\n• Restriction or objection to processing\n• Data portability\n• Withdrawal of consent\n\nTo exercise these rights, please contact us using the information provided in the "Contact Us" section.'
  },
  {
    title: '8. Cookies and Tracking',
    content: 'We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences. You can manage your cookie preferences through your browser settings.'
  },
  {
    title: '9. Children\'s Privacy',
    content: 'Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will take steps to delete that information.'
  },
  {
    title: '10. Changes to Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated Privacy Policy.'
  },
  {
    title: '11. Contact Us',
    content: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:\n\nEmail: support@cardking.ng\nPhone: +44 774 681 0750\nAddress: Lagos, Nigeria'
  }
];

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
  iconContainer: {
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  footer: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
});
