import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { Volume2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCROLL_SPEED = 40; // 每秒滚动40像素
const MAX_LOOP = 3;
const BAR_HEIGHT = 32;
const MIN_DURATION = 3000;
const MAX_DURATION = 30000;

const AnnouncementBar: React.FC = () => {
    const { colors } = useTheme();
    const { announcementContent = [] } = useBannerStore();
    const [visible, setVisible] = useState(true);
    const [textWidth, setTextWidth] = useState(SCREEN_WIDTH);
    const hasMeasured = useRef(false);

    const offsetX = useSharedValue(SCREEN_WIDTH);
    const isUserTouching = useRef(false);

    // 合并所有公告内容
    const mergedContent = announcementContent.map((msg, idx) => `${idx + 1}. ${msg}`).join('        ');

    const getDuration = useCallback((distance: number) =>
        Math.max(MIN_DURATION, Math.min(MAX_DURATION, (distance / SCROLL_SPEED) * 1000)),
        []
    );

    const startAnimation = useCallback(() => {
        if (!mergedContent.length || isUserTouching.current) return;
        offsetX.value = 0;
        offsetX.value = withTiming(
            -textWidth,
            {
                duration: getDuration(textWidth),
                easing: Easing.linear,
            },
            (finished) => {
                if (finished) {
                    offsetX.value = 0; // 立即重置
                    runOnJS(startAnimation)();
                }
            }
        );
    }, [mergedContent.length, getDuration, textWidth, offsetX, isUserTouching]);

    useEffect(() => {
        hasMeasured.current = false;
    }, [mergedContent]);

    useEffect(() => {
        if (!mergedContent.length) return;
        startAnimation();
        return () => cancelAnimation(offsetX);
    }, [mergedContent, textWidth, startAnimation, offsetX]);

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

    if (!visible || !mergedContent.length) return null;

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessible={false}
        >
            <View style={[styles.container, { backgroundColor: `${colors.primary}15` }]}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Volume2 size={16} color={colors.primary} />
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
        borderBottomWidth: 0,
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        paddingHorizontal: Spacing.xs,
        backgroundColor: 'rgba(255, 251, 234, 0.92)',
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
        fontSize: 15,
        color: '#B8860B',
        includeFontPadding: false,
        textAlignVertical: 'center',
        flexShrink: 0,
        flexGrow: 0,
        flexWrap: 'nowrap',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    hiddenText: {
        position: 'absolute',
        opacity: 0,
        paddingHorizontal: 16,
    },
});

export default AnnouncementBar;
