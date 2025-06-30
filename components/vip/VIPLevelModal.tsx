import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { X, Crown } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface VIPLevelModalProps {
  visible: boolean;
  onClose: () => void;
  vipInfo: any[];
  currentVIPLevel: number;
  getVIPLevelColor: (level: number) => string;
}

const VIPLevelModal: React.FC<VIPLevelModalProps> = ({ visible, onClose, vipInfo, currentVIPLevel, getVIPLevelColor }) => {
  const { colors } = useTheme();

  const renderVIPLevelCard = ({ item: level }: { item: any }) => {
    const isCurrentLevel = level.level === currentVIPLevel;
    const isUnlocked = level.level <= currentVIPLevel;
    const levelColor = getVIPLevelColor(level.level);
    return (
      <View style={{
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        position: 'relative',
        backgroundColor: isCurrentLevel ? `${levelColor}22` : colors.card,
        shadowColor: isCurrentLevel ? levelColor : 'transparent',
        shadowOpacity: isCurrentLevel ? 0.15 : 0,
        shadowRadius: isCurrentLevel ? 8 : 0,
        elevation: isCurrentLevel ? 4 : 2,
        borderWidth: isCurrentLevel ? 2.5 : 1,
        borderColor: isCurrentLevel ? levelColor : colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${levelColor}22`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Crown size={24} color={levelColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: levelColor, fontSize: 18, fontWeight: 'bold' }}>VIP {level.level}</Text>
            <Text style={{ color: levelColor, fontWeight: 'bold', fontSize: 13 }}>{level.name || ''}</Text>
          </View>
          {isCurrentLevel && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: levelColor, shadowColor: levelColor, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Current</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Rate Bonus</Text>
            <Text style={{ fontSize: 16, color: levelColor, fontWeight: 'bold' }}>+{level.rate}%</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Required EXP</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }}>{level.exp?.toLocaleString?.() ?? ''}</Text>
          </View>
        </View>
        {!isUnlocked && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 'bold' }}>Locked</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, width: '100%', maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', flex: 1 }}>VIP Levels</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={vipInfo}
            keyExtractor={(item) => item.level.toString()}
            renderItem={renderVIPLevelCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default VIPLevelModal; 