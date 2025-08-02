import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface SixDigitPasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
}

export default function SixDigitPasswordInput({
  value,
  onChangeText,
  label,
  error,
  placeholder = '••••••',
  editable = true,
  autoFocus = false,
}: SixDigitPasswordInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Focus the input when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handlePress = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChangeText = (text: string) => {
    // Only allow digits and limit to 6 characters
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    onChangeText(numericText);
  };

  const renderDigitBox = (index: number) => {
    const digit = value[index] || '';
    const isActive = focused && value.length === index;
    const isFilled = digit !== '';

    return (
      <View
        key={index}
        style={[
          styles.digitBox,
          {
            borderColor: error 
              ? colors.error 
              : isActive 
                ? colors.primary 
                : isFilled 
                  ? colors.success 
                  : colors.border,
            backgroundColor: isFilled 
              ? `${colors.primary}08` 
              : colors.card,
            shadowColor: isActive ? colors.primary : 'transparent',
          },
          isActive && styles.activeDigitBox,
          error && styles.errorDigitBox,
        ]}
      >
        <Text style={[
          styles.digitText,
          {
            color: isFilled ? colors.text : colors.textSecondary,
          },
        ]}>
          {isFilled ? '•' : (isActive ? '|' : '')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.digitContainer}>
          {Array.from({ length: 6 }, (_, index) => renderDigitBox(index))}
        </View>
        
        {/* Hidden TextInput for actual input handling */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry={false} // We handle masking with dots
          editable={editable}
          autoFocus={autoFocus}
          selectTextOnFocus={true}
          caretHidden={true}
        />
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
      
      <View style={styles.hintContainer}>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          Enter 6-digit numeric password
        </Text>
        <Text style={[styles.progressText, { color: colors.primary }]}>
          {value.length}/6
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  inputContainer: {
    alignItems: 'center',
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeDigitBox: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  errorDigitBox: {
    shadowColor: '#EF4444',
  },
  digitText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});