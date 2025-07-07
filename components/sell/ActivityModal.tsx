import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { X, Trophy, Gift, DollarSign, Calendar, TrendingUp, ExternalLink } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import type { OrderSellDetail } from '@/types/order';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  orderSellDetail?: OrderSellDetail;
  currencySymbol?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function ActivityModal({ 
  visible, 
  onClose, 
  orderSellDetail,
  currencySymbol = '₦'
}: ActivityModalProps) {
  const { colors } = useTheme();

  // Extract data from orderSellDetail
  const firstOrderBonus = orderSellDetail?.first_order_bonus || 0;
  const amountOrderBonus = orderSellDetail?.amount_order_bonus || [];
  const activities = orderSellDetail?.activity || [];

  // Handle activity link click
  const handleActivityLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  // Calculate modal height based on content
  const calculateModalHeight = () => {
    const headerHeight = 80; // Header height including padding
    const padding = Spacing.lg * 2; // Top and bottom padding
    const minHeight = 300; // Minimum height in pixels
    const maxHeight = screenHeight * 0.8; // Maximum 80% of screen height
    
    // Calculate content sections
    let contentHeight = 0;
    
    // First order bonus section
    if (firstOrderBonus > 0) {
      contentHeight += 120;
    }
    
    // Amount order bonus section
    if (amountOrderBonus.length > 0) {
      contentHeight += 150 + (amountOrderBonus.length * 60);
    }
    
    // Activity section
    if (activities.length > 0) {
      contentHeight += 150 + (activities.length * 80);
    }
    
    // Info box height
    contentHeight += 150;
    
    const totalHeight = headerHeight + padding + contentHeight;
    
    return Math.max(minHeight, Math.min(totalHeight, maxHeight));
  };

  const modalHeight = calculateModalHeight();

  // Format amount with currency symbol
  const formatAmount = (amount: number, currencySymbol: string) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent, 
          { 
            backgroundColor: colors.card,
            height: modalHeight,
          }
        ]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Trophy size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Activity Rebate Program
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* First Order Bonus Section */}
            {firstOrderBonus > 0 && (
              <View style={[styles.section, { backgroundColor: `${colors.warning}10` }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.warning }]}>
                    <Gift size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    First Order Bonus
                  </Text>
                </View>
                <Text style={[styles.bonusAmount, { color: colors.warning }]}>
                  +{formatAmount(firstOrderBonus, currencySymbol)}
                </Text>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  Welcome bonus for your first order. This bonus will be automatically credited to your account.
                </Text>
              </View>
            )}

            {/* Amount Order Bonus Section */}
            {amountOrderBonus.length > 0 && (
              <View style={[styles.section, { backgroundColor: `${colors.success}10` }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.success }]}>
                    <DollarSign size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Order Amount Bonus
                  </Text>
                </View>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  Earn bonus rewards based on your order amount. The higher the amount, the bigger the bonus!
                </Text>
                
                <View style={[styles.bonusTable, { borderColor: colors.border }]}>
                  {/* Table Header */}
                  <View style={[styles.tableHeader, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.tableHeaderText, { color: colors.text }]}>
                      Order Amount
                    </Text>
                    <Text style={[styles.tableHeaderText, { color: colors.text }]}>
                      Bonus Reward
                    </Text>
                  </View>
                  
                  {/* Table Rows */}
                  {amountOrderBonus.map((bonus, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.tableRow, 
                        { 
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        }
                      ]}
                    >
                      <Text style={[styles.tableCell, { color: colors.textSecondary }]}>
                        ≥ {formatAmount(bonus.order_amount, '$')}
                      </Text>
                      <Text style={[styles.tableCell, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                        +{formatAmount(bonus.bonus_amount, currencySymbol)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Activity Bonus Section */}
            {activities.length > 0 && (
              <View style={[styles.section, { backgroundColor: `${colors.primary}10` }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primary }]}>
                    <TrendingUp size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Special Activities
                  </Text>
                </View>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  Limited-time activities with exclusive rewards and bonuses.
                </Text>
                
                <View style={styles.activityList}>
                  {activities.map((activity, index) => (
                    <TouchableOpacity 
                      key={activity.id} 
                      style={[
                        styles.activityItem, 
                        { 
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        }
                      ]}
                      onPress={() => {
                        if (activity.activity_url) {
                          handleActivityLink(activity.activity_url);
                        }
                      }}
                    >
                      <View style={styles.activityHeader}>
                        <Text style={[styles.activityName, { color: colors.text }]}>
                          {activity.name}
                        </Text>
                        {activity.activity_url && (
                          <View style={[styles.activityLink, { backgroundColor: `${colors.primary}15` }]}>
                            <ExternalLink size={12} color={colors.primary} />
                            <Text style={[styles.activityLinkText, { color: colors.primary }]}>
                              View
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.activityTime}>
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text style={[styles.activityTimeText, { color: colors.textSecondary }]}>
                          {formatDate(activity.start_time)} - {formatDate(activity.end_time)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.infoTitle, { color: colors.primary }]}>
                💡 How It Works
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {firstOrderBonus > 0 && '• First order bonus is automatically applied to your initial transaction\n'}
                {amountOrderBonus.length > 0 && '• Amount bonuses are credited when you reach qualifying order amounts\n'}
                {activities.length > 0 && '• Activity bonuses are available during special promotional periods\n'}
                {firstOrderBonus > 0 || amountOrderBonus.length > 0 || activities.length > 0 ? (
                  '• All bonuses are automatically credited to your account\n• Bonuses can be combined with VIP rate bonuses'
                ) : (
                  '• No active bonus programs at the moment\n• Check back later for new promotions and rewards'
                )}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  bonusAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  bonusTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlign: 'center',
  },
  activityList: {
    gap: Spacing.md,
  },
  activityItem: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activityName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  activityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  activityLinkText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  activityTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  infoBox: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});