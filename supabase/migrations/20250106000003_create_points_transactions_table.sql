-- ポイント取引履歴テーブル
-- ポイントの購入・消費・返金などの履歴を記録

-- 既存のテーブルとENUM型を削除
DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

CREATE TYPE transaction_type AS ENUM ('purchase', 'consumption', 'refund');

CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- 正の値=追加、負の値=消費
  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  reference_type TEXT, -- 'divination_result', 'stripe_payment' など
  reference_id UUID, -- 関連するレコードのID
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_points_transactions_user_id
  ON points_transactions(user_id);

CREATE INDEX idx_points_transactions_created_at
  ON points_transactions(created_at DESC);

CREATE INDEX idx_points_transactions_reference
  ON points_transactions(reference_type, reference_id);

-- RLSポリシー: ユーザーは自分の取引履歴のみ閲覧可能
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の取引履歴のみ閲覧可能
CREATE POLICY "Users can view their own transactions"
  ON points_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 自分の取引履歴のみ作成可能
CREATE POLICY "Users can insert their own transactions"
  ON points_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- コメント
COMMENT ON TABLE points_transactions IS 'ポイントの購入・消費・返金などの履歴';
COMMENT ON COLUMN points_transactions.transaction_type IS '取引種別';
COMMENT ON COLUMN points_transactions.amount IS 'ポイント変動量（正=追加、負=消費）';
COMMENT ON COLUMN points_transactions.points_before IS '取引前のポイント残高';
COMMENT ON COLUMN points_transactions.points_after IS '取引後のポイント残高';
COMMENT ON COLUMN points_transactions.reference_type IS '関連レコード種別';
COMMENT ON COLUMN points_transactions.reference_id IS '関連レコードID';
