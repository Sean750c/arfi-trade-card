# 优惠码服务 (Coupon Service) 和 Store

## 概述

优惠码功能已经重构为独立的service和store，遵循项目的架构模式，参考FAQ服务的实现。

## 文件结构

```
services/
  └── coupon.ts          # 优惠码API服务
stores/
  └── useCouponStore.ts  # 优惠码状态管理
types/
  └── common.ts          # 优惠码相关类型定义
```

## 类型定义

### Coupon 接口
```typescript
interface Coupon {
  code: string;
  valid_start_time: number;
  valid_end_time: number;
  use_status: number;
  new_use_status: number;
  max_use: number;
  type: number;
  discount_type: number;
  discount_value: string;
  used_times: number;
  asc_sort: number;
  coupon_amount: number;
  coupon_type: string;
  symbol: string;
  enough_money: string;
  enough_money_usd: string;
}
```

### CouponListRequest 接口
```typescript
interface CouponListRequest {
  token: string;
  type: number; // 0: all, 1: country currency, 2: USDT
  page: number;
  page_size: number;
}
```

## 使用方法

### 1. 在组件中使用 Store

```typescript
import { useCouponStore } from '@/stores/useCouponStore';
import { useAuthStore } from '@/stores/useAuthStore';

function MyComponent() {
  const { user } = useAuthStore();
  const {
    coupons,
    isLoadingCoupons,
    isLoadingMore,
    couponsError,
    hasMore,
    fetchCoupons,
    loadMoreCoupons,
    clearCouponData,
  } = useCouponStore();

  useEffect(() => {
    if (user?.token) {
      // 获取NGN类型的优惠码
      fetchCoupons('NGN', user.token, true);
      // 或者获取USDT类型的优惠码
      // fetchCoupons('USDT', user.token, true);
    }
  }, [user?.token]);

  const handleLoadMore = () => {
    if (user?.token) {
      loadMoreCoupons(user.token);
    }
  };

  // 组件卸载时清理数据
  useEffect(() => {
    return () => {
      clearCouponData();
    };
  }, []);

  return (
    // 你的组件JSX
  );
}
```

### 2. 直接使用 Service

```typescript
import { CouponService } from '@/services/coupon';

async function fetchCouponsDirectly() {
  try {
    const coupons = await CouponService.getAvailableCoupons({
      token: 'user_token',
      type: 1, // 1 for NGN, 2 for USDT
      page: 0,
      page_size: 10,
    });
    console.log('Coupons:', coupons);
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
  }
}
```

## Store 状态

### 状态属性
- `coupons: Coupon[]` - 优惠码列表
- `isLoadingCoupons: boolean` - 是否正在加载优惠码
- `isLoadingMore: boolean` - 是否正在加载更多
- `couponsError: string | null` - 错误信息
- `currentPage: number` - 当前页码
- `hasMore: boolean` - 是否还有更多数据
- `walletType: 'NGN' | 'USDT'` - 当前钱包类型

### 操作方法
- `fetchCoupons(walletType, token, refresh?, apiType?)` - 获取优惠码列表
- `loadMoreCoupons(token, apiType?)` - 加载更多优惠码
- `clearCouponData()` - 清理数据

### 参数说明
- `walletType`: 'NGN' | 'USDT' - 钱包类型
- `token`: string - 用户token
- `refresh`: boolean - 是否刷新数据（可选）
- `apiType`: number - API类型参数（可选）
  - 0: 全部类型
  - 1: 国家货币相关优惠码
  - 2: USDT相关优惠码

## 已更新的组件

1. **DiscountCodeModal** (`components/sell/DiscountCodeModal.tsx`)
   - 使用新的store管理状态
   - 支持分页加载
   - 错误处理

2. **PromoCodesScreen** (`app/profile/promo-codes.tsx`)
   - 使用新的store管理状态
   - 支持下拉刷新
   - 支持类型筛选

3. **SellScreen** (`app/(tabs)/sell.tsx`)
   - 移除了重复的Coupon接口定义
   - 使用统一的类型定义

## 优势

1. **代码复用**: 多个组件可以共享同一个store
2. **状态管理**: 统一的状态管理，避免重复的API调用
3. **类型安全**: 统一的类型定义，减少类型错误
4. **错误处理**: 统一的错误处理机制
5. **性能优化**: 支持分页加载，减少不必要的API调用

## 注意事项

1. 确保在组件卸载时调用 `clearCouponData()` 清理数据
2. 根据钱包类型选择正确的 `type` 参数 (1 for NGN, 2 for USDT)
3. 处理加载状态和错误状态
4. 支持分页加载时检查 `hasMore` 状态 