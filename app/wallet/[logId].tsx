import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MoneyLogDetail } from '@/types';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Button from '@/components/UI/Button';
import { useWalletStore } from '@/stores/useWalletStore';

export default function TransactionDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const { user } = useAuthStore();
  const { fetchLogDetail, isLoadingDetail, detailError } = useWalletStore();
  const [detail, setDetail] = useState<MoneyLogDetail | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    fetchDetail();
  }, [user?.token, logId]);

  const fetchDetail = async () => {
    if (!user?.token || !logId) return;
    try {
      const logDetail = await fetchLogDetail(user.token, Number(logId));
      setDetail(logDetail);
    } catch (err) {
      console.error('Failed to load log detail:', err);
    }
  };

  if (isLoadingDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading transaction details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (detailError || !detail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            Failed to transaction log details
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {detailError || 'Transaction not found'}
          </Text>
          <Button
            title="Try Again"
            onPress={fetchDetail}
            style={styles.retryButton}
          />
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
          <Text style={[styles.title, { color: colors.text }]}>Transaction Details</Text>
        </View>
      </View>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: colors.text }]}>Transaction Details</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Transaction No:</Text>
            <Text style={[styles.value, { color: colors.text }]}>#{detail.serial_number.slice(-14)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Amount:</Text>
            <Text style={[styles.value, { color: detail.amount > 0 ? colors.success : colors.error }]}>
              {detail.amount > 0 ? '+' : '-'}{Math.abs(detail.amount).toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Balance:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{detail.balance_amount.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(detail.create_time * 1000).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{detail.order_status}</Text>
          </View>

          {detail.name && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{detail.name}</Text>
            </View>
          )}

          {detail.account_no && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Account:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{detail.account_no}</Text>
            </View>
          )}

          {detail.bank_name && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Bank:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{detail.bank_name}</Text>
            </View>
          )}

          {detail.remark && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Remark:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{detail.remark}</Text>
            </View>
          )}
          
          {detail.name === 'Withdraw' && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: detail.image }} 
                style={styles.withdrawImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
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
  card: {
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  withdrawImage: {
    width: 200,
    height: 200,
  },
});