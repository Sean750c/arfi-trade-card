import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView, Text, TouchableOpacity, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Simulated promo data - in a real app, this would come from an API
const promoData = [
  {
    id: '1',
    title: 'Get 5% bonus on your first trade',
    image: 'https://images.pexels.com/photos/7821487/pexels-photo-7821487.jpeg',
  },
  {
    id: '2',
    title: 'Refer friends, earn ₦1,000 per referral',
    image: 'https://images.pexels.com/photos/7821488/pexels-photo-7821488.jpeg',
  },
  {
    id: '3',
    title: 'VIP members get priority processing',
    image: 'https://images.pexels.com/photos/7821490/pexels-photo-7821490.jpeg',
  },
];

export default function PromoBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get('window');
  
  // Auto scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeIndex < promoData.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        setActiveIndex(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // Scroll to active index when it changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: width * activeIndex,
      animated: true,
    });
  }, [activeIndex, width]);

  // Handle manual scroll
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {promoData.map((promo) => (
          <View key={promo.id} style={[styles.slide, { width }]}>
            <Image source={{ uri: promo.image }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.promoText}>{promo.title}</Text>
              <TouchableOpacity 
                style={[styles.promoButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.buttonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {promoData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex ? colors.primary : colors.tabIconDefault,
                width: index === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    marginBottom: Spacing.md,
  },
  slide: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  promoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  promoButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});