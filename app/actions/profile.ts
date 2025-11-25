'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { revalidatePath } from 'next/cache'
import { checkAndAwardBadges } from '@/lib/services/badge-service'

/**
 * プロフィール完成バッジを直接付与する（超高速版）
 * DB呼び出しを並列化して最速で処理
 * この関数は非同期で呼び出され、完了を待たない
 */
async function awardProfileCompleteBadge(userId: string): Promise<void> {
  const supabase = createAdminClient()

  try {
    // Step 1: バッジ定義と既存バッジを並列取得
    const [badgeResult, existingBadgeResult] = await Promise.all([
      supabase
        .from('badge_definitions')
        .select('badge_key, bonus_points, bonus_exp')
        .eq('condition_type', 'profile_complete')
        .single(),
      supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .like('badge_key', '%profile%')
        .maybeSingle()
    ])

    const badge = badgeResult.data
    if (!badge) return
    if (existingBadgeResult.data) return // 既に持っている

    // Step 2: バッジ付与
    const { error: badgeError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_key: badge.badge_key,
      })

    if (badgeError) {
      console.error('バッジ付与エラー:', badgeError)
      return
    }

    // Step 3: ポイント・経験値付与を並列実行
    const updatePromises: Promise<any>[] = []

    if (badge.bonus_points > 0) {
      // ポイント更新を並列実行
      updatePromises.push(
        (async () => {
          const { data: currentPoints } = await supabase
            .from('user_points')
            .select('points_balance')
            .eq('user_id', userId)
            .single()

          const newBalance = (currentPoints?.points_balance || 0) + badge.bonus_points

          await Promise.all([
            supabase.from('user_points').update({ points_balance: newBalance }).eq('user_id', userId),
            supabase.from('points_transactions').insert({
              user_id: userId,
              transaction_type: 'bonus',
              amount: badge.bonus_points,
              description: `バッジ獲得ボーナス: ${badge.badge_key}`,
            }),
            supabase.from('user_badges').update({ bonus_points_claimed: true }).eq('user_id', userId).eq('badge_key', badge.badge_key)
          ])
        })()
      )
    }

    if (badge.bonus_exp > 0) {
      // 経験値更新を並列実行
      updatePromises.push(
        (async () => {
          const { data: levelData } = await supabase
            .from('user_levels')
            .select('current_exp')
            .eq('user_id', userId)
            .single()

          if (levelData) {
            const newExp = levelData.current_exp + badge.bonus_exp
            const newLevel = Math.floor(newExp / 1000) + 1

            await supabase
              .from('user_levels')
              .update({ current_exp: newExp, current_level: newLevel, updated_at: new Date().toISOString() })
              .eq('user_id', userId)
          }
        })()
      )
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    console.log('プロフィール完成バッジを付与しました:', userId)
  } catch (error) {
    console.error('プロフィール完成バッジ付与エラー:', error)
  }
}

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

    // プロフィール保存（これだけはブロッキングで確実に完了させる）
    const profileResult = existingProfile
      ? await supabase
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
      : await supabase.from('profiles').insert({
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

    if (profileResult.error) {
      console.error('プロフィール保存エラー:', profileResult.error)
      return {
        success: false,
        error: 'プロフィールの作成に失敗しました',
      }
    }

    // ============================================================
    // 以下の処理は非ブロッキングで実行（画面遷移を即座に行うため）
    // ============================================================

    // ポイント付与（非ブロッキング版）
    // 新規登録ボーナス1000ptを付与
    ;(async () => {
      try {
        const adminSupabase = createAdminClient()
        const { data: existingPoints } = await adminSupabase
          .from('user_points')
          .select('points_balance')
          .eq('user_id', user.id)
          .maybeSingle()

        // ポイント更新/挿入と取引履歴を並列実行
        const pointsOp = existingPoints
          ? adminSupabase
              .from('user_points')
              .update({
                points_balance: existingPoints.points_balance + 1000,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
          : adminSupabase.from('user_points').insert({
              user_id: user.id,
              points_balance: 1000,
            })

        await Promise.all([
          pointsOp,
          adminSupabase.from('points_transactions').insert({
            user_id: user.id,
            points: 1000,
            transaction_type: 'bonus',
            description: '新規登録ボーナス',
          }),
        ])
        console.log('新規登録ボーナスポイントを付与しました:', user.id)
      } catch (error) {
        console.error('ポイント付与エラー（非同期）:', error)
      }
    })()

    // プロフィール完成バッジを付与（非ブロッキング版）
    awardProfileCompleteBadge(user.id).catch((error) => {
      console.error('バッジ付与処理エラー（非同期）:', error)
    })

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
