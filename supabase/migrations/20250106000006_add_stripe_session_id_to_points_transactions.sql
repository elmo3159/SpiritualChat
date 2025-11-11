-- points_transactionsテーブルにstripe_session_idカラムを追加
-- Webhookのべき等性チェック（重複処理防止）に使用

ALTER TABLE points_transactions
  ADD COLUMN stripe_session_id TEXT UNIQUE;

-- インデックス追加（べき等性チェックの高速化）
CREATE INDEX idx_points_transactions_stripe_session_id
  ON points_transactions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- コメント
COMMENT ON COLUMN points_transactions.stripe_session_id IS 'Stripeチェックアウトセッション ID（べき等性チェック用）';
