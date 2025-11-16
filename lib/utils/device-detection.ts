/**
 * デバイス検出ユーティリティ
 */

/**
 * iOSデバイスかどうかを判定
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

/**
 * Safariブラウザかどうかを判定
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
}

/**
 * PWAとしてインストール済みかどうかを判定
 */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false

  // スタンドアロンモードで実行されているかチェック
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  // iOS Safari固有のチェック
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true
  }

  return false
}

/**
 * iOSでPWAインストールガイドを表示すべきかどうかを判定
 */
export function shouldShowIOSInstallGuide(): boolean {
  return isIOS() && isSafari() && !isInstalled()
}

/**
 * PWAインストールガイドを表示しない設定を保存
 */
export function setInstallGuideHidden() {
  if (typeof window === 'undefined') return
  localStorage.setItem('pwa-install-guide-hidden', 'true')
}

/**
 * PWAインストールガイドを表示しない設定を取得
 */
export function isInstallGuideHidden(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('pwa-install-guide-hidden') === 'true'
}

/**
 * PWAインストールガイドを表示しない設定をリセット
 */
export function resetInstallGuideHidden() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pwa-install-guide-hidden')
}
