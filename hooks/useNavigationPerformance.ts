import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { PerformanceMonitor } from '@/utils/performance';

export function useNavigationPerformance(screenName: string) {
  const startTimeRef = useRef<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  // Track when navigation starts
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Track when screen is focused (navigation complete)
  useFocusEffect(() => {
    if (startTimeRef.current > 0) {
      monitor.trackNavigation(screenName, startTimeRef.current);
      startTimeRef.current = 0; // Reset to avoid duplicate tracking
    }
    
    // Track memory usage when screen becomes active
    monitor.trackMemoryUsage();
  });

  return {
    getNavigationReport: () => monitor.getNavigationReport(),
    getMemoryStats: () => monitor.getMemoryStats(),
  };
}