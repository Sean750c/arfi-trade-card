import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Info, Gift } from 'lucide-react-native';

interface VIPStatusCardProps {
  vipLevel: number;
  vipLevelName: string;
  currentLevelRate: number;
  vipExp: number;
  nextLevel?: { level: number } | null;
  nextExp: number;
  totalBonus: number;
  totalBonusUSDT: number;
  currencySymbol: string;
  getVIPLevelGradient: (level: number) => [string, string];
  progressAnim: Animated.Value;
  onShowLevelsModal: () => void;
  onRebatePress: () => void;
}

const VIPStatusCard: React.FC<VIPStatusCardProps> = ({
  vipLevel,
  vipLevelName,
  currentLevelRate,
  vipExp,
  nextLevel,
  nextExp,
  totalBonus,
  totalBonusUSDT,
  currencySymbol,
  getVIPLevelGradient,
  progressAnim,
  onShowLevelsModal,
  onRebatePress,
}) => {
  return (
    <LinearGradient
      colors={getVIPLevelGradient(vipLevel)}
      style={{
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        shadowColor: getVIPLevelGradient(vipLevel)[0],
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 12,
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Crown size={40} color="#fff" />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 }}>VIP {vipLevel}</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', opacity: 0.9 }}>{vipLevelName}</Text>
        </View>
        <TouchableOpacity
          style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 6 }}
          onPress={onShowLevelsModal}
        >
          <Info size={18} color={'#fff'} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 12 }}>+{currentLevelRate}% Rate Bonus</Text>
        <Text style={{ color: '#fff', fontSize: 15 }}>{vipExp.toLocaleString()} EXP</Text>
      </View>
      {nextLevel && (
        <View style={{ marginBottom: 8 }}>
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View style={{
              height: '100%',
              width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: '#fff',
              shadowColor: '#fff',
              shadowOpacity: 0.5,
              shadowRadius: 8,
            }} />
          </View>
          <Text style={{ color: '#fff', fontSize: 13, marginTop: 2 }}>{nextExp.toLocaleString()} to next</Text>
        </View>
      )}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        activeOpacity={0.8}
        onPress={onRebatePress}
      >
        <Gift size={14} color="#FFD700" style={{ marginRight: 5 }} />
        <Text style={{ color: '#fff', fontSize: 13, marginRight: 40 }}>{currencySymbol}{totalBonus.toLocaleString()}</Text>
        <Gift size={14} color="#26C6DA" style={{ marginRight: 5 }} />
        <Text style={{ color: '#fff', fontSize: 13 }}>USDT {totalBonusUSDT?.toLocaleString?.() ?? '0'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default VIPStatusCard; 