-- ポイント消費処理の関数
-- トランザクションで安全にポイントを消費し、履歴を記録する

CREATE OR REPLACE FUNCTION consume_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- ユーザーのポイント残高を取得（行ロック）
  SELECT points_balance INTO v_current_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- ポイントレコードが存在しない場合は作成
  IF NOT FOUND THEN
    INSERT INTO user_points (user_id, points_balance)
    VALUES (p_user_id, 0)
    RETURNING points_balance INTO v_current_balance;
  END IF;

  -- 残高が足りるか確認
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_points',
      'current_balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  -- 新しい残高を計算
  v_new_balance := v_current_balance - p_amount;

  -- ポイント残高を更新
  UPDATE user_points
  SET
    points_balance = v_new_balance,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 取引履歴を記録
  INSERT INTO points_transactions (
    user_id,
    transaction_type,
    amount,
    points_before,
    points_after,
    reference_type,
    reference_id,
    description
  )
  VALUES (
    p_user_id,
    'consumption',
    -p_amount, -- 消費は負の値
    v_current_balance,
    v_new_balance,
    p_reference_type,
    p_reference_id,
    p_description
  )
  RETURNING id INTO v_transaction_id;

  -- 成功を返す
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'points_before', v_current_balance,
    'points_after', v_new_balance
  );

EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生した場合
    RETURN jsonb_build_object(
      'success', false,
      'error', 'transaction_failed',
      'message', SQLERRM
    );
END;
$$;

-- コメント
COMMENT ON FUNCTION consume_points IS 'ポイントを消費し、トランザクション履歴を記録する';
