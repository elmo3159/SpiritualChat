/**
 * AIが生成したテキストから不要な文字列を削除するユーティリティ関数
 */

/**
 * メッセージテキストをクリーンアップ
 *
 * - 改行指示文字列（様々な形式）を削除
 * - <br>タグを削除
 * - その他のHTMLタグを削除
 * - 連続する空行を整理
 *
 * @param text クリーンアップ対象のテキスト
 * @returns クリーンアップされたテキスト
 */
export function cleanupMessageText(text: string): string {
  if (!text) return text

  let cleaned = text

  // 改行指示文字列のパターン（様々な形式に対応）
  const lineBreakPatterns = [
    /\*\*[（(]改行[2２二]?回?[）)]\*\*/g,      // **（改行2回）**、**(改行2回)**
    /\*\*[（(]改行[）)]\*\*/g,                 // **（改行）**、**(改行)**
    /[（(]改行[2２二]?回?[）)]/g,              // （改行2回）、(改行2回)
    /[（(]改行[）)]/g,                         // （改行）、(改行)
    /\*\*改行[2２二]?回?\*\*/g,                // **改行2回**
    /\*\*改行\*\*/g,                           // **改行**
    /改行[2２二]?回?指示/g,                    // 改行2回指示
    /改行を[2２二]?回?入れ/g,                  // 改行を2回入れ
  ]

  // すべての改行指示パターンで置換
  lineBreakPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // <br>、<br/>、<br />タグを削除
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '')
  cleaned = cleaned.replace(/<br\s*\/?\s*><br\s*\/?>/gi, '')

  // その他のHTMLタグを削除（念のため）
  cleaned = cleaned.replace(/<[^>]+>/g, '')

  // 連続する空行（4行以上の改行）を3行に整理
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')

  // 先頭と末尾の余分な空白を削除
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * 鑑定結果の3つのメッセージをクリーンアップ
 *
 * @param divination 鑑定結果オブジェクト
 * @returns クリーンアップされた鑑定結果オブジェクト
 */
export function cleanupDivinationMessages(divination: {
  greetingMessage: string
  resultMessage: string
  afterMessage: string
}): {
  greetingMessage: string
  resultMessage: string
  afterMessage: string
} {
  return {
    greetingMessage: cleanupMessageText(divination.greetingMessage),
    resultMessage: cleanupMessageText(divination.resultMessage),
    afterMessage: cleanupMessageText(divination.afterMessage),
  }
}
