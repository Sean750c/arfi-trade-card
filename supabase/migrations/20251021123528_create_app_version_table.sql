/*
  # 应用版本管理系统

  ## 1. 新增表
    - `app_versions` - 应用版本信息表
      - `id` (uuid, primary key) - 唯一标识
      - `version` (text, unique) - 版本号，例如 "1.0.0"
      - `build_number` (integer) - 构建号
      - `platform` (text) - 平台：ios, android, all
      - `update_type` (text) - 更新类型：force（强制）, recommend（推荐）, optional（可选）
      - `min_required_version` (text) - 最低需要版本（用于强制更新判断）
      - `title` (text) - 更新标题
      - `description` (text) - 更新说明
      - `download_url_ios` (text) - iOS 下载链接（App Store）
      - `download_url_android` (text) - Android 下载链接（Google Play）
      - `is_active` (boolean) - 是否激活
      - `is_in_review` (boolean) - 是否在审核中（审核期间不触发强制更新）
      - `release_date` (timestamptz) - 发布日期
      - `created_at` (timestamptz) - 创建时间
      - `updated_at` (timestamptz) - 更新时间

  ## 2. 安全
    - 启用 RLS
    - 添加公开读取策略（任何人都可以查询版本信息）
    - 限制写入权限（只有管理员可以管理版本）
*/

-- 创建应用版本表
CREATE TABLE IF NOT EXISTS app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  build_number integer NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'all')),
  update_type text NOT NULL CHECK (update_type IN ('force', 'recommend', 'optional')),
  min_required_version text,
  title text NOT NULL,
  description text,
  download_url_ios text,
  download_url_android text,
  is_active boolean DEFAULT true,
  is_in_review boolean DEFAULT false,
  release_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（所有用户都可以查询激活的版本信息）
CREATE POLICY "Anyone can view active versions"
  ON app_versions
  FOR SELECT
  USING (is_active = true);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_app_versions_platform ON app_versions(platform);
CREATE INDEX IF NOT EXISTS idx_app_versions_active ON app_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_app_versions_version ON app_versions(version);

-- 插入初始版本数据（示例）
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
  '1.0.0',
  1,
  'all',
  'optional',
  'CardKing v1.0.0',
  'Initial release version',
  'https://apps.apple.com/app/id<YOUR_APP_ID>',
  'https://play.google.com/store/apps/details?id=<YOUR_PACKAGE_NAME>',
  true,
  false
) ON CONFLICT (version) DO NOTHING;
