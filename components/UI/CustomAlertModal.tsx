import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { X, Info, CheckCircle, AlertTriangle, CircleAlert as AlertCircle } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import Button from './Button'; // Assuming you have a Button component

const { width: screenWidth } = Dimensions.get('window');

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
  onClose: () => void;
}

export default function CustomAlertModal({
  visible,
  title,
  message,
  buttons,
  onClose,
}: CustomAlertModalProps) {
  const { colors } = useTheme();

  const handleButtonPress = (buttonOnPress?: () => void) => {
    onClose(); // Close modal first
    if (buttonOnPress) {
      buttonOnPress();
    }
  };

  const getIcon = () => {
    // You can customize icons based on title or message content if needed
    // For simplicity, let's use a generic info icon or check for common keywords
    if (title.toLowerCase().includes('success') || message.toLowerCase().includes('successful')) {
      return <CheckCircle size={32} color={colors.success} />;
    }
    if (title.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
      return <AlertCircle size={32} color={colors.error} />;
    }
    if (title.toLowerCase().includes('warning') || message.toLowerCase().includes('confirm')) {
      return <AlertTriangle size={32} color={colors.warning} />;
    }
    return <Info size={32} color={colors.primary} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons && buttons.length > 0 ? (
              buttons.map((button, index) => (
                <Button
                  key={index}
                  title={button.text}
                  onPress={() => handleButtonPress(button.onPress)}
                  variant={
                    button.style === 'cancel'
                      ? 'outline'
                      : button.style === 'destructive'
                      ? 'primary' // You might want a specific destructive variant
                      : 'primary'
                  }
                  style={[
                    styles.button,
                    button.style === 'destructive' && { backgroundColor: colors.error },
                    button.style === 'cancel' && { borderColor: colors.border },
                  ]}
                  textStyle={button.style === 'cancel' && { color: colors.textSecondary } || undefined}
                  fullWidth={buttons.length === 1}
                />
              ))
            ) : (
              <Button
                title="OK"
                onPress={() => handleButtonPress()}
                fullWidth
              />
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
  },
});