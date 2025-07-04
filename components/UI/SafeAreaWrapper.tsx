import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatusBarHeight } from '@/utils/device';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: any;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  // 新增：是否强制添加Android状态栏高度
  forceAndroidStatusBar?: boolean;
}

export default function SafeAreaWrapper({ 
  children, 
  style, 
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  forceAndroidStatusBar = false
}: SafeAreaWrapperProps) {
  // 为Android设备添加额外的顶部padding
  const androidTopPadding = Platform.OS === 'android' && forceAndroidStatusBar ? getStatusBarHeight() : 0;
  
  return (
    <SafeAreaView 
      style={[
        styles.container,
        { 
          backgroundColor,
          paddingTop: androidTopPadding,
        },
        style
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 