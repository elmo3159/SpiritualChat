-- ログイン試行履歴テーブルの作成
-- Stripe審査対応：アカウントロック機能（10回以下のログイン失敗でロック）

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45), -- IPv6対応
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メールアドレスでの高速検索用インデックス
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);

-- IPアドレスでの検索用インデックス
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);

-- ロック状態の確認用インデックス
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked ON public.login_attempts(locked_until)
WHERE locked_until IS NOT NULL;

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_login_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_login_attempts_updated_at
    BEFORE UPDATE ON public.login_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_login_attempts_updated_at();

-- Row Level Security (RLS) の有効化
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- 管理者のみが閲覧・操作可能（サービスロールキーを使用）
-- 通常のユーザーはアクセス不可
CREATE POLICY "Service role can manage login attempts"
    ON public.login_attempts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ログイン試行の記録・チェック関数
CREATE OR REPLACE FUNCTION public.check_and_record_login_attempt(
    p_email VARCHAR(255),
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_success BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_record RECORD;
    v_failed_attempts INTEGER;
    v_locked_until TIMESTAMP WITH TIME ZONE;
    v_max_attempts INTEGER := 10; -- 最大試行回数
    v_lock_duration INTERVAL := '30 minutes'; -- ロック期間
BEGIN
    -- 既存レコードを取得または作成
    SELECT * INTO v_record
    FROM public.login_attempts
    WHERE email = p_email
    FOR UPDATE;

    IF NOT FOUND THEN
        -- 新規レコード作成
        INSERT INTO public.login_attempts (email, ip_address, failed_attempts)
        VALUES (p_email, p_ip_address, CASE WHEN p_success THEN 0 ELSE 1 END)
        RETURNING * INTO v_record;
    ELSE
        -- ロック期間中かチェック
        IF v_record.locked_until IS NOT NULL AND v_record.locked_until > NOW() THEN
            RETURN json_build_object(
                'allowed', false,
                'locked', true,
                'locked_until', v_record.locked_until,
                'message', 'アカウントがロックされています。30分後に再試行してください。'
            );
        END IF;

        -- ロック期間が過ぎていれば解除
        IF v_record.locked_until IS NOT NULL AND v_record.locked_until <= NOW() THEN
            UPDATE public.login_attempts
            SET failed_attempts = 0,
                locked_until = NULL,
                last_attempt_at = NOW()
            WHERE email = p_email;

            v_record.failed_attempts := 0;
            v_record.locked_until := NULL;
        END IF;

        -- ログイン成功時
        IF p_success THEN
            UPDATE public.login_attempts
            SET failed_attempts = 0,
                locked_until = NULL,
                ip_address = COALESCE(p_ip_address, ip_address),
                last_attempt_at = NOW()
            WHERE email = p_email;

            RETURN json_build_object(
                'allowed', true,
                'locked', false,
                'message', 'ログイン成功'
            );
        END IF;

        -- ログイン失敗時
        v_failed_attempts := v_record.failed_attempts + 1;

        -- 最大試行回数に達した場合、アカウントをロック
        IF v_failed_attempts >= v_max_attempts THEN
            v_locked_until := NOW() + v_lock_duration;

            UPDATE public.login_attempts
            SET failed_attempts = v_failed_attempts,
                locked_until = v_locked_until,
                ip_address = COALESCE(p_ip_address, ip_address),
                last_attempt_at = NOW()
            WHERE email = p_email;

            RETURN json_build_object(
                'allowed', false,
                'locked', true,
                'locked_until', v_locked_until,
                'failed_attempts', v_failed_attempts,
                'message', format('ログイン試行回数が上限（%s回）に達しました。アカウントは30分間ロックされます。', v_max_attempts)
            );
        END IF;

        -- まだロックされていない場合
        UPDATE public.login_attempts
        SET failed_attempts = v_failed_attempts,
            ip_address = COALESCE(p_ip_address, ip_address),
            last_attempt_at = NOW()
        WHERE email = p_email;
    END IF;

    RETURN json_build_object(
        'allowed', true,
        'locked', false,
        'failed_attempts', COALESCE(v_failed_attempts, 1),
        'remaining_attempts', v_max_attempts - COALESCE(v_failed_attempts, 1),
        'message', format('ログイン失敗。残り試行回数: %s回', v_max_attempts - COALESCE(v_failed_attempts, 1))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 古いレコードを削除する関数（30日以上前のもの）
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.login_attempts
    WHERE updated_at < NOW() - INTERVAL '30 days'
      AND (locked_until IS NULL OR locked_until < NOW());

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
