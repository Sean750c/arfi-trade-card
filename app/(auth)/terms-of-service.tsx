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
import { ChevronLeft, FileText } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

export default function TermsOfServiceScreen() {
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
          <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Last updated: January 1, 2024
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <FileText size={20} color={colors.primary} />
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
            Welcome to AfriTrade. These Terms of Service ("Terms") govern your use of our gift card trading platform and services. By accessing or using AfriTrade, you agree to be bound by these Terms.
          </Text>
        </View>

        {/* Acceptance of Terms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Acceptance of Terms
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our services.
          </Text>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Eligibility
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            You must be at least 18 years old to use AfriTrade. By using our services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
          </Text>
        </View>

        {/* Account Registration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Account Registration
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            To use our services, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
        </View>

        {/* Gift Card Trading */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Gift Card Trading
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            AfriTrade provides a platform for trading gift cards. You acknowledge that:
            {'\n\n'}• All gift cards must be legitimate and obtained through legal means
            {'\n'}• You are responsible for the authenticity of gift cards you trade
            {'\n'}• We reserve the right to verify gift card validity
            {'\n'}• Trading rates are subject to market conditions and may change
          </Text>
        </View>

        {/* Prohibited Activities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Prohibited Activities
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            You agree not to:
            {'\n\n'}• Trade fraudulent, stolen, or invalid gift cards
            {'\n'}• Use our services for money laundering or illegal activities
            {'\n'}• Attempt to manipulate trading rates or exploit system vulnerabilities
            {'\n'}• Create multiple accounts to circumvent limits or restrictions
            {'\n'}• Engage in any activity that disrupts or interferes with our services
          </Text>
        </View>

        {/* Fees and Payments */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Fees and Payments
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            AfriTrade may charge fees for certain services. All applicable fees will be clearly disclosed before you complete a transaction. Fees are non-refundable except as required by law.
          </Text>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Intellectual Property
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            All content, features, and functionality of AfriTrade are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
          </Text>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Limitation of Liability
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            To the maximum extent permitted by law, AfriTrade shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
          </Text>
        </View>

        {/* Termination */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Termination
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We may terminate or suspend your account at any time for violation of these Terms or for any other reason at our sole discretion. You may also terminate your account at any time by contacting us.
          </Text>
        </View>

        {/* Changes to Terms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Changes to Terms
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our platform. Your continued use of our services after such changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            12. Contact Information
          </Text>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            If you have any questions about these Terms of Service, please contact us at:
            {'\n\n'}Email: legal@afritrade.com
            {'\n'}Phone: +234 123 456 7890
            {'\n'}Address: Lagos, Nigeria
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            By using AfriTrade, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
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