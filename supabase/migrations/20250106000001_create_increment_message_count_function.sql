-- メッセージカウントをインクリメントする関数
-- 既存レコードがあればカウントを+1、なければ新規作成

CREATE OR REPLACE FUNCTION increment_message_count(
  p_user_id UUID,
  p_fortune_teller_id UUID,
  p_target_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 既存レコードがあれば更新、なければ挿入
  INSERT INTO message_limits (
    user_id,
    fortune_teller_id,
    target_date,
    message_count,
    last_message_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_fortune_teller_id,
    p_target_date,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, fortune_teller_id, target_date)
  DO UPDATE SET
    message_count = message_limits.message_count + 1,
    last_message_at = NOW(),
    updated_at = NOW();
END;
$$;

-- コメント
COMMENT ON FUNCTION increment_message_count IS 'メッセージ送信回数をインクリメント（既存レコードがあれば+1、なければ新規作成）';
