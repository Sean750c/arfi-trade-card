import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
    cancelAnimation,
    withRepeat,
} from 'react-native-reanimated';
import { useBannerStore } from '@/stores/useBannerStore';
import { Volume2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCROLL_SPEED = 30; // 降低滚动速度，减少性能消耗
const MAX_LOOP = 2; // 减少循环次数
const BAR_HEIGHT = 32;

const AnnouncementBar: React.FC = () => {
    const { colors } = useTheme();
    const { announcementContent = [] } = useBannerStore();
    const [visible, setVisible] = useState(true);
    const [textWidth, setTextWidth] = useState(SCREEN_WIDTH);
    const hasMeasured = useRef(false);
    const [loopCount, setLoopCount] = useState(0);

    const offsetX = useSharedValue(SCREEN_WIDTH);
    const isUserTouching = useRef(false);

    // 合并所有公告内容
    const mergedContent = announcementContent.map((msg, idx) => `${idx + 1}. ${msg}`).join('        ');

    // duration 只与 SCROLL_SPEED 有关，文本长短速度一致
    const getDuration = useCallback((distance: number) =>
        (distance / SCROLL_SPEED) * 1000,
        []
    );

    const setLoopCountToNext = useCallback(() => {
        setLoopCount(prev => prev + 1);
    }, []);

    const startAnimation = useCallback(() => {
        if (!mergedContent.length || isUserTouching.current) return;
        if (loopCount >= MAX_LOOP) {
            cancelAnimation(offsetX);
            setVisible(false);
            return;
        }
        offsetX.value = 0;
        offsetX.value = withTiming(
            -textWidth,
            {
                duration: getDuration(textWidth),
                easing: Easing.linear,
            },
            (finished) => {
                if (finished) {
                    runOnJS(setLoopCountToNext)();
                    offsetX.value = 0;
                    runOnJS(startAnimation)();
                }
            }
        );
    }, [mergedContent.length, getDuration, textWidth, offsetX, isUserTouching, MAX_LOOP, loopCount, setLoopCountToNext]);

    useEffect(() => {
        hasMeasured.current = false;
        setLoopCount(0);
    }, [mergedContent]);

    useEffect(() => {
        if (!mergedContent.length) return;
        // 延迟启动动画，避免页面加载时的性能问题
        const timer = setTimeout(() => {
            startAnimation();
        }, 1000);
        return () => {
            clearTimeout(timer);
            cancelAnimation(offsetX);
        };
    }, [mergedContent, textWidth, startAnimation, offsetX]);

    useEffect(() => {
        if (loopCount >= MAX_LOOP) {
            cancelAnimation(offsetX);
            setVisible(false);
        } else {
            setVisible(true);
        }
    }, [loopCount, offsetX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: offsetX.value }],
    }));

    const handlePressIn = useCallback(() => {
        isUserTouching.current = true;
        cancelAnimation(offsetX);
    }, [offsetX]);

    const handlePressOut = useCallback(() => {
        isUserTouching.current = false;
        const remainingWidth = Math.max(0, offsetX.value + textWidth);
        if (offsetX.value > -textWidth) {
            offsetX.value = withTiming(
                -textWidth,
                {
                    duration: getDuration(remainingWidth),
                    easing: Easing.linear,
                },
                (finished) => {
                    if (finished) runOnJS(startAnimation)();
                }
            );
        }
    }, [offsetX, textWidth, getDuration, startAnimation]);

    // 简化声波动画，减少性能消耗
    const waveAnim = useSharedValue(0);
    useEffect(() => {
        waveAnim.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }), // 增加动画时长，减少频率
            -1,
            false
        );
    }, [waveAnim]);
    const waveStyle = useAnimatedStyle(() => ({
        opacity: 1 - waveAnim.value,
        transform: [{ scale: 1 + waveAnim.value * 0.3 }], // 减少缩放幅度
    }));

    if (!visible || !mergedContent.length) return null;

    return (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={[styles.container, { backgroundColor: `#FFFBEA` }]}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Animated.View style={[waveStyle, { borderColor: `${colors.primary}80` }]}>
                        <Volume2 size={16} color={colors.primary} />
                    </Animated.View>
                </View>
                <View style={styles.textContainer}>
                    <Animated.View style={[animatedStyle, { flexDirection: 'row' }]}>
                        <View style={[styles.scrollContent, { width: textWidth }]}>
                            <Text style={styles.text} >
                                {mergedContent}
                            </Text>
                        </View>
                        <View style={[styles.scrollContent, { width: textWidth }]}>
                            <Text style={styles.text} >
                                {mergedContent}
                            </Text>
                        </View>
                    </Animated.View>
                </View>

                {/* 用于测量真实宽度 */}
                <Text
                    style={[styles.text, styles.hiddenText]}
                    numberOfLines={1}
                    onLayout={(e) => {
                        if (!hasMeasured.current) {
                            const measuredWidth = e.nativeEvent.layout.width + Spacing.md;
                            setTextWidth(Math.max(measuredWidth, SCREEN_WIDTH));
                            hasMeasured.current = true;
                        }
                    }}
                >
                    {mergedContent}
                </Text>
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
        borderWidth: 1,
        borderColor: '#E5E7EB', // 默认灰色，运行时用colors.border覆盖
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        paddingHorizontal: Spacing.xs,
        backgroundColor: '#FFFBEA', // 默认亮黄，运行时可被覆盖
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: Spacing.xs
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
        zIndex: 2,
        backgroundColor: 'rgba(255, 215, 0, 0.18)',
    },
    textContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
        alignItems: 'center',
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 14,
        color: '#B8860B',
        fontWeight: '500',
        letterSpacing: 0.2,
        ...(
            Platform.OS === 'web'
                ? {
                    whiteSpace: 'nowrap',
                    minWidth: 10,
                  }
                : {
                    flexShrink: 0,
                    flexGrow: 0,
                  }
        ),
    },
    hiddenText: {
        position: 'absolute',
        opacity: 0,
        paddingHorizontal: 16,
        ...(
            Platform.OS === 'web'
                ? {
                    whiteSpace: 'nowrap',
                    minWidth: 10,
                  }
                : {}
        ),
    },
});

export default AnnouncementBar;
