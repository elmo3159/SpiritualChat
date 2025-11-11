-- ユーザーポイント管理テーブル
-- ユーザーの所持ポイント残高を管理

-- 既存のテーブルとポリシーを削除（スキーマ不一致の場合に備えて）
DROP TABLE IF EXISTS user_points CASCADE;

CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザーごとに1レコードのみ
  UNIQUE(user_id)
);

-- インデックス
CREATE INDEX idx_user_points_user_id
  ON user_points(user_id);

-- RLSポリシー: ユーザーは自分のポイント情報のみ閲覧・更新可能
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のポイント情報のみ閲覧可能
CREATE POLICY "Users can view their own points"
  ON user_points
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 自分のポイント情報のみ作成可能
CREATE POLICY "Users can insert their own points"
  ON user_points
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分のポイント情報のみ更新可能
CREATE POLICY "Users can update their own points"
  ON user_points
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- コメント
COMMENT ON TABLE user_points IS 'ユーザーの所持ポイント残高を管理';
COMMENT ON COLUMN user_points.user_id IS 'ユーザーID';
COMMENT ON COLUMN user_points.points_balance IS '現在のポイント残高';
