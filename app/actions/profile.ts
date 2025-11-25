'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { revalidatePath } from 'next/cache'
import { checkAndAwardBadges } from '@/lib/services/badge-service'

export async function getProfile() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: '認証が必要です',
        data: null,
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('プロフィール取得エラー:', error)
      return {
        success: false,
        error: 'プロフィールの取得に失敗しました',
        data: null,
      }
    }

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました',
      data: null,
    }
  }
}

export async function createProfile(formData: ProfileFormData) {
  try {
    // バリデーション
    const validatedData = profileSchema.parse(formData)

    // 認証状態の確認
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: '認証が必要です。再度ログインしてください。',
      }
    }

    // 既存のプロフィールを確認
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (selectError) {
      console.error('プロフィール確認エラー:', selectError)
      return {
        success: false,
        error: 'プロフィールの確認に失敗しました',
      }
    }

    // 既存レコードがある場合（トリガーで作成済み）はUPDATE、ない場合はINSERT
    if (existingProfile) {
      // onboarding完了済みの場合のみエラー
      if (existingProfile.onboarding_completed) {
        return {
          success: false,
          error: 'プロフィールは既に登録されています',
        }
      }
    }

    // プロフィール保存とポイント付与を並列で実行（高速化）
    const profilePromise = existingProfile
      ? supabase
          .from('profiles')
          .update({
            nickname: validatedData.nickname,
            birth_date: validatedData.birthDate,
            birth_time: validatedData.birthTime || null,
            birth_place: validatedData.birthPlace || null,
            gender: validatedData.gender,
            concern_category: validatedData.concernCategory,
            concern_description: validatedData.concernDescription,
            partner_name: validatedData.partnerName || null,
            partner_gender: validatedData.partnerGender || null,
            partner_birth_date: validatedData.partnerBirthDate || null,
            partner_age: validatedData.partnerAge || null,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      : supabase.from('profiles').insert({
          id: user.id,
          nickname: validatedData.nickname,
          birth_date: validatedData.birthDate,
          birth_time: validatedData.birthTime || null,
          birth_place: validatedData.birthPlace || null,
          gender: validatedData.gender,
          concern_category: validatedData.concernCategory,
          concern_description: validatedData.concernDescription,
          partner_name: validatedData.partnerName || null,
          partner_gender: validatedData.partnerGender || null,
          partner_birth_date: validatedData.partnerBirthDate || null,
          partner_age: validatedData.partnerAge || null,
          onboarding_completed: true,
        })

    // ポイント付与処理（並列実行）
    const pointsPromise = (async () => {
      const { data: existingPoints } = await supabase
        .from('user_points')
        .select('points_balance')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingPoints) {
        await supabase
          .from('user_points')
          .update({
            points_balance: existingPoints.points_balance + 1000,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            points_balance: 1000,
          })
      }

      // ポイント取引履歴を記録
      await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points: 1000,
          transaction_type: 'bonus',
          description: '新規登録ボーナス',
        })
    })()

    // 両方の処理を並列で待機
    const [profileResult] = await Promise.all([profilePromise, pointsPromise])

    if (profileResult.error) {
      console.error('プロフィール保存エラー:', profileResult.error)
      return {
        success: false,
        error: 'プロフィールの作成に失敗しました',
      }
    }

    // キャッシュを再検証（非ブロッキング - 画面遷移を妨げない）
    // revalidatePath('/') は遷移後にバックグラウンドで実行される

    // 新規登録時はバッジチェックをスキップ
    // （新規ユーザーはデータがないためバッジ獲得条件を満たさない）
    // バッジチェックは次回のアクションや定期的なチェックで実行される

    return {
      success: true,
    }
  } catch (error) {
    console.error('プロフィール作成エラー:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    }
  }
}

export async function updateProfile(formData: ProfileFormData) {
  try {
    // バリデーション
    const validatedData = profileSchema.parse(formData)

    // 認証状態の確認
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: '認証が必要です',
      }
    }

    // プロフィールを更新
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: validatedData.nickname,
        birth_date: validatedData.birthDate,
        birth_time: validatedData.birthTime || null,
        birth_place: validatedData.birthPlace || null,
        gender: validatedData.gender,
        concern_category: validatedData.concernCategory,
        concern_description: validatedData.concernDescription,
        partner_name: validatedData.partnerName || null,
        partner_gender: validatedData.partnerGender || null,
        partner_birth_date: validatedData.partnerBirthDate || null,
        partner_age: validatedData.partnerAge || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('プロフィール更新エラー:', updateError)
      return {
        success: false,
        error: 'プロフィールの更新に失敗しました',
      }
    }

    // キャッシュを再検証
    revalidatePath('/')

    // バッジチェックを実行
    await checkAndAwardBadges(user.id)

    return {
      success: true,
    }
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    }
  }
}
