import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/**
 * 管理者認証ユーティリティ
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7日間有効

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: string
  type: 'admin'
}

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * パスワードを検証
 */
export async function verifyAdminPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * 管理者用JWTトークンを生成
 */
export function generateAdminToken(
  adminId: string,
  email: string,
  role: string
): string {
  const payload: AdminTokenPayload = {
    adminId,
    email,
    role,
    type: 'admin',
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 管理者用JWTトークンを検証
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload

    // 管理者トークンであることを確認
    if (decoded.type !== 'admin') {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * トークンをリフレッシュ
 */
export function refreshAdminToken(currentToken: string): string | null {
  const payload = verifyAdminToken(currentToken)
  if (!payload) {
    return null
  }

  return generateAdminToken(payload.adminId, payload.email, payload.role)
}

/**
 * サーバー側で現在の管理者情報を取得
 * （Server Componentsで使用）
 */
export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    return null
  }

  return verifyAdminToken(token)
}
