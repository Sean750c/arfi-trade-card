import React, { useState, useCallback } from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  lazy?: boolean;
}

export default function OptimizedImage({
  source,
  placeholder,
  fallback,
  lazy = true,
  style,
  ...props
}: OptimizedImageProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const defaultPlaceholder = (
    <View style={[styles.placeholder, { backgroundColor: colors.border }]}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );

  const defaultFallback = (
    <View style={[styles.placeholder, { backgroundColor: colors.border }]} />
  );

  if (error) {
    return fallback || defaultFallback;
  }

  return (
    <View style={style}>
      <Image
        {...props}
        source={source}
        style={[style, loading && styles.hidden]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        // Enable lazy loading for better performance
        resizeMode={props.resizeMode || 'cover'}
        // Add caching for better performance
        cache="force-cache"
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.placeholderContainer]}>
          {placeholder || defaultPlaceholder}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
});