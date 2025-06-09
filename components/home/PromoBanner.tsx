import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  Dimensions, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  useColorScheme,
  Linking,
  Alert
} from 'react-native';
import { useBannerStore } from '@/stores/useBannerStore';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

export default function PromoBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
    return null;
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
                  width: index === activeIndex ? 24 : 8,
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
    height: 200,
    marginBottom: Spacing.lg,
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
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  slide: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
});