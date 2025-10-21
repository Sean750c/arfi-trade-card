import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Download, X, AlertTriangle, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { VersionCheckResult } from '@/types/version';
import { VersionService } from '@/services/version';

const { width } = Dimensions.get('window');

interface VersionUpdateModalProps {
  visible: boolean;
  versionCheckResult: VersionCheckResult;
  onClose: () => void;
  onUpdate: () => void;
}

export default function VersionUpdateModal({
  visible,
  versionCheckResult,
  onClose,
  onUpdate,
}: VersionUpdateModalProps) {
  const { colors } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const { updateType, canSkip, versionInfo } = versionCheckResult;

  if (!versionInfo) return null;

  const isForceUpdate = updateType === 'force' && !canSkip;

  const getUpdateTypeInfo = () => {
    switch (updateType) {
      case 'force':
        return {
          icon: AlertTriangle,
          iconColor: colors.error,
          title: 'Required Update',
          badge: 'REQUIRED',
          badgeColor: colors.error,
        };
      case 'recommend':
        return {
          icon: Sparkles,
          iconColor: colors.primary,
          title: 'Update Available',
          badge: 'RECOMMENDED',
          badgeColor: colors.primary,
        };
      default:
        return {
          icon: Download,
          iconColor: colors.primary,
          title: 'New Version Available',
          badge: 'OPTIONAL',
          badgeColor: colors.textSecondary,
        };
    }
  };

  const typeInfo = getUpdateTypeInfo();
  const Icon = typeInfo.icon;

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      const downloadUrl = VersionService.getDownloadUrl(versionInfo);

      if (downloadUrl) {
        const supported = await Linking.canOpenURL(downloadUrl);

        if (supported) {
          await Linking.openURL(downloadUrl);
          onUpdate();
        } else {
          console.error('Cannot open URL:', downloadUrl);
        }
      }
    } catch (error) {
      console.error('Error opening store:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.content, { backgroundColor: colors.card }]}>
            {canSkip && (
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.border }]}
                onPress={handleSkip}
              >
                <X size={16} color={colors.text} />
              </TouchableOpacity>
            )}

            <View style={[styles.iconContainer, { backgroundColor: `${typeInfo.iconColor}15` }]}>
              <Icon size={48} color={typeInfo.iconColor} />
            </View>

            <View style={[styles.badge, { backgroundColor: `${typeInfo.badgeColor}20` }]}>
              <Text style={[styles.badgeText, { color: typeInfo.badgeColor }]}>
                {typeInfo.badge}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {versionInfo.title || typeInfo.title}
            </Text>

            <View style={styles.versionContainer}>
              <View style={styles.versionBox}>
                <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>
                  Current
                </Text>
                <Text style={[styles.versionNumber, { color: colors.text }]}>
                  v{versionCheckResult.currentVersion}
                </Text>
              </View>

              <View style={styles.arrow}>
                <Text style={[styles.arrowText, { color: colors.textSecondary }]}>→</Text>
              </View>

              <View style={styles.versionBox}>
                <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>
                  Latest
                </Text>
                <Text style={[styles.versionNumber, { color: colors.primary }]}>
                  v{versionCheckResult.latestVersion}
                </Text>
              </View>
            </View>

            {versionInfo.description && (
              <ScrollView
                style={[styles.descriptionContainer, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.description, { color: colors.text }]}>
                  {versionInfo.description}
                </Text>
              </ScrollView>
            )}

            {isForceUpdate && (
              <View style={[styles.warningContainer, { backgroundColor: `${colors.error}15` }]}>
                <AlertTriangle size={16} color={colors.error} />
                <Text style={[styles.warningText, { color: colors.error }]}>
                  This update is required to continue using the app
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  {
                    backgroundColor: isForceUpdate ? colors.error : colors.primary,
                  },
                ]}
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Download size={20} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>
                      Update Now
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {canSkip && (
                <TouchableOpacity
                  style={[styles.skipButton, { borderColor: colors.border }]}
                  onPress={handleSkip}
                >
                  <Text style={[styles.skipButtonText, { color: colors.text }]}>
                    {updateType === 'recommend' ? 'Remind Me Later' : 'Skip'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - 48,
    maxWidth: 420,
  },
  content: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  versionBox: {
    alignItems: 'center',
    flex: 1,
  },
  versionLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  versionNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  arrow: {
    marginHorizontal: Spacing.md,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    maxHeight: 150,
    width: '100%',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  warningText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: 12,
    minHeight: 52,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
