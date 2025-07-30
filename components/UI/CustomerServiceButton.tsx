import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import CustomerServiceWidget from './CustomerServiceWidget';

interface CustomerServiceButtonProps {
  size?: number;
  style?: any;
}

export default function CustomerServiceButton({ 
  size = 56, 
  style 
}: CustomerServiceButtonProps) {
  const { colors } = useTheme();
  const [showWidget, setShowWidget] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          style,
        ]}
        onPress={() => setShowWidget(true)}
        activeOpacity={0.8}
      >
        <MessageCircle size={size * 0.4} color="#FFFFFF" />
      </TouchableOpacity>

      <CustomerServiceWidget
        visible={showWidget}
        onClose={() => setShowWidget(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});