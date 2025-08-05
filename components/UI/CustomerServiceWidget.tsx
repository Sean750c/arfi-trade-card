import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface CustomerServiceWidgetProps {
  visible: boolean;
  onClose: () => void;
}

export default function CustomerServiceWidget({ visible, onClose }: CustomerServiceWidgetProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <MessageCircle size={24} color={colors.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Service</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                We're here to help
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={onClose}
          >
            <X size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: "https://chat.ssrchat.com/service/gyf6uh" }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          startInLoadingState={true}
          renderError={(errorName) => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'red', fontSize: 16 }}>Loading error, please check network.</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});