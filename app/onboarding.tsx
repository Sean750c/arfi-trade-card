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
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Spacing from '@/constants/Spacing';
import Button from '@/components/UI/Button';
import { useTheme } from '@/theme/ThemeContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to TradePro',
    subtitle: 'Professional Trading Platform',
    description: 'Experience next-generation gift card trading with advanced features and premium security',
    image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
    icon: <Zap size={60} color="#FFFFFF" />,
    gradient: ['#7C3AED', '#EC4899'],
  },
  {
    id: '2',
    title: 'Advanced Security',
    subtitle: 'Bank-Level Protection',
    description: 'Multi-layer security protocols and real-time fraud detection keep your trades safe',
    image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg',
    icon: <Shield size={60} color="#FFFFFF" />,
    gradient: ['#059669', '#0891B2'],
  },
  {
    id: '3',
    title: 'Smart Analytics',
    subtitle: 'Data-Driven Trading',
    description: 'Real-time market insights and intelligent rate optimization for maximum profits',
    image: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg',
    icon: <TrendingUp size={60} color="#FFFFFF" />,
    gradient: ['#DC2626', '#EA580C'],
  },
];

export default function OnboardingScreen() {
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
            <LinearGradient
              colors={slide.gradient}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.slideContent}>
                <View style={styles.iconContainer}>
                  {slide.icon}
                </View>
                
                <View style={styles.textContent}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                  <Text style={styles.slideDescription}>{slide.description}</Text>
                </View>

                <View style={styles.imageContainer}>
                  <Image source={{ uri: slide.image }} style={styles.slideImage} />
                  <View style={styles.imageOverlay} />
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === activeSlide ? colors.primary : colors.border,
                  width: index === activeSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {activeSlide < slides.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.border }]}
                onPress={handleSkip}
              >
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.nextButtonGradient}
              >
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextSlide}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
            </>
          ) : (
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.getStartedGradient}
            >
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleComplete}
              >
                <Text style={styles.getStartedText}>Start Trading</Text>
                <Zap size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
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
  gradientBackground: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 200,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  slideTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slideSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  nextButtonGradient: {
    flex: 1,
    borderRadius: 12,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  getStartedGradient: {
    width: '100%',
    borderRadius: 12,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});