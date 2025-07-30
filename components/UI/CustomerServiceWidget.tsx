import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomerServiceWidgetProps {
  visible: boolean;
  onClose: () => void;
}

export default function CustomerServiceWidget({ visible, onClose }: CustomerServiceWidgetProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>Customer Service</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: ${colors.background};
          color: ${colors.text};
          overflow-x: hidden;
          min-height: 100vh;
        }
        
        .container {
          width: 100%;
          height: 100vh;
          position: relative;
        }
        
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: ${colors.textSecondary};
          font-size: 16px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${colors.border};
          border-top: 3px solid ${colors.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Hide loading when script loads */
        .salesmartly-loaded .loading {
          display: none;
        }
        
        /* Ensure the widget takes full space */
        #salesmartly-widget {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
        
        /* Override any default positioning */
        .salesmartly-chat-widget {
          position: relative !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1 !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loading" id="loading">
          <div class="loading-spinner"></div>
          <div>Loading Customer Service...</div>
        </div>
        
        <script>
          // Hide loading when widget is ready
          function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) {
              loading.style.display = 'none';
            }
            document.body.classList.add('salesmartly-loaded');
          }
          
          // Load SalesSmartly script
          (function() {
            const script = document.createElement('script');
            script.src = 'https://plugin-code.salesmartly.com/js/project_8759_420104_1753865375.js';
            script.async = true;
            script.onload = function() {
              // Wait a bit for the widget to initialize
              setTimeout(hideLoading, 2000);
            };
            script.onerror = function() {
              const loading = document.getElementById('loading');
              if (loading) {
                loading.innerHTML = '<div>Failed to load customer service</div>';
              }
            };
            document.head.appendChild(script);
          })();
          
          // Fallback: hide loading after 5 seconds regardless
          setTimeout(hideLoading, 5000);
        </script>
      </div>
    </body>
    </html>
  `;

  const handleWebViewLoad = () => {
    setIsLoading(false);
  };

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
          source={{ html: htmlContent }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          bounces={false}
          scrollEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={() => true}
          userAgent={Platform.OS === 'ios' 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            : 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
          }
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
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.lg,
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