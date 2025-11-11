-- 鑑定結果テーブル
-- AI占い師による鑑定結果を管理

-- 既存のテーブルを削除
DROP TABLE IF EXISTS divination_results CASCADE;

CREATE TABLE divination_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fortune_teller_id UUID NOT NULL REFERENCES fortune_tellers(id) ON DELETE CASCADE,

  -- 3つのメッセージ
  greeting_message TEXT NOT NULL, -- 鑑定前メッセージ
  result_encrypted TEXT NOT NULL, -- 暗号化された鑑定結果（400文字程度）
  result_preview TEXT NOT NULL, -- 最初の20文字（プレビュー用）
  after_message TEXT NOT NULL, -- 鑑定後メッセージ

  -- 開封状態
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  points_consumed INTEGER, -- 消費ポイント（通常1000）
  unlocked_at TIMESTAMP WITH TIME ZONE, -- 開封日時

  -- メタ情報
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_divination_results_user_id
  ON divination_results(user_id);

CREATE INDEX idx_divination_results_fortune_teller_id
  ON divination_results(fortune_teller_id);

CREATE INDEX idx_divination_results_created_at
  ON divination_results(created_at DESC);

CREATE INDEX idx_divination_results_unlocked
  ON divination_results(user_id, is_unlocked);

-- RLSポリシー: ユーザーは自分の鑑定結果のみ閲覧・更新可能
ALTER TABLE divination_results ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の鑑定結果のみ閲覧可能
CREATE POLICY "Users can view their own divination results"
  ON divination_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 自分の鑑定結果のみ作成可能
CREATE POLICY "Users can insert their own divination results"
  ON divination_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の鑑定結果のみ更新可能（開封処理用）
CREATE POLICY "Users can update their own divination results"
  ON divination_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- コメント
COMMENT ON TABLE divination_results IS 'AI占い師による鑑定結果';
COMMENT ON COLUMN divination_results.greeting_message IS '鑑定前メッセージ';
COMMENT ON COLUMN divination_results.result_encrypted IS '暗号化された鑑定結果';
COMMENT ON COLUMN divination_results.result_preview IS '鑑定結果の最初の20文字（プレビュー）';
COMMENT ON COLUMN divination_results.after_message IS '鑑定後メッセージ';
COMMENT ON COLUMN divination_results.is_unlocked IS '全文が開封されたかどうか';
COMMENT ON COLUMN divination_results.points_consumed IS '開封時に消費したポイント';
COMMENT ON COLUMN divination_results.unlocked_at IS '開封日時';
