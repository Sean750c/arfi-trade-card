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
import { LinearGradient } from 'expo-linear-gradient';
import { Download, X, AlertTriangle, Sparkles, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { VersionCheckResult } from '@/types/version';
import { VersionService } from '@/services/version';

const { width, height } = Dimensions.get('window');

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
          gradientColors: ['#FF3B30', '#FF6B5E'],
          iconBgColors: ['#FF3B3020', '#FF6B5E30'],
          title: 'Update Required',
          badge: 'REQUIRED',
          badgeColors: ['#FF3B30', '#FF6B5E'],
        };
      case 'recommend':
        return {
          icon: Sparkles,
          gradientColors: [colors.primary, colors.primary + 'CC'],
          iconBgColors: [colors.primary + '20', colors.primary + '30'],
          title: 'Update Available',
          badge: 'RECOMMENDED',
          badgeColors: [colors.primary, colors.primary + 'CC'],
        };
      default:
        return {
          icon: Download,
          gradientColors: [colors.primary, colors.primary + 'CC'],
          iconBgColors: [colors.primary + '15', colors.primary + '25'],
          title: 'New Version',
          badge: 'OPTIONAL',
          badgeColors: [colors.textSecondary, colors.textSecondary + 'CC'],
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

  const parseDescription = (description: string) => {
    return description.split('\\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      const isListItem = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');

      return (
        <View key={index} style={styles.descriptionLine}>
          {isListItem && (
            <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]}>
              <CheckCircle size={12} color="#FFFFFF" />
            </View>
          )}
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {trimmedLine.replace(/^[•\-]\s*/, '')}
          </Text>
        </View>
      );
    }).filter(Boolean);
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
                style={[styles.closeButton, { backgroundColor: colors.background }]}
                onPress={handleSkip}
              >
                <X size={18} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            <LinearGradient
              colors={typeInfo.iconBgColors as [string, string]}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconInner}>
                <Icon size={30} color={typeInfo.gradientColors[0]} strokeWidth={2} />
              </View>
            </LinearGradient>

            <LinearGradient
              colors={typeInfo.badgeColors as [string, string]}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.badgeText}>{typeInfo.badge}</Text>
            </LinearGradient>

            <Text style={[styles.title, { color: colors.text }]}>
              {versionInfo.title || typeInfo.title}
            </Text>

            <View style={styles.versionContainer}>
              <View style={[styles.versionBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>
                  Current
                </Text>
                <Text style={[styles.versionNumber, { color: colors.text }]}>
                  {versionCheckResult.currentVersion}
                </Text>
              </View>

              <View style={styles.arrowContainer}>
                <ChevronRight size={24} color={colors.primary} strokeWidth={3} />
              </View>

              <View style={[styles.versionBox, {
                backgroundColor: colors.primary + '15',
                borderWidth: 2,
                borderColor: colors.primary + '30',
              }]}>
                <Text style={[styles.versionLabel, { color: colors.primary }]}>
                  Latest
                </Text>
                <Text style={[styles.versionNumber, { color: colors.primary, fontWeight: '700' }]}>
                  {versionCheckResult.latestVersion}
                </Text>
              </View>
            </View>

            {versionInfo.description && (
              <ScrollView
                style={[styles.descriptionContainer, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  What's New
                </Text>
                {parseDescription(versionInfo.description)}
              </ScrollView>
            )}

            {isForceUpdate && (
              <View style={styles.warningContainer}>
                <LinearGradient
                  colors={['#FF3B3015', '#FF6B5E15']}
                  style={styles.warningGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.warningContent}>
                    <View style={[styles.warningIcon, { backgroundColor: '#FF3B30' }]}>
                      <AlertTriangle size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.warningText, { color: '#FF3B30' }]}>
                      This update is required to continue
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.updateButtonWrapper}
                onPress={handleUpdate}
                disabled={isUpdating}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={isForceUpdate ? ['#FF3B30', '#FF6B5E'] : [colors.primary, colors.primary + 'DD']}
                  style={styles.updateButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Download size={22} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.updateButtonText}>Update Now</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {canSkip && (
                <TouchableOpacity
                  style={[styles.skipButton, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }]}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                    {updateType === 'recommend' ? 'Remind Me Later' : 'Skip for Now'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - 40,
    maxWidth: 440,
  },
  content: {
    borderRadius: 24,
    padding: Spacing.xl + 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconInner: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  versionBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
  },
  versionLabel: {
    fontSize: 11,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  arrowContainer: {
    marginHorizontal: Spacing.sm,
  },
  descriptionContainer: {
    maxHeight: 180,
    width: '100%',
    borderRadius: 16,
    padding: Spacing.lg,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  descriptionLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  bulletPoint: {
    width: 18,
    height: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  warningContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
    borderRadius: 14,
    overflow: 'hidden',
  },
  warningGradient: {
    padding: Spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF3B3025',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  updateButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    minHeight: 52,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
