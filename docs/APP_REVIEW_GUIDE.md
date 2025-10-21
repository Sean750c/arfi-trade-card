# 应用内评分功能使用指南

## 概述

应用内评分功能已集成到应用中，完全符合 Apple App Store 和 Google Play Store 的评分政策。

## 核心规则（符合应用商店要求）

### Apple App Store 规则
- ✅ 每年最多请求评分 **3 次**（由系统自动限制）
- ✅ 使用原生 SKStoreReviewController（`expo-store-review`）
- ✅ 不能使用自定义 UI 替代系统评分界面
- ✅ 用户可以在设置中完全禁用评分请求
- ✅ 不得强迫或诱导用户评分

### Google Play Store 规则
- ✅ 使用 Google Play In-App Review API
- ✅ 不能在用户完成特定操作后立即弹出评分
- ✅ 不能承诺奖励以换取好评
- ✅ 用户可以关闭评分请求

## 实现的触发策略

系统会在满足以下**所有条件**时请求评分：

1. **应用启动次数** ≥ 10 次
2. **安装天数** ≥ 7 天
3. **重要事件完成** ≥ 3 次（如：成功交易、完成订单等）
4. **冷却期**：距离上次请求至少 90 天
5. **未永久关闭**：用户未选择"不再提醒"

## 使用方法

### 1. 基本使用 - 直接请求评分

在任何组件中使用 `useAppReview` hook：

```typescript
import { useAppReview } from '@/hooks/useAppReview';

function MyComponent() {
  const { requestReview } = useAppReview();

  const handleSuccess = async () => {
    // 在用户完成重要操作后调用
    await requestReview();
  };

  return <Button onPress={handleSuccess} title="Complete" />;
}
```

### 2. 记录重要事件后请求评分

```typescript
import { useAppReview } from '@/hooks/useAppReview';

function OrderSuccessScreen() {
  const { requestReviewAfterEvent } = useAppReview();

  useEffect(() => {
    // 订单成功后记录事件并检查是否显示评分
    requestReviewAfterEvent();
  }, []);

  return <View>...</View>;
}
```

### 3. 使用自定义提示弹窗（推荐）

自定义弹窗会先询问用户是否愿意评分，然后再调用系统评分界面：

```typescript
import { useReviewStore } from '@/stores/useReviewStore';
import { useAppReview } from '@/hooks/useAppReview';

function MyScreen() {
  const { setShowRatingPrompt } = useReviewStore();
  const { shouldRequestReview } = useAppReview();

  const handleSuccessfulTransaction = async () => {
    // 检查是否应该显示评分请求
    const shouldShow = await shouldRequestReview();
    if (shouldShow) {
      setShowRatingPrompt(true);
    }
  };

  return <Button onPress={handleSuccessfulTransaction} title="Submit" />;
}
```

### 4. 仅记录重要事件（不立即请求）

```typescript
import { useAppReview } from '@/hooks/useAppReview';

function CheckoutScreen() {
  const { recordSignificantEvent } = useAppReview();

  const handlePurchase = async () => {
    // 仅记录事件，稍后再请求评分
    await recordSignificantEvent();

    // 用户完成支付...
  };

  return <Button onPress={handlePurchase} title="Pay" />;
}
```

## 推荐的触发时机

### ✅ 好的时机
1. **订单成功完成后**（`app/(tabs)/sell.tsx` 成功提交后）
2. **提现成功后**（`app/wallet/withdraw.tsx` 提现到账后）
3. **完成首次交易后**
4. **达到 VIP 等级后**
5. **连续签到 7 天后**

### ❌ 避免的时机
1. 应用刚启动时
2. 用户正在操作时（交易进行中）
3. 用户遇到错误时
4. 强制要求评分才能继续使用

## 配置选项

在 `hooks/useAppReview.ts` 中修改配置：

```typescript
const REVIEW_CONFIG = {
  MIN_LAUNCHES: 10,              // 最少启动次数
  MIN_DAYS_SINCE_INSTALL: 7,     // 安装后最少天数
  MIN_SIGNIFICANT_EVENTS: 3,      // 最少重要事件次数
  COOLDOWN_DAYS: 90,             // 两次请求之间的冷却天数
};
```

## 示例：在订单成功页面集成

```typescript
// app/orders/[orderNo].tsx
import { useAppReview } from '@/hooks/useAppReview';
import { useReviewStore } from '@/stores/useReviewStore';

export default function OrderDetailScreen() {
  const { requestReviewAfterEvent, shouldRequestReview } = useAppReview();
  const { setShowRatingPrompt } = useReviewStore();

  useEffect(() => {
    // 如果订单状态是"已完成"
    if (orderStatus === 'completed') {
      checkReviewPrompt();
    }
  }, [orderStatus]);

  const checkReviewPrompt = async () => {
    // 方式1：直接请求（系统原生弹窗）
    await requestReviewAfterEvent();

    // 方式2：先显示自定义提示（推荐）
    const shouldShow = await shouldRequestReview();
    if (shouldShow) {
      await recordSignificantEvent();
      setShowRatingPrompt(true);
    }
  };

  return <View>...</View>;
}
```

## 测试

### 开发环境测试
在开发环境中，可以临时降低配置值来测试：

```typescript
const REVIEW_CONFIG = {
  MIN_LAUNCHES: 1,
  MIN_DAYS_SINCE_INSTALL: 0,
  MIN_SIGNIFICANT_EVENTS: 1,
  COOLDOWN_DAYS: 0,
};
```

### 清除测试数据
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 清除所有评分相关数据
await AsyncStorage.multiRemove([
  'app_review_requested',
  'app_review_last_prompted',
  'app_launch_count',
  'app_first_launch_date',
  'app_significant_events_count',
]);
```

## 应用商店配置

### iOS (App Store)
1. 在 `app.json` 中配置 bundleIdentifier
2. 在 `RatingPromptModal.tsx` 中替换 `<YOUR_APP_ID>` 为实际的 App Store ID

### Android (Google Play)
1. 在 `app.json` 中配置 package name
2. 在 `RatingPromptModal.tsx` 中替换 `<YOUR_PACKAGE_NAME>` 为实际的包名

```typescript
const storeUrl = Platform.select({
  ios: 'https://apps.apple.com/app/id1234567890',  // 替换 1234567890
  android: 'https://play.google.com/store/apps/details?id=com.yourcompany.cardking',
});
```

## 注意事项

1. **不要频繁调用**：系统会自动限制显示频率
2. **尊重用户选择**：用户选择"不再提醒"后，永远不再显示
3. **测试真机**：在真实设备上测试，模拟器可能不显示评分界面
4. **合规性**：确保符合 App Store Review Guidelines 和 Google Play 政策
5. **追踪分析**：可以集成到现有的 Kochava 追踪系统中

## API 参考

### `useAppReview` Hook

```typescript
interface UseAppReview {
  // 记录一个重要事件（用户完成关键操作）
  recordSignificantEvent: () => Promise<void>;

  // 直接请求评分（会先检查条件）
  requestReview: () => Promise<boolean>;

  // 记录事件后立即检查并请求评分
  requestReviewAfterEvent: () => Promise<boolean>;

  // 标记用户已完成评分（不再显示）
  markReviewCompleted: () => Promise<void>;

  // 检查当前是否应该请求评分
  shouldRequestReview: () => Promise<boolean>;
}
```

### `useReviewStore` Store

```typescript
interface ReviewState {
  // 是否显示自定义评分提示弹窗
  showRatingPrompt: boolean;

  // 设置显示/隐藏状态
  setShowRatingPrompt: (show: boolean) => void;
}
```

## 相关资源

- [Apple App Store Review Guidelines - 5.6.1](https://developer.apple.com/app-store/review/guidelines/#ratings)
- [Google Play In-App Review API](https://developer.android.com/guide/playcore/in-app-review)
- [Expo Store Review Documentation](https://docs.expo.dev/versions/latest/sdk/storereview/)
