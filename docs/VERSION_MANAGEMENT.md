# 版本管理和强制更新系统

## 概述

本系统提供了一个完整的版本管理和更新提示功能，使用 Supabase 数据库存储版本信息，支持强制更新、推荐更新和可选更新三种模式。

## ⚠️ 重要：应用商店审核合规性

### Apple App Store 规则
- ✅ **允许**：提示用户有新版本，并引导到 App Store 更新
- ❌ **禁止**：强制下载或直接安装 APK/IPA 文件
- ✅ **允许**：阻止用户使用旧版本（需要有合理理由，如安全漏洞）
- ⚠️ **注意**：审核期间不应触发强制更新（使用 `is_in_review` 标记）

### Google Play Store 规则
- ✅ **允许**：应用内更新提示
- ✅ **允许**：使用 In-App Updates API 实现无缝更新
- ⚠️ **注意**：不能完全阻止用户使用应用（除非有安全原因）

### 本系统的合规策略
1. 使用原生应用商店链接（不直接下载安装包）
2. 提供"稍后提醒"选项（推荐更新）
3. 审核期间自动降级为可选更新
4. 强制更新仅用于安全关键场景

## 架构设计

### 数据库表结构

```sql
app_versions (
  id uuid PRIMARY KEY,
  version text UNIQUE NOT NULL,          -- 版本号，如 "1.2.0"
  build_number integer NOT NULL,         -- 构建号
  platform text NOT NULL,                -- ios, android, all
  update_type text NOT NULL,             -- force, recommend, optional
  min_required_version text,             -- 最低需要版本（用于强制更新）
  title text NOT NULL,                   -- 更新标题
  description text,                      -- 更新说明
  download_url_ios text,                 -- App Store 链接
  download_url_android text,             -- Google Play 链接
  is_active boolean DEFAULT true,        -- 是否激活
  is_in_review boolean DEFAULT false,    -- 是否在审核中
  release_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

### 更新类型说明

#### 1. `force` - 强制更新
- **何时使用**：修复严重安全漏洞、重大 Bug、API 不兼容
- **用户体验**：无法关闭更新弹窗，必须更新才能继续使用
- **审核风险**：⚠️ 中等（需要有合理理由）
- **建议**：仅在必要时使用，审核期间设置 `is_in_review = true`

#### 2. `recommend` - 推荐更新
- **何时使用**：新功能、性能优化、次要 Bug 修复
- **用户体验**：显示更新提示，可选择"稍后提醒"
- **审核风险**：✅ 低
- **建议**：大多数更新使用此类型

#### 3. `optional` - 可选更新
- **何时使用**：小改进、UI 调整
- **用户体验**：轻量提示，可以跳过
- **审核风险**：✅ 无
- **建议**：非关键更新使用

## 使用指南

### 1. 配置应用商店链接

在数据库中配置正确的下载链接：

```sql
UPDATE app_versions SET
  download_url_ios = 'https://apps.apple.com/app/id<YOUR_APP_ID>',
  download_url_android = 'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>'
WHERE version = '1.0.0';
```

### 2. 发布新版本

#### 步骤 1：准备新版本
```typescript
// 在 app.json 中更新版本号
{
  "expo": {
    "version": "1.2.0",
    "ios": {
      "buildNumber": "12"
    },
    "android": {
      "versionCode": 12
    }
  }
}
```

#### 步骤 2：在数据库中添加版本记录

**场景 A：推荐更新（最常用）**
```sql
INSERT INTO app_versions (
  version,
  build_number,
  platform,
  update_type,
  title,
  description,
  download_url_ios,
  download_url_android,
  is_active,
  is_in_review
) VALUES (
  '1.2.0',
  12,
  'all',
  'recommend',
  'New Features & Improvements',
  '• Added dark mode support\n• Improved performance\n• Fixed bugs',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
  false,  -- 先设为 false，等应用商店审核通过后再激活
  true    -- 标记为审核中，避免触发强制更新
);
```

**场景 B：强制更新（安全漏洞修复）**
```sql
INSERT INTO app_versions (
  version,
  build_number,
  platform,
  update_type,
  min_required_version,  -- 设置最低版本要求
  title,
  description,
  download_url_ios,
  download_url_android,
  is_active,
  is_in_review
) VALUES (
  '1.2.1',
  13,
  'all',
  'force',
  '1.2.1',  -- 低于此版本的用户必须更新
  'Critical Security Update',
  'This update fixes important security issues. Please update immediately.',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
  false,
  true
);
```

**场景 C：仅 iOS 强制更新**
```sql
INSERT INTO app_versions (
  version,
  build_number,
  platform,
  update_type,
  min_required_version,
  title,
  description,
  download_url_ios,
  is_active,
  is_in_review
) VALUES (
  '1.2.2',
  14,
  'ios',  -- 仅针对 iOS
  'force',
  '1.2.2',
  'iOS Critical Update',
  'Fixes a crash issue affecting iOS users.',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  false,
  true
);
```

#### 步骤 3：提交到应用商店
1. 构建应用：`eas build --platform all`
2. 提交审核
3. 等待审核通过

#### 步骤 4：激活版本
审核通过后，激活新版本：

```sql
-- 1. 停用旧版本
UPDATE app_versions SET is_active = false WHERE version != '1.2.0';

-- 2. 激活新版本，并标记审核完成
UPDATE app_versions
SET
  is_active = true,
  is_in_review = false
WHERE version = '1.2.0';
```

### 3. 审核期间的策略

#### ⚠️ 重要：避免审核被拒

在提交审核前：
```sql
-- 确保审核期间的版本标记为 is_in_review = true
UPDATE app_versions
SET is_in_review = true
WHERE version = '1.2.0';
```

**系统行为**：
- 当 `is_in_review = true` 时，即使 `update_type = 'force'`，也会自动降级为 `optional`
- 审核人员不会遇到强制更新弹窗
- 审核通过后，设置 `is_in_review = false` 恢复正常行为

### 4. 版本比较逻辑

系统使用语义化版本号（Semantic Versioning）：

```
版本格式: MAJOR.MINOR.PATCH
示例: 1.2.3

比较规则:
1.2.3 < 1.2.4  ✓ (PATCH 升级)
1.2.9 < 1.3.0  ✓ (MINOR 升级)
1.9.9 < 2.0.0  ✓ (MAJOR 升级)
```

强制更新触发条件：
```typescript
if (currentVersion < minRequiredVersion && !is_in_review) {
  // 触发强制更新
}
```

### 5. 检测频率

- 应用启动时自动检测（但有冷却期）
- 冷却期：6 小时（可在 `hooks/useVersionCheck.ts` 中修改）
- 用户手动刷新时立即检测（跳过冷却期）

```typescript
// 在任何组件中手动触发检测
import { useVersionCheck } from '@/hooks/useVersionCheck';

function MyComponent() {
  const { checkVersion } = useVersionCheck();

  const handleRefresh = () => {
    checkVersion(true); // force = true，跳过冷却期
  };
}
```

## 测试流程

### 1. 测试推荐更新

```sql
-- 添加测试版本（版本号高于当前版本）
INSERT INTO app_versions (
  version, build_number, platform, update_type,
  title, description,
  download_url_ios, download_url_android,
  is_active, is_in_review
) VALUES (
  '99.0.0', 9900, 'all', 'recommend',
  'Test Update', 'This is a test update',
  'https://apps.apple.com/app/id1234567890',
  'https://play.google.com/store/apps/details?id=com.test.app',
  true, false
);
```

**预期行为**：
- 应用启动时显示更新提示
- 可以选择"稍后提醒"
- 关闭后下次启动（6小时后）再次显示

### 2. 测试强制更新

```sql
-- 添加强制更新版本
INSERT INTO app_versions (
  version, build_number, platform, update_type, min_required_version,
  title, description,
  download_url_ios, download_url_android,
  is_active, is_in_review
) VALUES (
  '99.1.0', 9910, 'all', 'force', '99.1.0',
  'Critical Update Required', 'You must update to continue',
  'https://apps.apple.com/app/id1234567890',
  'https://play.google.com/store/apps/details?id=com.test.app',
  true, false
);
```

**预期行为**：
- 应用启动时显示强制更新弹窗
- 无法关闭弹窗（没有 X 按钮）
- 只能点击"Update Now"

### 3. 测试审核模式

```sql
-- 模拟审核中的强制更新
UPDATE app_versions
SET is_in_review = true
WHERE version = '99.1.0';
```

**预期行为**：
- 即使是 `force` 更新，也显示为可选更新
- 可以关闭弹窗
- 不会阻止用户使用应用

### 4. 清除测试数据

```sql
-- 删除测试版本
DELETE FROM app_versions WHERE version LIKE '99.%';

-- 清除客户端缓存
```

```typescript
// 在应用中运行
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.multiRemove([
  'version_last_check_time',
  'version_skipped_version',
]);
```

## 最佳实践

### 1. 版本发布流程

```
1. 开发完成 → 更新 app.json 版本号
2. 在数据库中添加版本记录（is_active=false, is_in_review=true）
3. 构建并提交审核
4. 审核通过 → 设置 is_active=true, is_in_review=false
5. 监控用户反馈
```

### 2. 强制更新使用原则

**✅ 应该使用强制更新的情况：**
- 严重安全漏洞
- 导致数据丢失的 Bug
- 服务端 API 重大不兼容变更
- 崩溃率极高的版本

**❌ 不应使用强制更新的情况：**
- 新增功能
- UI 改进
- 性能优化
- 小 Bug 修复

### 3. 审核策略

| 阶段 | is_active | is_in_review | 效果 |
|------|-----------|--------------|------|
| 开发中 | false | true | 用户看不到此版本 |
| 审核中 | false | true | 审核人员看不到强制更新 |
| 审核通过 | true | false | 正式启用，触发更新提示 |
| 发现问题 | false | false | 紧急停用 |

### 4. 多平台管理

如果 iOS 和 Android 版本号不同步：

```sql
-- iOS 先上线
INSERT INTO app_versions (..., platform, ...) VALUES (..., 'ios', ...);

-- Android 稍后上线
INSERT INTO app_versions (..., platform, ...) VALUES (..., 'android', ...);
```

### 5. 回滚策略

如果新版本有问题，立即停用：

```sql
-- 停用有问题的版本
UPDATE app_versions SET is_active = false WHERE version = '1.2.0';

-- 激活上一个稳定版本
UPDATE app_versions SET is_active = true WHERE version = '1.1.0';
```

## 监控和分析

### 1. 查看当前激活的版本

```sql
SELECT
  version,
  platform,
  update_type,
  is_in_review,
  release_date
FROM app_versions
WHERE is_active = true
ORDER BY build_number DESC;
```

### 2. 统计用户版本分布

建议在应用中添加版本上报功能：

```typescript
// 在应用启动时上报版本
import { VersionService } from '@/services/version';
import { KochavaTracker } from '@/utils/kochava';

const currentVersion = VersionService.getCurrentVersion();
KochavaTracker.trackEvent('app_version', { version: currentVersion });
```

## 故障排除

### 问题 1：更新提示不显示

**检查清单**：
1. 数据库中版本是否 `is_active = true`
2. 版本号是否高于当前版本
3. 是否在 6 小时冷却期内
4. 网络连接是否正常

**调试**：
```typescript
import { VersionService } from '@/services/version';

// 检查当前版本
console.log('Current:', VersionService.getCurrentVersion());

// 检查最新版本
const latest = await VersionService.getLatestVersion();
console.log('Latest:', latest);

// 手动检测更新
const result = await VersionService.checkForUpdate();
console.log('Update check result:', result);
```

### 问题 2：强制更新可以关闭

**原因**：
- `is_in_review = true`（审核模式）
- `canSkip = true`（配置错误）
- `update_type !== 'force'`

**解决**：
```sql
UPDATE app_versions
SET
  update_type = 'force',
  is_in_review = false,
  min_required_version = '1.2.0'  -- 设置最低版本
WHERE version = '1.2.0';
```

### 问题 3：应用商店链接打不开

**检查**：
```typescript
// 确认链接格式正确
iOS: https://apps.apple.com/app/id1234567890
Android: https://play.google.com/store/apps/details?id=com.example.app
```

## 安全考虑

1. **RLS 策略**：表已启用 RLS，只允许读取激活的版本
2. **写入权限**：只有管理员可以修改版本信息
3. **审核保护**：审核期间自动降级强制更新
4. **回滚机制**：可快速停用有问题的版本

## API 参考

### VersionService

```typescript
class VersionService {
  // 获取当前版本号
  static getCurrentVersion(): string;

  // 获取当前构建号
  static getCurrentBuildNumber(): number;

  // 获取最新版本信息
  static async getLatestVersion(): Promise<AppVersion | null>;

  // 检查是否需要更新
  static async checkForUpdate(): Promise<VersionCheckResult>;

  // 获取下载链接
  static getDownloadUrl(versionInfo: AppVersion): string | null;
}
```

### useVersionCheck Hook

```typescript
interface UseVersionCheck {
  versionCheckResult: VersionCheckResult | null;
  showUpdateModal: boolean;
  hasCheckedVersion: boolean;
  checkVersion: (force?: boolean) => Promise<void>;
  skipVersion: () => Promise<void>;
  handleUpdate: () => void;
  setShowUpdateModal: (show: boolean) => void;
}
```

## 相关资源

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play In-App Updates](https://developer.android.com/guide/playcore/in-app-updates)
- [Semantic Versioning](https://semver.org/)
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
