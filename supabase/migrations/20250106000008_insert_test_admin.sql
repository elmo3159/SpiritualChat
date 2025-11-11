-- テスト管理者アカウントを挿入
-- Email: admin@example.com
-- Password: admin123

INSERT INTO admin_users (email, name, password_hash, role, is_active)
VALUES (
  'admin@example.com',
  'System Administrator',
  '$2a$10$Ma8GXqWk9Im2135hQebcquto2zTuquEU2VteBHjdnba6Bg1v/xxLC',
  'superadmin',
  true
)
ON CONFLICT (email) DO NOTHING;
