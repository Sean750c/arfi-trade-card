import React, { useState, useRef, useMemo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  PanResponderInstance,
  Animated,
  View
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import CustomerServiceWidget from './CustomerServiceWidget';

interface CustomerServiceButtonProps {
  size?: number;
  style?: any;
  draggable?: boolean;
  opacity?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CustomerServiceButton({
  size = 50,
  style,
  draggable = true,
  opacity = 0.8
}: CustomerServiceButtonProps) {
  const { colors } = useTheme();
  const [showWidget, setShowWidget] = useState(false);


  // 拖动相关状态
  const [buttonPosition, setButtonPosition] = useState({
    x: screenWidth - size / 2,
    y: screenHeight - 200,
  });

  const pan = useRef(new Animated.ValueXY({
    x: screenWidth - size / 2,
    y: screenHeight - 200,
  })).current;

  // 创建PanResponder用于拖动
  const panResponder: PanResponderInstance | undefined = useMemo(() => {
    if (!draggable) return undefined;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });

        // 如果按钮只露一半，自动展开到完全显示
        const currentX = (pan.x as any)._value;
        if (currentX > screenWidth - size / 2 - 5) {
          Animated.spring(pan, {
            toValue: { x: screenWidth - size - 20, y: (pan.y as any)._value },
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();

        // 获取当前位置
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        // 边界约束
        const margin = 20;
        const bottomSafeMargin = 100; // 👈 限制底部最小距离
        const constrainedX = Math.max(margin, Math.min(screenWidth - size - margin, currentX));
        const constrainedY = Math.max(margin, Math.min(screenHeight - size - bottomSafeMargin, currentY));

        // 更新位置状态
        setButtonPosition({
          x: constrainedX,
          y: constrainedY,
        });

        // 动画到约束位置
        Animated.spring(pan, {
          toValue: {
            x: screenWidth - size / 2, // 👈 重新收起
            y: constrainedY,
          },
          useNativeDriver: false,
        }).start();
      },
    });
  }, [draggable, pan, size, screenWidth, screenHeight]);

  const buttonStyle = draggable ? {
    position: 'absolute' as const,
    transform: pan.getTranslateTransform(),
  } : {};

  return (
    <>
      <Animated.View
        style={[
          buttonStyle,
          !draggable && style,
        ]}
        {...(draggable && panResponder ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              opacity: opacity,
            },
            !draggable && style,
          ]}
          onPress={() => setShowWidget(true)}
          activeOpacity={0.8}
        >
          <MessageCircle size={size * 0.4} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <CustomerServiceWidget
        visible={showWidget}
        onClose={() => setShowWidget(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});