// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Tag, X, Sparkles, TrendingUp, Clock } from 'lucide-react-native';
// import { useTheme } from '@/theme/ThemeContext';
// import Spacing from '@/constants/Spacing';
// import { Coupon } from '@/types';

// const { width } = Dimensions.get('window');

// interface SmartCouponRecommendationProps {
//   visible: boolean;
//   onClose: () => void;
//   coupons: Coupon[];
//   onSelectCoupon: (coupon: Coupon) => void;
//   estimatedAmount: number;
// }

// export default function SmartCouponRecommendation({
//   visible,
//   onClose,
//   coupons,
//   onSelectCoupon,
//   estimatedAmount,
// }: SmartCouponRecommendationProps) {
//   const { colors } = useTheme();

//   const calculateCouponValue = (coupon: Coupon): number => {
//     if (coupon.add_fee_number) {
//       return parseFloat(coupon.add_fee_number);
//     }
//     if (coupon.add_fee_percentage) {
//       return (estimatedAmount * parseFloat(coupon.add_fee_percentage)) / 100;
//     }
//     return 0;
//   };

//   const sortedCoupons = [...coupons]
//     .map((coupon) => ({
//       ...coupon,
//       value: calculateCouponValue(coupon),
//     }))
//     .sort((a, b) => b.value - a.value);

//   const bestCoupon = sortedCoupons[0];

//   const handleSelectCoupon = (coupon: Coupon) => {
//     onSelectCoupon(coupon);
//     onClose();
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={styles.overlay}>
//         <View style={[styles.container, { backgroundColor: colors.card }]}>
//           <TouchableOpacity
//             style={[styles.closeButton, { backgroundColor: colors.background }]}
//             onPress={onClose}
//           >
//             <X size={20} color={colors.text} strokeWidth={2.5} />
//           </TouchableOpacity>

//           <LinearGradient
//             colors={['#10B98120', '#10B98108']}
//             style={styles.header}
//           >
//             <View style={styles.headerIcon}>
//               <Sparkles size={32} color="#10B981" strokeWidth={2.5} />
//             </View>
//             <Text style={[styles.title, { color: colors.text }]}>
//               Smart Coupon Picker
//             </Text>
//             <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
//               We found the best deals for you!
//             </Text>
//           </LinearGradient>

//           {bestCoupon && (
//             <View style={styles.bestDealContainer}>
//               <LinearGradient
//                 colors={['#F59E0B', '#F59E0B'+ 'DD']}
//                 style={styles.bestDealBanner}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 <TrendingUp size={16} color="#FFFFFF" strokeWidth={2.5} />
//                 <Text style={styles.bestDealText}>BEST DEAL</Text>
//               </LinearGradient>
//             </View>
//           )}

//           <ScrollView
//             style={styles.scrollView}
//             showsVerticalScrollIndicator={false}
//           >
//             {sortedCoupons.length > 0 ? (
//               sortedCoupons.map((coupon, index) => {
//                 const isBest = index === 0;
//                 return (
//                   <TouchableOpacity
//                     key={coupon.id}
//                     style={[
//                       styles.couponCard,
//                       {
//                         backgroundColor: colors.background,
//                         borderColor: isBest ? '#F59E0B' : colors.border,
//                         borderWidth: isBest ? 2 : 1,
//                       },
//                     ]}
//                     onPress={() => handleSelectCoupon(coupon)}
//                   >
//                     <View style={styles.couponContent}>
//                       <View style={styles.couponLeft}>
//                         <View
//                           style={[
//                             styles.couponIcon,
//                             { backgroundColor: '#10B98115' },
//                           ]}
//                         >
//                           <Tag size={20} color="#10B981" strokeWidth={2.5} />
//                         </View>
//                         <View style={styles.couponInfo}>
//                           <Text style={[styles.couponName, { color: colors.text }]}>
//                             {coupon.coupon_name}
//                           </Text>
//                           {coupon.expire_time && (
//                             <View style={styles.expiryContainer}>
//                               <Clock size={12} color={colors.textSecondary} />
//                               <Text
//                                 style={[
//                                   styles.expiryText,
//                                   { color: colors.textSecondary },
//                                 ]}
//                               >
//                                 Expires: {coupon.expire_time}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                       </View>

//                       <View style={styles.couponRight}>
//                         <Text style={[styles.couponValue, { color: '#10B981' }]}>
//                           +${coupon.value.toFixed(2)}
//                         </Text>
//                         {isBest && (
//                           <View style={styles.bestBadge}>
//                             <Sparkles size={10} color="#F59E0B" strokeWidth={3} />
//                           </View>
//                         )}
//                       </View>
//                     </View>

//                     {isBest && (
//                       <View style={styles.savingsHighlight}>
//                         <Text
//                           style={[
//                             styles.savingsText,
//                             { color: colors.textSecondary },
//                           ]}
//                         >
//                           Maximum savings with this coupon
//                         </Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })
//             ) : (
//               <View style={styles.emptyState}>
//                 <Tag size={48} color={colors.textSecondary} strokeWidth={1.5} />
//                 <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
//                   No coupons available
//                 </Text>
//               </View>
//             )}
//           </ScrollView>

//           <View style={styles.footer}>
//             <TouchableOpacity
//               style={[styles.skipButton, { backgroundColor: colors.background }]}
//               onPress={onClose}
//             >
//               <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
//                 Skip for Now
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: width - 40,
//     maxWidth: 440,
//     maxHeight: '80%',
//     borderRadius: 24,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: Spacing.lg,
//     right: Spacing.lg,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   header: {
//     alignItems: 'center',
//     paddingTop: Spacing.xl + Spacing.lg,
//     paddingBottom: Spacing.lg,
//     paddingHorizontal: Spacing.xl,
//   },
//   headerIcon: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#10B98115',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: Spacing.md,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '800',
//     marginBottom: Spacing.xs,
//     letterSpacing: 0.3,
//   },
//   subtitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   bestDealContainer: {
//     alignItems: 'center',
//     marginTop: -Spacing.sm,
//     marginBottom: Spacing.md,
//   },
//   bestDealBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.xs,
//     borderRadius: 16,
//   },
//   bestDealText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   scrollView: {
//     maxHeight: 400,
//   },
//   couponCard: {
//     marginHorizontal: Spacing.lg,
//     marginBottom: Spacing.md,
//     borderRadius: 16,
//     padding: Spacing.md,
//   },
//   couponContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   couponLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     flex: 1,
//   },
//   couponIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   couponInfo: {
//     flex: 1,
//   },
//   couponName: {
//     fontSize: 15,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   expiryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   expiryText: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   couponRight: {
//     alignItems: 'flex-end',
//   },
//   couponValue: {
//     fontSize: 18,
//     fontWeight: '800',
//   },
//   bestBadge: {
//     marginTop: 4,
//   },
//   savingsHighlight: {
//     marginTop: Spacing.sm,
//     paddingTop: Spacing.sm,
//     borderTopWidth: 1,
//     borderTopColor: '#F59E0B20',
//   },
//   savingsText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: Spacing.xl * 2,
//   },
//   emptyText: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: Spacing.md,
//   },
//   footer: {
//     padding: Spacing.lg,
//   },
//   skipButton: {
//     paddingVertical: Spacing.md,
//     borderRadius: 14,
//     alignItems: 'center',
//   },
//   skipButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
// });
