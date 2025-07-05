// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 缓存函数结果
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 检查是否需要刷新数据（基于时间间隔）
export function shouldRefreshData(lastRefreshTime: number, intervalMs: number = 30000): boolean {
  return Date.now() - lastRefreshTime > intervalMs;
}

// 优化列表渲染的性能
export function getItemLayout(height: number) {
  return (data: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  });
}

// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // 只保留最近10次的数据
      const data = this.metrics.get(label)!;
      if (data.length > 10) {
        data.shift();
      }
      
      // 如果性能太差，输出警告
      if (duration > 100) {
        console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(label: string): number {
    const data = this.metrics.get(label);
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, time) => sum + time, 0) / data.length;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// 优化动画性能的工具
export const AnimationOptimizer = {
  // 检查设备性能，决定是否启用复杂动画
  shouldUseComplexAnimations(): boolean {
    // 可以根据设备性能或用户设置来决定
    return true; // 暂时默认启用
  },

  // 获取优化的动画配置
  getOptimizedAnimationConfig() {
    return {
      duration: 300, // 减少动画时长
      delay: 20, // 减少延迟
      useNativeDriver: true, // 使用原生驱动
    };
  },

  // 批量处理动画，避免同时执行太多动画
  batchAnimations(animations: (() => void)[], delay: number = 50) {
    animations.forEach((animation, index) => {
      setTimeout(animation, index * delay);
    });
  },
};

// 内存管理工具
export const MemoryManager = {
  // 清理不必要的缓存
  clearCaches(): void {
    // 可以在这里清理各种缓存
    console.log('Clearing caches...');
  },

  // 检查内存使用情况
  checkMemoryUsage(): void {
    if (__DEV__) {
      console.log('Memory usage check...');
    }
  },
}; 