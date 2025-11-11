// 郵便番号から住所を取得する（ZipCloud API使用）
export async function getAddressFromPostalCode(postalCode: string): Promise<{
  success: boolean
  address?: string
  prefecture?: string
  city?: string
  town?: string
  error?: string
}> {
  try {
    // ハイフンを除去
    const cleanedCode = postalCode.replace(/-/g, '')

    // 7桁の数字であることを確認
    if (!/^\d{7}$/.test(cleanedCode)) {
      return {
        success: false,
        error: '郵便番号は7桁の数字で入力してください',
      }
    }

    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedCode}`
    )

    if (!response.ok) {
      return {
        success: false,
        error: 'APIエラーが発生しました',
      }
    }

    const data = await response.json()

    if (data.status !== 200) {
      return {
        success: false,
        error: data.message || 'APIエラーが発生しました',
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: '該当する住所が見つかりませんでした',
      }
    }

    const result = data.results[0]
    const fullAddress = `${result.address1}${result.address2}${result.address3}`

    return {
      success: true,
      address: fullAddress,
      prefecture: result.address1,
      city: result.address2,
      town: result.address3,
    }
  } catch (error) {
    console.error('郵便番号検索エラー:', error)
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    }
  }
}
