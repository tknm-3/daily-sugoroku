# 日記すごろく 仕様書

**バージョン**: 0.1
**最終更新**: 2026-05

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| アプリ名 | 日記すごろく |
| コンセプト | 家族の日記がすごろくになる、思い出と遊びが一体化したアプリ |
| ターゲット | 幼稚園〜小学校低学年の子ども＋親 |
| デプロイ | 無料（Vercel + Supabase） |

---

## 2. ユーザー・認証

### 家族グループ
- 招待コード（6桁）で家族グループを作成・参加
- メンバーには `parent` / `child` のロールを付与
- 認証: Supabase Auth（メール + パスワード or マジックリンク）

### ユーザープロフィール
- 名前（ひらがな対応）
- アバター絵文字（コマとして使用）
- ロール: `parent` / `child`
- のびっこポイント（累積）

---

## 3. 日記入力

### 子どもモード（選択式）

全タップで完結。文字入力は任意。

```
Step 1: きょうのきもちは？（絵文字をタップ）
  😄うれしい  🥰だいすき  😲びっくり  😴ねむい  🥲かなしい  😡おこった

Step 2: どこで？
  おうち / ようちえん / こうえん / おでかけ / その他

Step 3: だれと？
  ママ / パパ / きょうだい / おともだち / せんせい / ひとり / その他

Step 4: なにした？
  あそんだ / たべた / おべんきょう / おてつだい / その他

Step 5: ひとこと（任意）
  └ テキスト入力 or 「おとなに書いてもらう」ボタン

Step 6: しゃしん（任意）
```

### 親モード（自由入力）

- テキスト自由入力
- 気持ちタグ（任意で選択式と同じラベル）
- 写真添付（任意）

---

## 4. 気持ち → マス効果の自動マッピング

| 気持ち | マス効果 | 効果値 |
|---|---|---|
| 😄 うれしい | MOVE_FORWARD | +2 |
| 🥰 だいすき | MOVE_FORWARD | +3 |
| 😲 びっくり | EXTRA_DICE | — |
| 😴 ねむい | SKIP | 1回やすみ |
| 🥲 かなしい | MOVE_BACK | -1 |
| 😡 おこった | MOVE_BACK | -2 |
| （未設定） | NONE | 効果なし |

---

## 5. シーズン（1週間）

| 項目 | 内容 |
|---|---|
| 期間 | 月曜〜日曜（1週間） |
| テーマ選択 | シーズン開始時に家族で1つ選ぶ |
| 盤面生成 | 週末（日曜夜）に自動生成 |
| プレイタイミング | 週末に家族で集まってプレイ |

### テーマ一覧

| ID | テーマ名 | 絵文字 |
|---|---|---|
| `forest` | もりのたんけん | 🌳 |
| `space` | うちゅうぼうけん | 🚀 |
| `ocean` | うみのぼうけん | 🌊 |
| `home` | まほうのおうち | 🏠 |
| `hero` | ヒーローとかいじゅう | 🦸 |
| `dream` | ゆめのくに | 🌈 |

テーマを選ぶと以下が切り替わる：
- 盤面の背景グラデーション・アイコン
- ハプニングマスの内容
- ゴール演出のメッセージ

---

## 6. 盤面設計

### マス構成（1シーズン）

| 種類 | 枚数 | 内容 |
|---|---|---|
| 日記マス | 15〜20枚 | 家族の日記から自動生成 |
| ハプニングマス | 10〜12枚 | テーマ別ランダムイベント |
| ちいさなおねがいマス | 2〜3枚 | ★推し機能1 |
| スタート / ゴール | 2枚 | 固定 |
| **合計** | **約30〜37枚** | |

### 盤面生成ロジック

```
1. 今週の日記マスを全件収集（diary_entries）
2. テーマに対応するハプニングを10〜12件ランダム選出
3. ちいさなおねがいマスを2〜3枚挿入
4. 全マスをシャッフル
5. board[0] = スタート固定、board[最後] = ゴール固定
6. board_json としてシーズンに保存（以後変更なし）
```

### ハプニングマス（テーマ別・各10枚）

#### 🌳 もりのたんけん

| テキスト | 効果 |
|---|---|
| こびとにみちを教えてもらった！ | 3マスすすむ |
| おおかみにおいかけられた！ | スタートにもどる |
| まほうのきのみを食べた！ | もう1回サイコロ |
| きが急に歩き出した！ | 全員2マスすすむ |
| ようせいがいたずらした！ | だれかとコマ交換 |
| ぬかるみにはまった！ | 1回やすみ |
| たからの地図を発見！ | 5マスすすむ |
| まほうの泉を発見！ | 好きな場所へ移動 |
| もりのおうちで道に迷った | 2マスもどる |
| にじいろのちょうちょが道案内 | もう1回サイコロ |

#### 🚀 うちゅうぼうけん

| テキスト | 効果 |
|---|---|
| ブラックホールに吸い込まれた！ | 5マスもどる |
| うちゅう人とともだちになった！ | 好きな場所へワープ |
| いんせきをよけた！ | もう1回サイコロ |
| 無重力でういた！ | 1回やすみ |
| 宇宙ステーションを発見！ | 4マスすすむ |
| ロケットエンジンこしょう | 3マスもどる |
| 星の王子様と出会った！ | 全員2マスすすむ |
| 宇宙海賊が現れた！ | だれかとコマ交換 |
| 流れ星に乗った！ | 5マすすむ |
| 宇宙人の歌を聞いた | もう1回サイコロ |

#### 🌊 うみのぼうけん

| テキスト | 効果 |
|---|---|
| 人魚が歌ってくれた！ | 3マスすすむ |
| サメに追いかけられた！ | 1回やすみ |
| たからばこを発見！ | 全員2マすすむ |
| たこに足をつかまれた！ | だれかとコマ交換 |
| 波に乗って飛んだ！ | もう1回サイコロ |
| あらしが来た！ | 4マスもどる |
| 海の女王様に会った | 好きな場所へ移動 |
| くじらの背中で昼寝した | 1回やすみ（幸せ） |
| 光る魚に案内された | 3マスすすむ |
| 海底神殿を発見！ | 5マスすすむ |

#### 🏠 まほうのおうち

| テキスト | 効果 |
|---|---|
| ぬいぐるみが夜中に動いてた！ | 1回やすみ |
| れいぞうこがおかしであふれた！ | 全員3マスすすむ |
| かくしドアを発見！ | 好きな場所へワープ |
| まほうのほうきが暴走！ | 3マスもどる |
| テーブルが空を飛んだ！ | 5マスすすむ |
| おふろが温泉になった！ | もう1回サイコロ |
| 鏡の中に入れた！ | だれかとコマ交換 |
| おもちゃが反乱した！ | 2マスもどる |
| にわから宝が出てきた！ | 全員2マスすすむ |
| まどからにじの橋が出た | 好きな場所へ移動 |

#### 🦸 ヒーローとかいじゅう

| テキスト | 効果 |
|---|---|
| かいじゅう出現！ | 3マスもどる |
| ヒーローに変身！ | もう2回サイコロ |
| 秘密基地を発見！ | 5マスすすむ |
| 悪者にやられた！ | 1回やすみ |
| 必殺技が決まった！ | 全員3マスすすむ |
| 仲間を助けた！ | 好きな場所へ移動 |
| わなにかかった！ | 2マスもどる |
| 新しい武器をゲット！ | もう1回サイコロ |
| 変装がバレた！ | だれかとコマ交換 |
| 街を守った！ | 4マスすすむ |

#### 🌈 ゆめのくに

| テキスト | 効果 |
|---|---|
| 空を飛んだ！ | 好きな場所へ移動 |
| ケーキの山を発見！ | 全員3マスすすむ |
| 時計が逆に動いた | 3マスもどる |
| しゃべる動物が道案内 | もう1回サイコロ |
| おかしの雨が降った！ | 全員2マスすすむ |
| 夢の中でまた夢を見た | 2マスもどる |
| まほうのつえを手に入れた！ | 5マスすすむ |
| 夢から覚めそうになった | 1回やすみ |
| にじの橋を渡った！ | 4マスすすむ |
| しあわせのようせいに会えた！ | だれかとコマ交換 |

---

## 7. ★ ちいさなおねがいマス（推し機能 No.1）

止まった人に向けて、固定リストからランダムに「ちいさなお願い」が発動。
リアルな体験と連動するが、内容はマイルドで安心設計。

### デフォルトリスト

1. ぎゅってして！（ハグ）
2. ハイタッチしよう！
3. いいところを1つ言ってもらおう
4. みんなでジャンプ3回！
5. かたたたき1回
6. いっしょに写真をとろう！
7. すきな食べ物を教えて！
8. すきな動物を教えて！
9. 10秒間だけ王様・女王様になる
10. 今すぐ変顔をしてみせて！

### カスタム機能（Phase 2）

- 親アカウントからリストに追加・削除できる
- NGなお願いは事前に除外可能
- 家族オリジナルのお願いを追加可能

---

## 8. ★ コマが育つ（推し機能 No.2）

日記を書くたびに「のびっこポイント（NP）」が溜まり、コマキャラクターが成長する。
シーズンをまたいで累積するため、継続して書くモチベーションになる。

### 成長段階

| NP | 段階 | アバター | 説明 |
|---|---|---|---|
| 0〜4 | たまご | 🥚 | はじまりのすがた |
| 5〜14 | ひよこ | 🐣 | すこし成長 |
| 15〜29 | こども | 🐤 | ぼうしがついた |
| 30〜49 | おとな | 🐥 | かっこいいかっこう |
| 50〜 | ヒーロー | 🦸 | さいきょうのすがた！ |

### NPの取得

| アクション | 取得NP |
|---|---|
| 日記を書く（基本） | +1 |
| 写真つきで書く | +2 |
| ひとこと入力あり | +2 |
| 3日連続で書く | +3（ボーナス） |

---

## 9. データモデル

```sql
-- 家族グループ
families (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code CHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- ユーザー
users (
  id UUID PRIMARY KEY,         -- Supabase Auth の uid と一致
  family_id UUID REFERENCES families,
  name_ja TEXT NOT NULL,
  role TEXT CHECK (role IN ('parent', 'child')),
  avatar_emoji TEXT DEFAULT '🐣',
  nobi_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- ハプニングイベント（マスターデータ）
happening_events (
  id UUID PRIMARY KEY,
  theme_id TEXT NOT NULL,      -- forest / space / ocean / home / hero / dream
  title_ja TEXT NOT NULL,
  effect_type TEXT NOT NULL,   -- MOVE_FORWARD / MOVE_BACK / SKIP / EXTRA_DICE /
                               --   MOVE_ALL / SWAP / WARP_START / FREE_MOVE
  effect_value INTEGER,        -- +3, -2 など（該当しない場合はNULL）
  emoji TEXT
)

-- ちいさなおねがいリスト
wish_items (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families,   -- NULLならデフォルト
  text_ja TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
)

-- 日記エントリ
diary_entries (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families,
  user_id UUID REFERENCES users,
  entry_date DATE NOT NULL,
  mood TEXT,                   -- happy / love / surprised / sleepy / sad / angry
  location TEXT,               -- home / school / park / outing / other
  partner TEXT,                -- mama / papa / sibling / friend / teacher / alone / other
  activity TEXT,               -- play / eat / study / help / other
  note_text TEXT,
  photo_url TEXT,
  effect_type TEXT,            -- 自動マッピング結果
  effect_value INTEGER,
  np_awarded INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- シーズン
seasons (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families,
  theme_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  board_json JSONB,            -- 生成済みマス配列（順序固定・以後変更なし）
  status TEXT DEFAULT 'preparing'
                               -- preparing / playing / finished
)

-- プレイヤー状態
players (
  season_id UUID REFERENCES seasons,
  user_id UUID REFERENCES users,
  position INTEGER DEFAULT 0,
  finished_at TIMESTAMPTZ,
  PRIMARY KEY (season_id, user_id)
)

-- サイコロ履歴
dice_rolls (
  id UUID PRIMARY KEY,
  season_id UUID REFERENCES seasons,
  user_id UUID REFERENCES users,
  value INTEGER NOT NULL,
  from_pos INTEGER,
  to_pos INTEGER,
  effect_applied JSONB,        -- 発動したマス効果の記録
  rolled_at TIMESTAMPTZ DEFAULT NOW()
)
```

### board_json の構造

```json
[
  { "index": 0, "type": "start" },
  { "index": 1, "type": "diary", "entry_id": "uuid", "effect_type": "MOVE_FORWARD", "effect_value": 2 },
  { "index": 2, "type": "happening", "event_id": "uuid", "title": "こびとにみちを教えてもらった！", "effect_type": "MOVE_FORWARD", "effect_value": 3 },
  { "index": 3, "type": "wish", "effect_type": "WISH" },
  { "index": 32, "type": "goal" }
]
```

---

## 10. 技術スタック（無料デプロイ前提）

| レイヤ | 技術 | 備考 |
|---|---|---|
| フロントエンド | Next.js 15 (App Router) | TypeScript |
| ホスティング | Vercel Hobby | 家族規模なら無料枠内 |
| 認証・DB | Supabase | Auth + Postgres + Storage |
| 画像ストレージ | Supabase Storage | 1GB無料（写真少なめ前提） |
| スタイル | Tailwind CSS | |
| AI（将来） | Gemini API Flash-Lite | 無料枠あり・後から差し込み |
| プッシュ通知（Phase2）| Web Push (PWA) | 無料 |

### AI の方針

- **Phase 1〜2はAIなし**で完全動作する設計にする
- `lib/ai/` ディレクトリを分離しておき、後から差し込み可能にする
- AI使う場合の用途候補：
  - 月次振り返りサマリ（日記を要約して思い出コメント生成）
  - マス名の可愛い自動命名
- **プライバシー注意**：Gemini無料枠は入力がモデル学習に使われる場合あり → 固有名詞マスクを推奨

---

## 11. 画面一覧

| パス | 画面名 | 説明 |
|---|---|---|
| `/` | トップ | ログイン / 新規登録 |
| `/family/setup` | 家族設定 | グループ作成・招待コード発行 |
| `/home` | ホーム | 今週の状況・日記入力ボタン |
| `/diary/new` | 日記入力 | 子どもモード / 親モード切替 |
| `/season/theme` | テーマ選択 | シーズン開始時に家族で選ぶ |
| `/season/board` | すごろく盤面 | サイコロ・コマ移動・効果発動 |
| `/season/result` | シーズン結果 | ゴール演出・賞状（Phase2） |
| `/history` | 過去のシーズン | 思い出アルバム（Phase2） |
| `/profile` | プロフィール | コマ成長・NPポイント確認 |
| `/family/settings` | 家族設定 | お願いリスト管理・メンバー管理 |

---

## 12. MVPスコープ

### Phase 1（最初に動かすもの）

- [ ] 家族グループ作成・招待コード認証（Supabase Auth）
- [ ] ユーザープロフィール作成（名前・アバター絵文字・ロール）
- [ ] 選択式日記入力（子どもモード）
- [ ] テキスト日記入力（親モード）
- [ ] 気持ち → マス効果の自動マッピング
- [ ] テーマ選択UI（6種類）
- [ ] 盤面生成（日記マス + ハプニングマス + おねがいマス）
- [ ] すごろくUI（盤面表示・サイコロ・コマ移動・効果発動）
- [ ] ちいさなおねがいマス（デフォルトリスト）

### Phase 2（楽しさ拡張）

- [ ] コマが育つ（NPポイント + アバター成長段階）
- [ ] 写真添付
- [ ] 賞状・ゴール演出
- [ ] ストリーク（3日連続ボーナス）
- [ ] お願いリストのカスタマイズ（親管理）
- [ ] 書き忘れ通知（Web Push / PWA対応）
- [ ] 季節テーマ自動提案（月日で判定）

### Phase 3（将来）

- [ ] AI機能（月次振り返りサマリ・マス名自動生成）
- [ ] 賞状PDF出力（印刷対応）
- [ ] シーズンアルバム（思い出振り返りページ）
- [ ] 記念日自動マス挿入
- [ ] 家族投票（今週のMVP日記）
- [ ] 家族間のコメント・リアクション
