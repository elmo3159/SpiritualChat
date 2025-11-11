# データベースシードスクリプト

このディレクトリには、Supabaseデータベースの初期データを投入するためのSQLスクリプトが含まれています。

## 📋 実行手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクト「pkzavhhgvkmxyvwywqgs」を選択
3. 左側メニューから **SQL Editor** をクリック

### 2. 占い師データのシード実行

1. SQL Editorで「New query」をクリック
2. `scripts/seed-fortune-tellers.sql` ファイルの内容をコピー＆ペースト
3. 「Run」ボタンをクリックして実行

**注意事項：**
- このスクリプトは冪等性があり、複数回実行しても安全です（`IF NOT EXISTS`を使用）
- 既にデータが存在する場合は、INSERT部分でエラーが出る可能性があります
- その場合は、INSERT文の前に以下を追加して実行してください：
  ```sql
  TRUNCATE TABLE fortune_tellers CASCADE;
  ```

### 3. データの確認

実行後、以下のクエリでデータが正しく挿入されたか確認できます：

```sql
SELECT name, title, rating, is_active
FROM fortune_tellers
ORDER BY rating DESC;
```

**期待される結果：**
- 5人の占い師データが表示される
- 全員の `is_active` が `true`
- 評価（rating）は4.7〜5.0の範囲

## 🎭 登録される占い師

| 名前 | 専門 | 評価 |
|------|------|------|
| 月詠 みのり | 月のタロット占い（恋愛運） | 4.8 |
| 星野 あかり | 西洋占星術（仕事運） | 4.9 |
| 桜庭 ゆかり | 霊感タロット（総合運） | 5.0 |
| 天宮 りん | 数秘術・九星気学（金運） | 4.7 |
| 紫苑 まひる | 前世占い・カルマリーディング | 4.9 |

## 🔧 トラブルシューティング

### エラー: "relation does not exist"

テーブルが作成されていません。スクリプト全体を実行してください。

### エラー: "duplicate key value violates unique constraint"

既にデータが存在します。以下のいずれかを実行：

1. **データをクリアして再投入する場合：**
   ```sql
   TRUNCATE TABLE fortune_tellers CASCADE;
   -- その後、INSERT文を実行
   ```

2. **既存データを保持する場合：**
   - INSERT文をスキップして、既存データを使用

### RLSポリシーのエラー

RLSポリシーが既に存在する場合、`IF NOT EXISTS`が機能しないことがあります。その場合は該当行をコメントアウトしてください。

## 📝 スクリプトの内容

### `seed-fortune-tellers.sql`

このスクリプトは以下を実行します：

1. **テーブル作成** (`CREATE TABLE IF NOT EXISTS`)
   - `fortune_tellers` テーブルの作成
   - 必要なカラムとデータ型の定義

2. **Row Level Security (RLS) 設定**
   - テーブルへのRLS有効化
   - 閲覧用ポリシーの作成

3. **初期データ投入**
   - 5人の占い師データをINSERT
   - 各占い師のプロフィール、専門分野、システムプロンプトを設定

4. **トリガー設定**
   - `updated_at` カラムの自動更新トリガー

## 🚀 開発環境での確認方法

シード実行後、開発サーバーで占い師一覧ページを確認：

1. 開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3001` にアクセス

3. ログイン後、5人の占い師が表示されることを確認

## 📚 参考情報

- [Supabase SQL Editor ドキュメント](https://supabase.com/docs/guides/database/sql-editor)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
