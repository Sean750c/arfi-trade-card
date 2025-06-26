import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useBannerStore } from '@/stores/useBannerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCROLL_DURATION_PER_PX = 15;
const MAX_LOOP = 3;
const BAR_HEIGHT = 32;
const MIN_DURATION = 3000;
const MAX_DURATION = 10000;

const getDuration = (distance: number) =>
  Math.min(MAX_DURATION, Math.max(MIN_DURATION, distance * SCROLL_DURATION_PER_PX));

const AnnouncementBar: React.FC = () => {
  const { announcementContent } = useBannerStore();
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [textWidth, setTextWidth] = useState(SCREEN_WIDTH);
  const hasMeasured = useRef(false);

  const offsetX = useSharedValue(SCREEN_WIDTH);
  const isTouching = useRef(false);

  const handleAnimationEnd = () => {
    if (loopCount >= MAX_LOOP - 1 && currentIndex === announcementContent.length - 1) {
      setVisible(false);
      return;
    }

    if (currentIndex === announcementContent.length - 1) {
      setLoopCount((c) => c + 1);
      setCurrentIndex(0);
    } else {
      setCurrentIndex((i) => i + 1);
    }

    hasMeasured.current = false;
  };

  const startAnimation = () => {
    if (!announcementContent.length || isTouching.current) return;

    offsetX.value = SCREEN_WIDTH;
    offsetX.value = withTiming(
      -textWidth,
      {
        duration: getDuration(textWidth + SCREEN_WIDTH),
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) runOnJS(handleAnimationEnd)();
      }
    );
  };

  useEffect(() => {
    if (!announcementContent.length) return;
    startAnimation();

    return () => cancelAnimation(offsetX);
  }, [currentIndex, announcementContent, loopCount, textWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const handlePressIn = () => {
    isTouching.current = true;
    cancelAnimation(offsetX);
  };

  const handlePressOut = () => {
    isTouching.current = false;
    const remainingWidth = Math.max(0, offsetX.value + textWidth);
    offsetX.value = withTiming(
      -textWidth,
      {
        duration: getDuration(remainingWidth),
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) runOnJS(handleAnimationEnd)();
      }
    );
  };

  if (!visible || !announcementContent.length) return null;

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={false}
    >
      <View style={styles.container}>
        <Animated.View style={[animatedStyle]}>
          <View style={[styles.scrollContent, { width: textWidth }]}>
            <Text
              style={styles.text}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {announcementContent[currentIndex]}
            </Text>
          </View>
        </Animated.View>

        {/* 用于测量真实宽度 */}
        <Text
          style={[styles.text, styles.hiddenText]}
          numberOfLines={1}
          onLayout={(e) => {
            if (!hasMeasured.current) {
              const measuredWidth = e.nativeEvent.layout.width + 32;
              setTextWidth(Math.max(measuredWidth, SCREEN_WIDTH));
              hasMeasured.current = true;
            }
          }}
        >
          {announcementContent[currentIndex]}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BAR_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFBEA',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5E1A4',
    position: 'relative',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    color: '#B8860B',
    includeFontPadding: false,
    textAlignVertical: 'center',
    flexShrink: 0,
    flexGrow: 0,
    flexWrap: 'nowrap',
  },
  hiddenText: {
    position: 'absolute',
    opacity: 0,
    paddingHorizontal: 16,
  },
});

export default AnnouncementBar;
