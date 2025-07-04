import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface HtmlRendererProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function HtmlRenderer({
  visible,
  onClose,
  title,
  htmlContent,
}: HtmlRendererProps) {
  const { colors } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);

  // Create HTML with proper styling
  const createStyledHtml = (content: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: ${colors.text};
              background-color: ${colors.card};
              margin: 0;
              padding: 16px;
              word-wrap: break-word;
            }
            p {
              margin: 0 0 16px 0;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 16px 0 8px 0;
              font-weight: 600;
            }
            ul, ol {
              margin: 16px 0;
              padding-left: 24px;
            }
            li {
              margin: 8px 0;
            }
            strong, b {
              font-weight: 600;
            }
            em, i {
              font-style: italic;
            }
            a {
              color: ${colors.primary};
              text-decoration: none;
            }
            blockquote {
              margin: 16px 0;
              padding: 12px 16px;
              border-left: 4px solid ${colors.primary};
              background-color: ${colors.background};
            }
            code {
              background-color: ${colors.background};
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            pre {
              background-color: ${colors.background};
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 16px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid ${colors.border};
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: ${colors.background};
              font-weight: 600;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 16px 0;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  };

  // Calculate modal height based on content
  const calculateModalHeight = () => {
    const headerHeight = 80; // Header height including padding
    const padding = Spacing.lg * 2; // Top and bottom padding
    const minHeight = 300; // Minimum height in pixels
    const maxHeight = screenHeight * 0.8; // Maximum 80% of screen height
    
    // For WebView, we'll use a fixed height since content will scroll internally
    return Math.max(minHeight, Math.min(500, maxHeight));
  };

  const modalHeight = calculateModalHeight();

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'contentHeight') {
        setContentHeight(data.height);
      }
    } catch (error) {
      console.log('WebView message error:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      const body = document.body;
      const height = body.scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'contentHeight',
        height: height
      }));
    })();
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent, 
          { 
            backgroundColor: colors.card,
            height: modalHeight,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <WebView
            source={{ html: createStyledHtml(htmlContent) }}
            style={styles.webView}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            onMessage={handleWebViewMessage}
            injectedJavaScript={injectedJavaScript}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            bounces={false}
            automaticallyAdjustContentInsets={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    marginHorizontal: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: 16,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
}); 