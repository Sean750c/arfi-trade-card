import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { CircleAlert as AlertCircle } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  rightElement,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }, labelStyle]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          {...props}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.xs,
    fontFamily: 'Inter-Medium',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    width: '100%',
    fontFamily: 'Inter-Regular',
  },
  rightElement: {
    position: 'absolute',
    right: Spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
});