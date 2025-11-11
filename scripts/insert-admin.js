/**
 * 管理者アカウントをデータベースに挿入するスクリプト
 *
 * このスクリプトはservice_role keyを使用してデータを直接挿入します
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.localを手動で読み込む
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...values] = trimmed.split('=')
    if (key && values.length > 0) {
      env[key.trim()] = values.join('=').trim()
    }
  }
})

async function main() {
  // Supabaseクライアントを作成（service_role keyを使用）
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('管理者アカウントをデータベースに挿入します...')

  // テスト管理者アカウントのデータ
  const adminData = {
    email: 'admin@example.com',
    name: 'System Administrator',
    password_hash: '$2a$10$Ma8GXqWk9Im2135hQebcquto2zTuquEU2VteBHjdnba6Bg1v/xxLC',
    role: 'superadmin',
    is_active: true,
  }

  // データを挿入
  const { data, error } = await supabase
    .from('admin_users')
    .upsert(adminData, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }

  console.log('✓ 管理者アカウントの挿入に成功しました！')
  console.log('')
  console.log('=== ログイン情報 ===')
  console.log('Email:', adminData.email)
  console.log('Password: admin123')
  console.log('')
  console.log('挿入されたデータ:', data)
}

main().catch((error) => {
  console.error('予期しないエラー:', error)
  process.exit(1)
})
