import React from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';
import Header from '@/components/UI/Header';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import NotificationPermissionCard from '@/components/notifications/NotificationPermissionCard';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header 
        title="Notification Settings"
        subtitle="Manage your notification preferences"
      />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <NotificationPermissionCard />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

});