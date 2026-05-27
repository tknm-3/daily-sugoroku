# 日記すごろく

家族の日記がすごろくになるアプリ。毎週の日記をもとにすごろく盤を自動生成し、家族みんなで楽しめます。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) / TypeScript / Tailwind CSS
- **バックエンド**: Supabase (Auth + Postgres + Storage)
- **デプロイ**: Vercel

---

## ローカル開発セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/tknm-3/daily-sugoroku.git
cd daily-sugoroku
npm install
```

### 2. Supabase プロジェクトの準備

[Supabase](https://supabase.com) で新しいプロジェクトを作成してください。

### 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、Supabase の値を入力します。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

値は Supabase ダッシュボード → Project Settings → API から取得できます。

### 4. マイグレーションとシードデータの適用

Supabase CLI をインストールして、マイグレーションを適用します。

```bash
npm install -g supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

または Supabase ダッシュボードの **SQL Editor** で以下のファイルを順番に実行してください。

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_fix_families_rls.sql`
4. `supabase/seed.sql`（マスターデータ投入）

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 本番デプロイ（GitHub Actions）

### 必要な GitHub Secrets

| Secret | 説明 |
|--------|------|
| `VERCEL_TOKEN` | Vercel のアクセストークン |
| `VERCEL_ORG_ID` | Vercel の Organization ID |
| `VERCEL_PROJECT_ID` | Vercel のプロジェクト ID |
| `SUPABASE_DB_URL` | Supabase の PostgreSQL 接続文字列 |

`SUPABASE_DB_URL` は Supabase ダッシュボード → Project Settings → Database → **Connection string (URI)** から取得できます。

### デプロイフロー

`main` ブランチへのプッシュで自動的に以下が実行されます。

1. Supabase マイグレーションを本番 DB に適用（`supabase db push`）
2. Vercel へビルド・デプロイ

---

## アプリの使い方

1. **新規登録** → メールアドレスとパスワードで登録
2. **かぞくのせってい** → 家族グループを作成（招待コードが発行される）
3. **家族を招待** → 招待コードを家族に共有し、参加してもらう
4. **日記を書く** → 毎日、気持ちと出来事を記録
5. **テーマを選ぶ** → 週末に今週のすごろくテーマを選択
6. **盤面を生成** → 今週の日記からすごろく盤を自動生成
7. **すごろくで遊ぶ** → 家族みんなでサイコロを振って楽しむ！
