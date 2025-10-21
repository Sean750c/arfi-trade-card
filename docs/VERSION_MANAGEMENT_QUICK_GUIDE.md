# 版本管理快速指南

## 🚀 快速开始

### 1. 配置下载链接

```sql
-- 替换 <YOUR_APP_ID> 和 <YOUR_PACKAGE_NAME>
UPDATE app_versions SET
  download_url_ios = 'https://apps.apple.com/app/id<YOUR_APP_ID>',
  download_url_android = 'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>'
WHERE version = '1.0.0';
```

### 2. 发布新版本（推荐更新）

```sql
-- Step 1: 添加新版本（审核中）
INSERT INTO app_versions (
  version, build_number, platform, update_type,
  title, description,
  download_url_ios, download_url_android,
  is_active, is_in_review
) VALUES (
  '1.2.0', 12, 'all', 'recommend',
  'New Features Available',
  '• Feature 1\n• Feature 2\n• Bug fixes',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
  false, true
);

-- Step 2: 审核通过后激活
UPDATE app_versions SET is_active = false WHERE version != '1.2.0';
UPDATE app_versions SET is_active = true, is_in_review = false WHERE version = '1.2.0';
```

### 3. 紧急强制更新（安全漏洞）

```sql
-- 添加强制更新版本
INSERT INTO app_versions (
  version, build_number, platform, update_type, min_required_version,
  title, description,
  download_url_ios, download_url_android,
  is_active, is_in_review
) VALUES (
  '1.2.1', 13, 'all', 'force', '1.2.1',
  'Critical Security Update',
  'Please update immediately for security fixes.',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
  true, false  -- 紧急情况下可以直接激活
);
```

## 📋 常用操作

### 查看当前激活的版本
```sql
SELECT version, platform, update_type, is_in_review
FROM app_versions
WHERE is_active = true;
```

### 停用有问题的版本
```sql
UPDATE app_versions SET is_active = false WHERE version = '1.2.0';
```

### 激活旧版本（回滚）
```sql
UPDATE app_versions SET is_active = true WHERE version = '1.1.0';
```

### 标记审核状态
```sql
-- 进入审核
UPDATE app_versions SET is_in_review = true WHERE version = '1.2.0';

-- 审核完成
UPDATE app_versions SET is_in_review = false WHERE version = '1.2.0';
```

## ⚠️ 审核注意事项

### 提交审核前
```sql
UPDATE app_versions
SET is_in_review = true
WHERE version = '新版本号';
```

### 审核通过后
```sql
UPDATE app_versions
SET is_active = true, is_in_review = false
WHERE version = '新版本号';
```

## 🎯 更新类型选择

| 类型 | 使用场景 | 用户体验 | 审核风险 |
|------|----------|----------|----------|
| `optional` | 小改进、UI 调整 | 可跳过 | ✅ 无 |
| `recommend` | 新功能、Bug 修复 | 可稍后 | ✅ 低 |
| `force` | 安全漏洞、严重 Bug | 必须更新 | ⚠️ 中 |

## 🔧 调试命令

### 清除本地缓存
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.multiRemove([
  'version_last_check_time',
  'version_skipped_version',
]);
```

### 手动触发检测
```typescript
import { useVersionCheck } from '@/hooks/useVersionCheck';

const { checkVersion } = useVersionCheck();
checkVersion(true); // 强制检测，跳过冷却期
```

### 查看当前版本
```typescript
import { VersionService } from '@/services/version';

console.log('Version:', VersionService.getCurrentVersion());
console.log('Build:', VersionService.getCurrentBuildNumber());
```

## 📊 版本发布流程

```
1. app.json 更新版本号
   ↓
2. 数据库添加版本记录（is_active=false, is_in_review=true）
   ↓
3. 构建并提交审核
   ↓
4. 审核通过
   ↓
5. 激活版本（is_active=true, is_in_review=false）
```

## 🚨 紧急回滚

```sql
-- 1. 停用有问题的版本
UPDATE app_versions SET is_active = false WHERE version = '1.2.0';

-- 2. 激活上一个稳定版本
UPDATE app_versions SET is_active = true WHERE version = '1.1.0';
```

## 常见问题

**Q: 更新提示不显示？**
- 检查 `is_active = true`
- 检查版本号是否高于当前版本
- 检查是否在 6 小时冷却期内

**Q: 强制更新可以关闭？**
- 检查 `is_in_review` 是否为 `true`
- 检查 `update_type` 是否为 `force`
- 检查 `min_required_version` 是否设置

**Q: 如何避免审核被拒？**
- 提交审核前设置 `is_in_review = true`
- 审核通过后再设置 `is_in_review = false`
- 强制更新要有合理理由

## 完整文档

详细说明请查看：[VERSION_MANAGEMENT.md](./VERSION_MANAGEMENT.md)
