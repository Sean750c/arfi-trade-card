import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Share, Copy, Users, User, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

// Sample referrals data
const referrals = [
  { id: '1', name: 'John Doe', date: '2023-05-15', earnings: '₦1,000' },
  { id: '2', name: 'Mary Smith', date: '2023-05-10', earnings: '₦1,000' },
  { id: '3', name: 'Alex Johnson', date: '2023-04-22', earnings: '₦1,000' },
];

function ReferScreenContent() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [referralLink] = useState('https://afritrade.com/ref/tunde123');
  
  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Referral link copied to clipboard!');
  };
  
  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Share', 'Sharing is not available on web');
      } else {
        Alert.alert('Share', 'Sharing options would open here');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Refer & Earn</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Invite friends and earn ₦1,000 per successful referral
            </Text>
          </View>
        </View>
        
        <Card style={styles.referralCard}>
          <View style={styles.referralStatsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>₦3,000</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Earnings
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Referrals
              </Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.linkSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Referral Link
          </Text>
          <View
            style={[
              styles.linkContainer,
              {
                backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.linkInput, { color: colors.text }]}
              value={referralLink}
              editable={false}
              selectTextOnFocus
            />
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={[
                  styles.linkAction,
                  { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={handleCopyLink}
              >
                <Copy size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.linkAction,
                  { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={handleShare}
              >
                <Share size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.howItWorksSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How It Works
          </Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Users size={20} color={colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Invite Friends
                </Text>
                <Text
                  style={[styles.stepDescription, { color: colors.textSecondary }]}
                >
                  Share your unique referral link with friends
                </Text>
              </View>
            </View>
            
            <View
              style={[
                styles.stepConnector,
                { backgroundColor: colors.border },
              ]}
            />
            
            <View style={styles.step}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <User size={20} color={colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  They Sign Up
                </Text>
                <Text
                  style={[styles.stepDescription, { color: colors.textSecondary }]}
                >
                  Your friends create an account using your link
                </Text>
              </View>
            </View>
            
            <View
              style={[
                styles.stepConnector,
                { backgroundColor: colors.border },
              ]}
            />
            
            <View style={styles.step}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <ArrowRight size={20} color={colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  You Earn Rewards
                </Text>
                <Text
                  style={[styles.stepDescription, { color: colors.textSecondary }]}
                >
                  Earn ₦1,000 for each successful referral
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.referralsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Referrals
          </Text>
          {referrals.length > 0 ? (
            referrals.map((referral) => (
              <View
                key={referral.id}
                style={[
                  styles.referralItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.referralIcon,
                    { backgroundColor: `${colors.secondary}20` },
                  ]}
                >
                  <User size={20} color={colors.secondary} />
                </View>
                <View style={styles.referralInfo}>
                  <Text style={[styles.referralName, { color: colors.text }]}>
                    {referral.name}
                  </Text>
                  <Text
                    style={[
                      styles.referralDate,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Joined: {referral.date}
                  </Text>
                </View>
                <Text
                  style={[styles.referralEarnings, { color: colors.success }]}
                >
                  {referral.earnings}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyReferrals}>
              <Text
                style={[styles.emptyReferralsText, { color: colors.textSecondary }]}
              >
                You haven't referred anyone yet
              </Text>
            </View>
          )}
        </View>
        
        <Button
          title="Share Referral Link"
          onPress={handleShare}
          style={styles.shareButton}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ReferScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <ReferScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  referralCard: {
    marginBottom: Spacing.lg,
  },
  referralStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  linkSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  linkActions: {
    flexDirection: 'row',
  },
  linkAction: {
    padding: Spacing.md,
  },
  howItWorksSection: {
    marginBottom: Spacing.lg,
  },
  stepsContainer: {},
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  stepConnector: {
    width: 1,
    height: 20,
    marginLeft: 20,
    marginBottom: Spacing.md,
  },
  referralsSection: {
    marginBottom: Spacing.lg,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  referralEarnings: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyReferrals: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyReferralsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  shareButton: {
    marginBottom: Spacing.xxl,
  },
});