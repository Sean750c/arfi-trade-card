import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  Dimensions, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Linking,
  Alert
} from 'react-native';
import { useBannerStore } from '@/stores/useBannerStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

export default function PromoBanner() {
  const { colors } = useTheme();
  const { banners, isLoading, error, fetchBanners } = useBannerStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get('window');
  
  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Auto scroll effect
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      if (activeIndex < banners.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        setActiveIndex(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  // Scroll to active index when it changes
  useEffect(() => {
    if (banners.length > 0) {
      scrollViewRef.current?.scrollTo({
        x: width * activeIndex,
        animated: true,
      });
    }
  }, [activeIndex, width, banners.length]);

  // Handle manual scroll
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < banners.length) {
      setActiveIndex(newIndex);
    }
  };

  // Handle banner press
  const handleBannerPress = async (banner: any) => {
    try {
      const url = banner.new_params || banner.params;
      if (url && banner.action === 'web') {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={[styles.loadingBanner, { backgroundColor: colors.border }]}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading banners...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={[styles.errorBanner, { backgroundColor: `${colors.error}10` }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load banners
          </Text>
          <TouchableOpacity 
            onPress={fetchBanners}
            style={[styles.retryButton, { backgroundColor: colors.error }]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No banners state
  if (banners.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.slide}>
          <Image
            source={require('@/assets/images/default_banner.png')}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

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
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.slide, { width }]}
            onPress={() => handleBannerPress(banner)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: banner.image }} 
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Pagination dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.tabIconDefault,
                  width: index === activeIndex ? 20 : 6,
                },
              ]}
              onPress={() => setActiveIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    marginVertical: Spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBanner: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  slide: {
    height: 150,
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
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});