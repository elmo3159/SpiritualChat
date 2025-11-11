/**
 * 管理者アカウント作成スクリプト
 *
 * パスワードをハッシュ化して表示します
 */
const bcrypt = require('bcryptjs')

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

async function main() {
  const password = 'admin123'
  const hash = await hashPassword(password)

  console.log('\n=== 管理者アカウント作成用SQLクエリ ===\n')
  console.log('-- テスト管理者アカウント')
  console.log('-- Email: admin@example.com')
  console.log('-- Password: admin123')
  console.log('')
  console.log(`INSERT INTO admin_users (email, name, password_hash, role)`)
  console.log(`VALUES ('admin@example.com', 'System Administrator', '${hash}', 'superadmin');`)
  console.log('')
}

main().catch(console.error)
