import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import * as StoreReview from 'expo-store-review';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

interface RatingPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onRated: () => void;
}

export default function RatingPromptModal({
  visible,
  onClose,
  onRated,
}: RatingPromptModalProps) {
  const { colors } = useTheme();

  const handleRateNow = async () => {
    try {
      if (Platform.OS === 'web') {
        onClose();
        return;
      }

      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        const storeUrl = Platform.select({
          ios: 'https://apps.apple.com/app/id<YOUR_APP_ID>',
          android: 'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
        });

        if (storeUrl) {
          await Linking.openURL(storeUrl);
        }
      }

      onRated();
      onClose();
    } catch (error) {
      console.error('Error opening store review:', error);
      onClose();
    }
  };

  const handleMaybeLater = () => {
    onClose();
  };

  const handleNoThanks = () => {
    onRated();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.content, { backgroundColor: colors.card }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={colors.primary}
                  color={colors.primary}
                />
              ))}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Enjoying CardKing?
            </Text>

            <Text style={[styles.message, { color: colors.textSecondary }]}>
              Your feedback helps us improve and reach more users. Would you mind taking a moment to rate us?
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleRateNow}
              >
                <Text style={styles.primaryButtonText}>Rate Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={handleMaybeLater}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={handleNoThanks}
              >
                <Text style={[styles.textButtonText, { color: colors.textSecondary }]}>
                  No Thanks
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - 48,
    maxWidth: 400,
  },
  content: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 14,
  },
});
