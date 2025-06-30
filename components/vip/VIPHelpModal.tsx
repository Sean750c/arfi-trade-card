import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';
import HtmlRenderer from '@/components/UI/HtmlRenderer';
import { useTheme } from '@/theme/ThemeContext';

interface VIPHelpModalProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  html: string;
  vipLevel: number;
  getVIPLevelGradient: (level: number) => [string, string];
}

const VIPHelpModal: React.FC<VIPHelpModalProps> = ({
  visible,
  onClose,
  loading,
  error,
  html,
  vipLevel,
  getVIPLevelGradient,
}) => {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, width: '100%', minHeight: 180 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <HelpCircle size={22} color={getVIPLevelGradient(vipLevel)[0]} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', flex: 1 }}>VIP Info</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: 12 }}>Loading...</Text>
            </View>
          ) : error ? (
            <Text style={{ color: colors.error, fontSize: 15, lineHeight: 22 }}>{error}</Text>
          ) : (
            <HtmlRenderer htmlContent={html} visible={true} onClose={onClose} title="VIP Info" />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default VIPHelpModal; 