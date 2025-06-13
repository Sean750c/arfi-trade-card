import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
          <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Last updated: January 1, 2024
          </Text>
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
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Introduction
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            AfriTrade ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gift card trading platform.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Information We Collect
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We collect information you provide directly to us, such as:
            {'\n\n'}• Account registration information (email, phone number)
            {'\n'}• Profile information (name, country, preferences)
            {'\n'}• Transaction data and gift card information
            {'\n'}• Communication records with our support team
            {'\n'}• Device information and usage analytics
          </Text>
        </View>

        {/* How We Use Your Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. How We Use Your Information
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We use your information to:
            {'\n\n'}• Provide and maintain our trading services
            {'\n'}• Process transactions and verify gift card authenticity
            {'\n'}• Communicate with you about your account and transactions
            {'\n'}• Improve our services and user experience
            {'\n'}• Comply with legal obligations and prevent fraud
            {'\n'}• Send you promotional communications (with your consent)
          </Text>
        </View>

        {/* Information Sharing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Information Sharing
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            {'\n\n'}• With your explicit consent
            {'\n'}• To comply with legal obligations
            {'\n'}• To protect our rights and prevent fraud
            {'\n'}• With trusted service providers who assist in our operations
            {'\n'}• In connection with a business transfer or merger
          </Text>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Data Security
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            {'\n\n'}• Encryption of sensitive data in transit and at rest
            {'\n'}• Regular security assessments and updates
            {'\n'}• Access controls and authentication requirements
            {'\n'}• Employee training on data protection practices
          </Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Data Retention
          </Text>
          <Text style={[styles.sectionContent,  { color: colors.textSecondary }]}>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your data, we will securely delete or anonymize it.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Your Rights
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            Depending on your location, you may have certain rights regarding your personal information, including:
            {'\n\n'}• Access to your personal information
            {'\n'}• Correction of inaccurate or incomplete information
            {'\n'}• Deletion of your personal information
            {'\n'}• Restriction or objection to processing
            {'\n'}• Data portability
            {'\n'}• Withdrawal of consent
            {'\n\n'}To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </Text>
        </View>

        {/* Cookies and Tracking */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Cookies and Tracking
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences. You can manage your cookie preferences through your browser settings.
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Children's Privacy
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will take steps to delete that information.
          </Text>
        </View>

        {/* Changes to Privacy Policy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Changes to Privacy Policy
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated Privacy Policy.
          </Text>
        </View>

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Contact Us
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            {'\n\n'}Email: privacy@afritrade.com
            {'\n'}Phone: +234 123 456 7890
            {'\n'}Address: Lagos, Nigeria
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            By using AfriTrade, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure practices described herein.
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