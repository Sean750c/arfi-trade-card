# 应用内评分功能 - 快速设置

## ⚠️ 上架前必须完成的配置

### 1. 配置应用商店链接

编辑 `components/UI/RatingPromptModal.tsx`，替换第 52-53 行的占位符：

```typescript
const storeUrl = Platform.select({
  ios: 'https://apps.apple.com/app/id<YOUR_APP_ID>',           // ⚠️ 替换 YOUR_APP_ID
  android: 'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',  // ⚠️ 替换 YOUR_PACKAGE_NAME
});
```

#### 获取 iOS App ID
1. 登录 [App Store Connect](https://appstoreconnect.apple.com/)
2. 进入你的应用页面
3. 在 URL 中找到类似 `id1234567890` 的数字
4. 将完整的 App ID 替换到配置中，例如：
   ```typescript
   ios: 'https://apps.apple.com/app/id1234567890',
   ```

#### 获取 Android Package Name
在 `app.json` 中查看 `expo.android.package`，例如：
```typescript
android: 'https://play.google.com/store/apps/details?id=com.cardking.app',
```

### 2. 安装依赖

```bash
npm install expo-store-review --legacy-peer-deps
```

### 3. 测试配置

在开发环境中，临时修改 `hooks/useAppReview.ts` 的配置以便快速测试：

```typescript
// 开发测试配置（记得上线前改回来！）
const REVIEW_CONFIG = {
  MIN_LAUNCHES: 1,              // 临时改为 1（生产环境应为 10）
  MIN_DAYS_SINCE_INSTALL: 0,    // 临时改为 0（生产环境应为 7）
  MIN_SIGNIFICANT_EVENTS: 1,    // 临时改为 1（生产环境应为 3）
  COOLDOWN_DAYS: 0,             // 临时改为 0（生产环境应为 90）
};
```

**⚠️ 重要**：测试完成后，恢复为生产配置：
```typescript
const REVIEW_CONFIG = {
  MIN_LAUNCHES: 10,
  MIN_DAYS_SINCE_INSTALL: 7,
  MIN_SIGNIFICANT_EVENTS: 3,
  COOLDOWN_DAYS: 90,
};
```

## ✅ 已完成的集成

### 1. 核心功能
- ✅ `useAppReview` Hook - 评分逻辑管理
- ✅ `RatingPromptModal` 组件 - 自定义评分提示弹窗
- ✅ `useReviewStore` Store - 评分状态管理
- ✅ 应用启动计数（自动）
- ✅ 重要事件追踪

### 2. 已集成的触发点

#### 订单详情页 (`app/orders/[orderNo].tsx`)
- 当订单状态为"已完成"（status = 2 或 4）时触发
- 延迟 2 秒后显示评分提示
- 每个订单只触发一次

#### 其他推荐触发点（待添加）

你可以在以下位置添加类似的集成：

1. **提现成功** - `app/wallet/withdraw.tsx`
   ```typescript
   import { useAppReview } from '@/hooks/useAppReview';
   import { useReviewStore } from '@/stores/useReviewStore';

   const { recordSignificantEvent, shouldRequestReview } = useAppReview();
   const { setShowRatingPrompt } = useReviewStore();

   // 提现成功后
   const onWithdrawSuccess = async () => {
     await recordSignificantEvent();

     setTimeout(async () => {
       const shouldShow = await shouldRequestReview();
       if (shouldShow) {
         setShowRatingPrompt(true);
       }
     }, 2000);
   };
   ```

2. **完成签到** - `app/profile/checkin.tsx`
   ```typescript
   // 连续签到 7 天后
   if (consecutiveDays === 7) {
     await recordSignificantEvent();
   }
   ```

3. **达到 VIP 等级** - `app/profile/vip.tsx`
   ```typescript
   // 首次升级到 VIP 后
   if (isFirstTimeVIP) {
     await recordSignificantEvent();
   }
   ```

## 📱 测试步骤

### iOS 测试
1. 使用真机或 TestFlight 构建
2. 确保未在开发模式
3. 完成 3 次订单（或触发 3 次重要事件）
4. 应该会在第 3 次后看到评分提示

### Android 测试
1. 使用真机或内部测试构建
2. 完成触发条件
3. 查看评分提示是否正常显示

### 模拟器注意事项
⚠️ 系统评分界面在模拟器上可能不显示，这是正常的。自定义提示弹窗会正常显示。

## 🔧 调试

### 清除测试数据
在开发过程中，如果需要重新测试：

```typescript
// 在任意组件中运行
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearReviewData = async () => {
  await AsyncStorage.multiRemove([
    'app_review_requested',
    'app_review_last_prompted',
    'app_launch_count',
    'app_first_launch_date',
    'app_significant_events_count',
  ]);
  console.log('Review data cleared');
};
```

### 检查当前状态
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkReviewStatus = async () => {
  const launches = await AsyncStorage.getItem('app_launch_count');
  const events = await AsyncStorage.getItem('app_significant_events_count');
  const requested = await AsyncStorage.getItem('app_review_requested');

  console.log('Launches:', launches);
  console.log('Significant Events:', events);
  console.log('Already Requested:', requested);
};
```

## 📋 上线清单

在提交应用商店审核前，请确认：

- [ ] 已配置正确的 App Store ID
- [ ] 已配置正确的 Android Package Name
- [ ] 恢复生产环境的 `REVIEW_CONFIG` 配置
- [ ] 在真机上测试通过
- [ ] 自定义提示弹窗显示正常
- [ ] 系统评分界面调用正常（非模拟器）
- [ ] 没有强制要求用户评分的逻辑
- [ ] 用户可以选择"不再提醒"

## 📖 详细文档

完整的使用指南和 API 文档，请参阅：
- [APP_REVIEW_GUIDE.md](./APP_REVIEW_GUIDE.md)

## ⚖️ 合规性

此实现完全符合以下政策：
- ✅ [Apple App Store Review Guidelines 5.6.1](https://developer.apple.com/app-store/review/guidelines/#ratings)
- ✅ [Google Play In-App Review Policy](https://support.google.com/googleplay/android-developer/answer/9450386)

### 关键合规点
1. 使用原生评分 API（不替代系统界面）
2. 系统自动限制请求频率（iOS 每年最多 3 次）
3. 用户可以在系统设置中禁用评分请求
4. 不强制要求评分才能使用功能
5. 不承诺奖励以换取好评
6. 在合适的时机（用户完成积极操作后）请求
