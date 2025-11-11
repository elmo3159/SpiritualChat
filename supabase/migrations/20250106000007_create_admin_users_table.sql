-- 管理者ユーザーテーブル作成
-- 管理者ダッシュボードへのアクセス権限を管理

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, superadmin, editor など
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス追加
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- コメント
COMMENT ON TABLE admin_users IS '管理者ユーザー情報を管理するテーブル';
COMMENT ON COLUMN admin_users.id IS '管理者ユーザーID（UUID）';
COMMENT ON COLUMN admin_users.email IS '管理者のメールアドレス（ログイン用）';
COMMENT ON COLUMN admin_users.password_hash IS 'ハッシュ化されたパスワード（bcryptなど）';
COMMENT ON COLUMN admin_users.name IS '管理者の表示名';
COMMENT ON COLUMN admin_users.role IS '管理者の役割（admin, superadmin, editorなど）';
COMMENT ON COLUMN admin_users.is_active IS 'アクティブ状態（無効化された管理者はログインできない）';

-- RLSポリシー設定（セキュリティ強化）
-- 管理者テーブルは通常のユーザーからはアクセス不可
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- サービスロールからのみアクセス可能（管理者認証APIで使用）
CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 初期管理者アカウント作成用のSQL（手動実行）
-- パスワードハッシュは実際のハッシュ化された値に置き換えてください
-- 例: bcrypt('admin123') のハッシュ値
-- INSERT INTO admin_users (email, name, password_hash, role)
-- VALUES ('admin@example.com', 'System Administrator', '$2a$10$...', 'superadmin');
