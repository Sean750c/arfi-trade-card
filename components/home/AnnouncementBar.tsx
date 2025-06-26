import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, Text, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_HEIGHT = 32;
const ANNOUNCEMENT = '这是一条非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的公告，用于测试跑马灯效果。';

const AnnouncementBar: React.FC = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textWidth === 0) return;
    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textWidth]);

  const startAnimation = () => {
    scrollX.setValue(0);
    Animated.timing(scrollX, {
      toValue: textWidth,
      duration: ((textWidth + SCREEN_WIDTH) * 20),
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) startAnimation();
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.marqueeWrapper}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ width: textWidth > SCREEN_WIDTH ? textWidth : SCREEN_WIDTH }}
      >
        <Animated.View style={{ transform: [{ translateX: scrollX.interpolate({
          inputRange: [0, textWidth],
          outputRange: [0, -textWidth],
        }) }] }}>
          <Text
            style={styles.text}
            onLayout={e => {
              if (textWidth === 0) setTextWidth(e.nativeEvent.layout.width);
            }}
            numberOfLines={1}
          >
            {ANNOUNCEMENT}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFBEA',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5E1A4',
    position: 'relative',
  },
  marqueeWrapper: {
    width: SCREEN_WIDTH,
    height: BAR_HEIGHT,
    overflow: 'hidden',
  },
  text: {
    fontSize: 14,
    color: '#B8860B',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default AnnouncementBar;
