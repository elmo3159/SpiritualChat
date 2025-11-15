/**
 * プッシュ通知ユーティリティ
 *
 * Web Push APIを使用したプッシュ通知機能
 */

// VAPID公開鍵（環境変数から取得）
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

/**
 * Base64をUint8Arrayに変換
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * プッシュ通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('このブラウザはプッシュ通知をサポートしていません')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * 現在の通知許可状態を取得
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) {
    return null
  }
  return Notification.permission
}

/**
 * プッシュ通知のサブスクリプションを作成
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('プッシュ通知はサポートされていません')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // 既存のサブスクリプションを確認
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // 新しいサブスクリプションを作成
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })
    }

    return subscription
  } catch (error) {
    console.error('プッシュ通知のサブスクリプション作成エラー:', error)
    return null
  }
}

/**
 * プッシュ通知のサブスクリプションを解除
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('プッシュ通知のサブスクリプション解除エラー:', error)
    return false
  }
}

/**
 * サーバーにサブスクリプションを保存
 */
export async function saveSubscriptionToServer(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })

    return response.ok
  } catch (error) {
    console.error('サブスクリプション保存エラー:', error)
    return false
  }
}

/**
 * サーバーからサブスクリプションを削除
 */
export async function removeSubscriptionFromServer(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })

    return response.ok
  } catch (error) {
    console.error('サブスクリプション削除エラー:', error)
    return false
  }
}

/**
 * プッシュ通知を有効化（許可リクエスト → サブスクリプション作成 → サーバー保存）
 */
export async function enablePushNotifications(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 通知許可をリクエスト
    const permission = await requestNotificationPermission()

    if (permission !== 'granted') {
      return {
        success: false,
        error: '通知の許可が必要です',
      }
    }

    // サブスクリプションを作成
    const subscription = await subscribeToPushNotifications()

    if (!subscription) {
      return {
        success: false,
        error: 'サブスクリプションの作成に失敗しました',
      }
    }

    // サーバーに保存
    const saved = await saveSubscriptionToServer(subscription)

    if (!saved) {
      return {
        success: false,
        error: 'サーバーへの保存に失敗しました',
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '予期しないエラーが発生しました',
    }
  }
}

/**
 * プッシュ通知を無効化（サブスクリプション解除 → サーバーから削除）
 */
export async function disablePushNotifications(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      // サーバーから削除
      await removeSubscriptionFromServer(subscription)

      // サブスクリプションを解除
      await unsubscribeFromPushNotifications()
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '予期しないエラーが発生しました',
    }
  }
}
