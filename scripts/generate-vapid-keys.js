/**
 * VAPIDキー生成スクリプト
 *
 * Web Push通知に必要なVAPIDキーペアを生成します
 *
 * 使用方法:
 * node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push')

console.log('VAPIDキーペアを生成しています...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('生成されたVAPIDキー:\n')
console.log('公開鍵 (NEXT_PUBLIC_VAPID_PUBLIC_KEY):')
console.log(vapidKeys.publicKey)
console.log('\n秘密鍵 (VAPID_PRIVATE_KEY):')
console.log(vapidKeys.privateKey)
console.log('\n')
console.log('これらのキーを.env.localファイルに追加してください:')
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
console.log('VAPID_SUBJECT=mailto:your-email@example.com')
console.log('\n⚠️ 秘密鍵は絶対に公開しないでください！')
