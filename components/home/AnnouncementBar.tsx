import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
  withRepeat,
} from 'react-native-reanimated';
import { Megaphone, Volume2 } from 'lucide-react-native';
import { useBannerStore } from '@/stores/useBannerStore';
import { useTheme } from '@/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCROLL_SPEED = 50; // pixels per second
const BAR_HEIGHT = 40;
const SEPARATOR = '  •  '; // Separator between announcements
const MIN_DURATION = 8000; // Minimum animation duration
const MAX_DURATION = 20000; // Maximum animation duration

const AnnouncementBar: React.FC = () => {
  const { colors } = useTheme();
  const { announcementContent } = useBannerStore();
  const [visible, setVisible] = useState(true);
  const [textWidth, setTextWidth] = useState(SCREEN_WIDTH);
  const [combinedText, setCombinedText] = useState('');
  const hasMeasured = useRef(false);

  const offsetX = useSharedValue(SCREEN_WIDTH);
  const isTouching = useRef(false);

  // Combine all announcements into a single scrolling text
  useEffect(() => {
    if (announcementContent.length > 0) {
      const combined = announcementContent.join(SEPARATOR);
      // If we have multiple announcements, repeat the text for seamless loop
      const finalText = announcementContent.length > 1 
        ? `${combined}${SEPARATOR}${combined}` 
        : combined;
      setCombinedText(finalText);
      hasMeasured.current = false;
    }
  }, [announcementContent]);

  const getDuration = (distance: number) => {
    const calculatedDuration = (distance / SCROLL_SPEED) * 1000;
    return Math.min(MAX_DURATION, Math.max(MIN_DURATION, calculatedDuration));
  };

  const handleAnimationEnd = () => {
    if (isTouching.current) return;
    
    // Reset position and start again for continuous loop
    offsetX.value = SCREEN_WIDTH;
    startAnimation();
  };

  const startAnimation = () => {
    if (!combinedText || isTouching.current) return;

    const totalDistance = textWidth + SCREEN_WIDTH;
    const duration = getDuration(totalDistance);

    offsetX.value = withTiming(
      -textWidth,
      {
        duration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) runOnJS(handleAnimationEnd)();
      }
    );
  };

  useEffect(() => {
    if (!combinedText) return;
    
    // Small delay to ensure text measurement is complete
    const timer = setTimeout(() => {
      if (hasMeasured.current) {
        startAnimation();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimation(offsetX);
    };
  }, [combinedText, textWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const handlePressIn = () => {
    isTouching.current = true;
    cancelAnimation(offsetX);
  };

  const handlePressOut = () => {
    isTouching.current = false;
    
    // Resume animation from current position
    const remainingDistance = Math.max(0, offsetX.value + textWidth);
    const duration = getDuration(remainingDistance);
    
    offsetX.value = withTiming(
      -textWidth,
      {
        duration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) runOnJS(handleAnimationEnd)();
      }
    );
  };

  if (!visible || !combinedText) return null;

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={false}
    >
      <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Volume2 size={16} color={colors.primary} />
        </View>

        {/* Scrolling Text Container */}
        <View style={styles.textContainer}>
          <Animated.View style={[animatedStyle]}>
            <Text
              style={[styles.text, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="clip"
              onLayout={(e) => {
                if (!hasMeasured.current) {
                  const measuredWidth = e.nativeEvent.layout.width;
                  setTextWidth(Math.max(measuredWidth, SCREEN_WIDTH * 1.5));
                  hasMeasured.current = true;
                }
              }}
            >
              {combinedText}
            </Text>
          </Animated.View>
        </View>

        {/* Gradient Fade Effects */}
        <View style={[styles.fadeLeft, { backgroundColor: colors.card }]} />
        <View style={[styles.fadeRight, { backgroundColor: colors.card }]} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  textContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
    paddingVertical: 0,
    // Ensure text doesn't wrap
    flexWrap: 'nowrap',
    flexShrink: 0,
  },
  fadeLeft: {
    position: 'absolute',
    left: 52, // After icon
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
    opacity: 0.8,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
    opacity: 0.8,
  },
});

export default AnnouncementBar;