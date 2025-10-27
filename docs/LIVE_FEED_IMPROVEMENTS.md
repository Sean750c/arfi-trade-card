# LiveFeedCarousel 改进说明

## 修改内容

### 1. 支持手动切换 ⬅️➡️

**问题**: 用户无法快速切换内容，只能等待自动轮播。

**解决方案**: 添加左右箭头按钮。

#### 视觉效果
```
┌─────────────────────────────────────┐
│ [LIVE] ●●○○○  ⬅️ ➡️              │
│─────────────────────────────────────│
│  ✓ John *** sold $50           2m  │
└─────────────────────────────────────┘
```

#### 功能特点
- **左箭头**: 切换到上一项
- **右箭头**: 切换到下一项
- **自动重置**: 手动切换后，自动轮播继续
- **条件显示**: 仅当有多于1项内容时显示

---

### 2. 每次进入首页重新获取数据 🔄

**问题**: 数据只在首次加载时获取，返回首页看到的是旧数据。

**解决方案**: 使用 `useFocusEffect` 钩子。

#### 实现方式
```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  React.useCallback(() => {
    if (user?.token) {
      fetchLiveContentList(countryId);
    }
  }, [user?.token, fetchLiveContentList])
);
```

---

## 技术细节

### 手动切换实现

#### 统一动画函数
```typescript
const animateTransition = (callback: () => void) => {
  Animated.sequence([
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0 }),
      Animated.timing(slideAnim, { toValue: -30 }),
    ]),
    Animated.timing(slideAnim, { toValue: 30, duration: 0 }),
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1 }),
      Animated.timing(slideAnim, { toValue: 0 }),
    ]),
  ]).start(callback);
};
```

#### 手动切换函数
```typescript
const handleNext = () => {
  clearInterval(intervalRef.current);
  animateTransition(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  });
  intervalRef.current = setInterval(...);
};
```

---

## 用户体验改进

### 手动切换
- ✅ 用户可快速浏览所有内容
- ✅ 循环切换，永不到头
- ✅ 手动切换后自动轮播继续
- ✅ 箭头按钮有扩展点击区域

### 数据刷新
- ✅ 每次进入首页获取最新数据
- ✅ 无感知自动刷新
- ✅ 仅在标签页激活时请求
- ✅ 避免重复请求

---

## 文件修改

**修改文件**: `components/home/LiveFeedCarousel.tsx`

**新增导入**:
- `ChevronLeft` from lucide-react-native
- `useFocusEffect` from @react-navigation/native

**新增功能**:
- `animateTransition()` - 统一动画逻辑
- `handlePrevious()` - 切换到上一项
- `handleNext()` - 切换到下一项
- `intervalRef` - 定时器引用

**修改逻辑**:
- 从 `useEffect` 改为 `useFocusEffect`
- 添加左右箭头按钮
- 条件渲染箭头（仅多项时）

---

## 总结

### 改进要点
1. ✅ **手动切换**: 左右箭头按钮
2. ✅ **数据刷新**: useFocusEffect 钩子

### 用户价值
- 更快速的内容浏览
- 更新鲜的数据展示
- 更好的交互体验
- 更清晰的视觉反馈

所有改进已完成并可立即使用！
