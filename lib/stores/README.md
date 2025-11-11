# Zustand状態管理

このディレクトリには、アプリ全体で使用される状態管理ストアが含まれています。

## 📋 目次

- [概要](#概要)
- [インストール済みストア](#インストール済みストア)
- [使用方法](#使用方法)
- [ベストプラクティス](#ベストプラクティス)
- [注意事項](#注意事項)

## 概要

Next.js 14 App Routerのベストプラクティスに従い、以下の原則でZustandを使用しています：

- **Server Componentsでは使用しない**: ストアはClient Componentsでのみ使用
- **最小限の状態管理**: データ取得はServer Componentsで行い、Zustandは本当に必要な状態のみを管理
- **型安全**: TypeScriptで完全に型付け
- **単一責任**: 各ストアは単一の責任を持つ

## インストール済みストア

### 1. UI Store (`ui-store.ts`)

アプリ全体のUI状態を管理します。

**管理する状態：**
- ハンバーガーメニューの開閉
- モーダルの開閉とコンテンツ
- ローディング状態
- エラーメッセージ

**使用例：**

```tsx
'use client'

import { useUIStore } from '@/lib/stores'

export default function Header() {
  const { isMenuOpen, toggleMenu, openModal } = useUIStore()

  return (
    <header>
      <button onClick={toggleMenu}>
        {isMenuOpen ? '閉じる' : 'メニュー'}
      </button>
      <button onClick={() => openModal('points')}>
        ポイント購入
      </button>
    </header>
  )
}
```

### 2. Points Store (`points-store.ts`)

ユーザーのポイント残高を管理します。

**管理する状態：**
- 現在のポイント残高
- ローディング状態
- エラー状態
- 最終更新日時

**使用例：**

```tsx
'use client'

import { usePointsStore } from '@/lib/stores'
import { useEffect } from 'react'

export default function PointsDisplay() {
  const { points, setPoints, isLoading } = usePointsStore()

  // Supabaseからポイントを取得
  useEffect(() => {
    async function fetchPoints() {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_points')
        .select('points')
        .single()

      if (data) {
        setPoints(data.points)
      }
    }

    fetchPoints()
  }, [setPoints])

  if (isLoading) return <div>読み込み中...</div>

  return (
    <div className="text-lg font-bold">
      {points} <span className="text-sm">ポイント</span>
    </div>
  )
}
```

## 使用方法

### 1. Client Componentでの使用

```tsx
'use client' // 必ずこの行を追加！

import { useUIStore, usePointsStore } from '@/lib/stores'

export default function MyComponent() {
  // ストアから必要な状態とアクションを取得
  const { isMenuOpen, toggleMenu } = useUIStore()
  const { points, addPoints } = usePointsStore()

  return (
    <div>
      <p>ポイント: {points}</p>
      <button onClick={() => addPoints(100)}>
        100ポイント追加
      </button>
    </div>
  )
}
```

### 2. 特定の値のみを購読（パフォーマンス最適化）

```tsx
'use client'

import { useUIStore } from '@/lib/stores'

export default function MenuButton() {
  // isMenuOpenのみを購読（他の状態変更では再レンダリングされない）
  const isMenuOpen = useUIStore((state) => state.isMenuOpen)
  const toggleMenu = useUIStore((state) => state.toggleMenu)

  return (
    <button onClick={toggleMenu}>
      {isMenuOpen ? '閉じる' : '開く'}
    </button>
  )
}
```

## ベストプラクティス

### ✅ 推奨される使い方

```tsx
// ✅ Client Componentで使用
'use client'

import { useUIStore } from '@/lib/stores'

export default function ClientComponent() {
  const { isLoading, setLoading } = useUIStore()
  // ...
}
```

```tsx
// ✅ Server ComponentでデータをフェッチしてClient Componentに渡す
// app/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import ClientComponent from './ClientComponent'

export default async function Page() {
  const supabase = await createClient()
  const { data: points } = await supabase
    .from('user_points')
    .select('points')
    .single()

  return <ClientComponent initialPoints={points} />
}

// ClientComponent.tsx (Client Component)
'use client'
import { usePointsStore } from '@/lib/stores'
import { useEffect } from 'react'

export default function ClientComponent({ initialPoints }) {
  const setPoints = usePointsStore((state) => state.setPoints)

  useEffect(() => {
    setPoints(initialPoints)
  }, [initialPoints, setPoints])

  // ...
}
```

### ❌ 避けるべき使い方

```tsx
// ❌ Server Componentでストアを使用しない
// app/page.tsx (Server Component)
import { useUIStore } from '@/lib/stores' // エラー！

export default async function Page() {
  const { isLoading } = useUIStore() // これは動作しません
  // ...
}
```

```tsx
// ❌ グローバル変数としてストアを初期化しない
const globalStore = useUIStore() // エラー！
export default function Component() {
  // ...
}
```

## 注意事項

### Server Components vs Client Components

- **Server Components**: データ取得、不変データの表示に使用
- **Client Components**: ユーザーインタラクション、状態管理、ブラウザAPIの使用

### Hydration Errors

LocalStorageなどのブラウザAPIを使用する場合は、hydration errorsを防ぐために注意が必要です：

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/lib/stores'

export default function Component() {
  const [mounted, setMounted] = useState(false)
  const { isMenuOpen } = useUIStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Hydration完了まで何も表示しない

  return <div>{isMenuOpen ? 'Open' : 'Closed'}</div>
}
```

### Supabase Realtimeとの統合

Supabase Realtimeでデータの変更を監視し、ストアを更新する例：

```tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePointsStore } from '@/lib/stores'

export default function PointsSubscription() {
  const setPoints = usePointsStore((state) => state.setPoints)

  useEffect(() => {
    const supabase = createClient()

    // ポイントの変更をリアルタイムで監視
    const channel = supabase
      .channel('points-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_points'
        },
        (payload) => {
          setPoints(payload.new.points)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setPoints])

  return null
}
```

## 参考資料

- [Zustand公式ドキュメント](https://zustand.docs.pmnd.rs/)
- [Next.js 14 App Router + Zustand](https://zustand.docs.pmnd.rs/guides/nextjs)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
