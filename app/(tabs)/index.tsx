import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import PromoBanner from '@/components/home/PromoBanner';
import QuickActions from '@/components/home/QuickActions';
import RecentTransactions from '@/components/home/RecentTransactions';
import PromoTimer from '@/components/home/PromoTimer';
import { useCountryStore } from '@/stores/useCountryStore'; // 新增导入
import { Country } from '@/types/api';

// 删除模拟的国家数据
// const countries = [
//   { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
//   { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
//   { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
// ];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  // 从 useCountryStore 中获取数据
  const { countries, selectedCountry, setSelectedCountry: setStoreSelectedCountry } = useCountryStore(); 

  const handleCountrySelect = (country: Country) => {
    setStoreSelectedCountry(country); // 使用 store 中的方法更新选中国家
    setShowCountryPicker(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <TouchableOpacity
              style={[styles.countrySelector, { backgroundColor: `${colors.primary}10` }]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={styles.countryInfoContainer}>
                <Image source={{ uri: selectedCountry?.image }} style={styles.flagImage} resizeMode="cover"/>
                <Text style={[styles.countryText, { color: colors.text }]}>
                  {selectedCountry?.name}
                </Text>
              </Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
            {showCountryPicker && (
              <View style={[styles.countryDropdown, { backgroundColor: colors.card }]}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={styles.countryInfoContainer}>
                      <Image source={{ uri: country.image }} style={styles.flagImage} resizeMode="cover"/>
                      <Text style={[styles.countryOptionText, { color: colors.text }]}>
                        {country.name}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: `${colors.primary}10` }]}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color={colors.primary} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <PromoBanner />
        <QuickActions />
        <PromoTimer />
        <RecentTransactions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  countryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center', // 确保图标和文本垂直居中对齐
    marginRight: Spacing.xs,
  },
  flagImage: {
    width: 20,
    height: 20,
    borderRadius: 12,
    marginRight: 10,
    alignSelf: 'center', // 确保图标自身垂直居中
  },
  countryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    alignSelf: 'center', // 确保文本自身垂直居中
  },
  countryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    alignSelf: 'center', // 确保下拉选项中的文本垂直居中
  },
  countryDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  countryOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});