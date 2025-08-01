import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { PopDataDetail } from '@/types/common';
import NavigationUtils from '@/utils/navigation';

interface PopupModalProps {
  visible: boolean;
  onClose: () => void;
  popData: PopDataDetail;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PopupModal({ visible, onClose, popData }: PopupModalProps) {
  const { colors } = useTheme();

  const handlePopupPress = async () => {
    try {
      const success = NavigationUtils.handlePopupNavigation(popData.jump_type, popData.url);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error handling popup press:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: `${colors.textSecondary}20` }]}
            onPress={onClose}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Popup Image */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handlePopupPress}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: popData.image }}
              style={styles.popupImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Optional: Add a subtle hint for interaction */}
          <View style={styles.hintContainer}>
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Tap image to {popData.jump_type === 1 ? 'continue' : 'learn more'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    borderRadius: 20,
    padding: Spacing.lg,
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    maxWidth: 300,
    maxHeight: 400,
    borderRadius: 12,
  },
  hintContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});