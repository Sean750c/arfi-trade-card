import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Phone, Wifi, Zap, Tv, ArrowRight, Smartphone, History, Chrome as Home, Globe, DollarSign } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import RechargeLogsModal from '@/components/utilities/RechargeLogsModal';

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

function UtilitiesScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const [showLogsModal, setShowLogsModal] = useState(false);

  const services: ServiceItem[] = [
    {
      id: 'mobile-recharge',
      title: 'Mobile Recharge',
      subtitle: 'Airtime & Data top-up',
      icon: <Smartphone size={32} color="#FFFFFF" />,
      route: '/utilities/mobile-recharge',
      color: '#10B981',
      isAvailable: true,
    },
    {
      id: 'cable-tv',
      title: 'Cable TV',
      subtitle: 'DSTV, GOtv & more',
      icon: <Tv size={32} color="#FFFFFF" />,
      route: '/utilities/cable-tv',
      color: '#8B5CF6',
      isAvailable: true,
    },
    {
      id: 'electricity',
      title: 'Electricity Bills',
      subtitle: 'Pay your power bills',
      icon: <Zap size={32} color="#FFFFFF" />,
      route: '/utilities/electricity',
      color: '#F59E0B',
      isAvailable: true,
    },
    {
      id: 'internet',
      title: 'Internet Bills',
      subtitle: 'Broadband payments',
      icon: <Globe size={32} color="#FFFFFF" />,
      route: '/utilities/internet',
      color: '#06B6D4',
      isAvailable: true,
    },
    {
      id: 'lottery',
      title: 'Lottery & Gaming',
      subtitle: 'Sports betting & lotto',
      icon: <DollarSign size={32} color="#FFFFFF" />,
      route: '/utilities/lottery',
      color: '#EF4444',
      isAvailable: true,
    },
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleServicePress = (service: ServiceItem) => {
    if (!service.isAvailable) {
      return;
    }

    if (service.id == 'mobile-recharge' && user?.country_id != 14) {
      Alert.alert('Error', 'Airtime and data recharge is only available for Nigerian users');
      return;
    }

    // Check for Nigerian users for certain services
    if (['cable-tv', 'electricity', 'internet', 'lottery'].includes(service.id) && user?.country_id != 14) {
      Alert.alert('Error', `${service.title} is only available for Nigerian users`);
      return;
    }

    router.push(service.route as any);
  };

  const renderServiceCard = (service: ServiceItem) => (
    <TouchableOpacity
      key={service.id}
      style={[
        styles.serviceCard,
        {
          backgroundColor: service.color,
          opacity: service.isAvailable ? 1 : 0.6,
        }
      ]}
      onPress={() => handleServicePress(service)}
      disabled={!service.isAvailable}
      activeOpacity={0.8}
    >
      {service.comingSoon && (
        <View style={[styles.comingSoonBadge, { backgroundColor: '#FF4444' }]}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}

      <View style={styles.serviceIconContainer}>
        {service.icon}
      </View>

      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
      </View>

      {service.isAvailable && (
        <View style={styles.serviceArrow}>
          <ArrowRight size={20} color="rgba(255, 255, 255, 0.8)" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Life Services</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Pay bills & top-up services
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowLogsModal(true)}
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
            >
              <History size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Services
          </Text>

          <View style={styles.servicesGrid}>
            {services.map(renderServiceCard)}
          </View>
        </View>

        {/* Info Section */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Home size={24} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Why Choose Our Services?
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Instant processing for all transactions{'\n'}
            • Secure payment with your wallet balance{'\n'}
            • Support for all major Nigerian service providers{'\n'}
            • 24/7 customer support for any issues{'\n'}
            • Competitive rates and no hidden fees
          </Text>
        </Card>

        {/* Coming Soon Section */}
        {/* <Card style={[styles.comingSoonCard, { backgroundColor: `${colors.primary}08` }]}>
          <Text style={[styles.comingSoonTitle, { color: colors.primary }]}>
            🚀 Coming Soon
          </Text>
          <Text style={[styles.comingSoonDescription, { color: colors.text }]}>
            We're working hard to bring you more services including electricity bills, 
            cable TV subscriptions, and internet payments. Stay tuned for updates!
          </Text>
        </Card> */}
      </ScrollView>

      <RechargeLogsModal
        title='Utilities History'
        type='all'
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />
    </SafeAreaWrapper>
  );
}

export default function UtilitiesScreen() {
  return (
    <AuthGuard>
      <UtilitiesScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },

  // Services Grid
  servicesGrid: {
    gap: Spacing.md,
  },
  serviceCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  serviceArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info Card
  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  headerActions: {
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

  // Coming Soon Card
  // comingSoonCard: {
  //   padding: Spacing.lg,
  // },
  // comingSoonTitle: {
  //   fontSize: 18,
  //   fontFamily: 'Inter-Bold',
  //   marginBottom: Spacing.sm,
  // },
  // comingSoonDescription: {
  //   fontSize: 14,
  //   fontFamily: 'Inter-Regular',
  //   lineHeight: 20,
  // },
});