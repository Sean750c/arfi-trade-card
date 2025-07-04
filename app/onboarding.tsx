import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import Button from '@/components/UI/Button';
import { useTheme } from '@/theme/ThemeContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to AfriTrade',
    description: 'Your trusted platform for trading gift cards at the best rates in Africa',
    image: 'https://images.pexels.com/photos/7821487/pexels-photo-7821487.jpeg',
  },
  {
    id: '2',
    title: 'Best Rates Guaranteed',
    description: 'Get competitive rates for your gift cards with our real-time rate updates',
    image: 'https://images.pexels.com/photos/7821488/pexels-photo-7821488.jpeg',
  },
  {
    id: '3',
    title: 'Secure Transactions',
    description: 'Trade with confidence using our secure and reliable platform',
    image: 'https://images.pexels.com/photos/7821490/pexels-photo-7821490.jpeg',
  },
];

export default function OnboardingScreen() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slideIndex);
  };

  const goToNextSlide = () => {
    if (activeSlide < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: width * (activeSlide + 1),
        animated: true,
      });
      setActiveSlide(activeSlide + 1);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleSkip = () => {
    scrollRef.current?.scrollTo({
      x: width * (slides.length - 1),
      animated: true,
    });
    setActiveSlide(slides.length - 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Image source={{ uri: slide.image }} style={styles.image} />
            <View style={styles.overlay} />
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.secondary }]}>
                {slide.title}
              </Text>
              <Text style={[styles.description, { color: colors.secondary }]}>
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === activeSlide ? colors.primary : colors.border,
                  width: index === activeSlide ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {activeSlide < slides.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.primary }]}
                onPress={handleSkip}
              >
                <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
              </TouchableOpacity>
              <Button
                title="Next"
                onPress={goToNextSlide}
                style={styles.actionButton}
                rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
              />
            </>
          ) : (
            <Button
              title="Get Started"
              onPress={handleComplete}
              style={styles.actionButton}
              fullWidth
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
    paddingBottom: 200,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skipButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  actionButton: {
    flex: 1,
  },
});