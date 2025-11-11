-- メッセージ送信回数制限テーブル
-- ユーザーが占い師ごとに1日に送信できるメッセージ数を管理

-- 既存のテーブルを削除
DROP TABLE IF EXISTS message_limits CASCADE;

CREATE TABLE message_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fortune_teller_id UUID NOT NULL REFERENCES fortune_tellers(id) ON DELETE CASCADE,
  target_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザーと占い師の組み合わせ、その日ごとにユニーク
  UNIQUE(user_id, fortune_teller_id, target_date)
);

-- インデックス
CREATE INDEX idx_message_limits_user_fortune_teller
  ON message_limits(user_id, fortune_teller_id);

CREATE INDEX idx_message_limits_target_date
  ON message_limits(target_date);

-- RLSポリシー: ユーザーは自分の制限情報のみ閲覧・更新可能
ALTER TABLE message_limits ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の制限情報のみ閲覧可能
CREATE POLICY "Users can view their own message limits"
  ON message_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 自分の制限情報のみ作成可能
CREATE POLICY "Users can insert their own message limits"
  ON message_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の制限情報のみ更新可能
CREATE POLICY "Users can update their own message limits"
  ON message_limits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- コメント
COMMENT ON TABLE message_limits IS 'ユーザーごとの1日のメッセージ送信回数制限を管理';
COMMENT ON COLUMN message_limits.user_id IS 'ユーザーID';
COMMENT ON COLUMN message_limits.fortune_teller_id IS '占い師ID';
COMMENT ON COLUMN message_limits.target_date IS '対象日付';
COMMENT ON COLUMN message_limits.message_count IS 'その日の送信回数';
COMMENT ON COLUMN message_limits.last_message_at IS '最後にメッセージを送信した日時';
