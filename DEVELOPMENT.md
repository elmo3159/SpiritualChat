# 開発ガイドライン - スピチャ

## 🚀 クイックスタート

### 初回セットアップ
```bash
npm install
npm run dev
```

開発サーバーは **ポート3000** で起動します（Turbopackモード）。

## 📝 利用可能なnpmスクリプト

### 開発サーバー
```bash
# Turbopackモードで起動（推奨・デフォルト）
npm run dev

# 通常のWebpackモードで起動
npm run dev:normal

# クリーンビルドで起動
npm run dev:clean
```

### ビルド・起動
```bash
# 本番ビルド
npm run build

# 本番サーバー起動（ポート3000）
npm start

# ESLint実行
npm run lint
```

### クリーンアップ
```bash
# .nextフォルダのみ削除（推奨）
npm run clean:next

# .nextとnode_modulesを完全削除
npm run clean:all

# ポート3000を使用しているプロセスを停止
npm run kill-port

# 完全クリーンインストール + 起動
npm run fresh
```

## 🎯 Turbopackモード（推奨）

### Turbopackとは？

Next.js 14から利用可能な次世代バンドラーです。通常のWebpackに比べて：

✅ **最大700倍高速**なHMR（Hot Module Replacement）
✅ **初回起動が高速**
✅ **メモリ使用量が少ない**
✅ **Webpackエラーの多くを回避**

### 使い方

デフォルトで有効になっています：
```bash
npm run dev  # 自動的に --turbo フラグ付きで起動
```

もし問題が発生した場合は通常モードに切り替え：
```bash
npm run dev:normal
```

## ❌ よくある問題と解決方法

### 問題1: "Port 3000 is already in use"

**原因**: 前回の開発サーバーが終了していない

**解決方法**:
```bash
# ワンコマンドで解決
npm run kill-port

# または手動（PowerShell）
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
```

### 問題2: Webpackランタイムエラー

**エラー例**:
```
TypeError: Cannot read properties of undefined (reading 'call')
```

**解決方法**:

#### ステップ1: Turbopackモードを使う（推奨）
```bash
npm run dev  # デフォルトでTurbopackモード
```

#### ステップ2: クリーンビルド
```bash
npm run dev:clean
```

#### ステップ3: ブラウザキャッシュをクリア
1. Chrome DevToolsを開く（F12）
2. Application → Storage → Clear site data
3. ハードリフレッシュ（Ctrl+Shift+R）

#### ステップ4: 完全リセット（最終手段）
```bash
npm run fresh
```

### 問題3: Service Workerエラー

**解決方法**:
1. Chrome DevToolsを開く（F12）
2. Application → Service Workers
3. すべてのService Workerを「Unregister」
4. ページをハードリフレッシュ（Ctrl+Shift+R）

### 問題4: 複数の開発サーバーが起動している

**原因**: Ctrl+Cで停止せずにターミナルを閉じた

**解決方法**:
```bash
npm run kill-port
```

**防止方法**:
- ✅ サーバーは**常に1つだけ**起動
- ✅ 停止する際は必ず`Ctrl+C`を使用
- ✅ ターミナルを閉じる前にサーバーを停止

### 問題5: Fast Refreshが動作しない

**解決方法**:
```bash
# .nextフォルダのみ削除して再起動
npm run clean:next
npm run dev
```

## ✅ 開発のベストプラクティス

### 推奨される開発フロー

```bash
# 1. 開発開始
npm run dev

# 2. コード変更
#    → ファイル保存で自動的にHot Reload
#    → ブラウザが自動更新

# 3. 開発終了
#    → Ctrl+C でサーバーを停止
#    → ターミナルを閉じる
```

### 効率的なワークフロー

#### 通常の開発時
```bash
# Turbopackモードで起動（高速・安定）
npm run dev
```

#### キャッシュ問題が発生した場合
```bash
# .nextのみ削除して起動（10秒程度）
npm run dev:clean
```

#### それでも解決しない場合
```bash
# 完全クリーンインストール（数分かかる）
npm run fresh
```

### ❌ 避けるべき行動

- ❌ ターミナルを`Ctrl+C`せずに閉じる
- ❌ 複数のターミナルで`npm run dev`を実行
- ❌ 問題が発生するたびに`node_modules`を削除
- ❌ 開発サーバーを起動したまま別の開発サーバーを起動

### ✅ 推奨される行動

- ✅ Turbopackモードを使用（デフォルト）
- ✅ 問題発生時はまず`npm run clean:next`を試す
- ✅ サーバーは必ず`Ctrl+C`で停止
- ✅ `npm run fresh`は最終手段として使用

## 🔧 トラブルシューティング

### サーバーが起動しない

```bash
# 1. 既存のプロセスを停止
npm run kill-port

# 2. .nextを削除して再起動
npm run dev:clean
```

### 変更が反映されない

```bash
# 1. ブラウザをハードリフレッシュ
Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# 2. .nextを削除してサーバー再起動
npm run dev:clean

# 3. それでも解決しない場合
npm run fresh
```

### ビルドエラーが発生

```bash
# 1. 構文エラーを確認
npm run lint

# 2. TypeScriptエラーを確認
# エディタのエラー表示を確認

# 3. .nextを削除して再ビルド
npm run clean:next
npm run build
```

### "Cannot read properties of undefined" エラー

```bash
# Turbopackモードで解決（通常これで解決）
npm run dev

# または、クリーンビルド
npm run dev:clean
```

## 🎓 技術情報

### プロジェクト構成

- **Next.js 14**: App Router使用
- **TypeScript**: 型安全性の確保
- **Tailwind CSS**: ユーティリティファーストCSS
- **Supabase**: 認証・データベース
- **Gemini API**: AI占い機能
- **Stripe**: 決済システム

### 開発ポート

- **開発**: `http://localhost:3000`（固定）
- **本番**: Vercelにデプロイ

### パフォーマンス最適化

#### Turbopackの利点

1. **高速な起動**: Webpackの数倍高速
2. **効率的なHMR**: 変更が瞬時に反映
3. **メモリ効率**: 大規模プロジェクトでも安定
4. **エラー回避**: Webpack特有のエラーを回避

#### 開発環境の最適化

```javascript
// next.config.js
// Turbopackモード使用時は追加設定不要
```

## 📚 参考リンク

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)
- [Next.js Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 💡 開発のコツ

### デバッグ

```bash
# Next.jsのデバッグモードで起動
NODE_OPTIONS='--inspect' npm run dev
```

### ログ確認

```bash
# サーバーログを確認
# ターミナルに表示される

# ブラウザコンソールを確認
# F12 → Console タブ
```

### パフォーマンス測定

```bash
# ビルド時間の測定
npm run build

# バンドルサイズの確認
# .next/static を確認
```

## 🆘 それでも解決しない場合

1. **プロセスの完全停止**
   ```bash
   npm run kill-port
   taskkill /IM node.exe /F  # Windows
   ```

2. **完全クリーンインストール**
   ```bash
   npm run fresh
   ```

3. **Node.jsのバージョン確認**
   ```bash
   node --version  # v20以上推奨
   ```

4. **npm cacheのクリア**
   ```bash
   npm cache clean --force
   npm run fresh
   ```

## 📝 メモ

- Turbopackモードがデフォルトで有効
- ポート3000は固定設定
- 開発サーバーは常に1つだけ起動すること
- 問題発生時は`npm run dev:clean`を試すこと
- `npm run fresh`は時間がかかるため最終手段として使用
