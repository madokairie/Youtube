# SEO Article Factory - 機能仕様書

**バージョン**: 0.1.0
**作成日**: 2026-03-06
**ソース**: docs/requirements/requirements.md

---

## 1. システムアーキテクチャ

```
[Browser]
    |
[Next.js App (App Router)]
    |
    ├── /app/dashboard        → ダッシュボード
    ├── /app/analysis         → 自動分析（SC/GA）
    ├── /app/competitors      → 競合分析
    ├── /app/suggestions      → 記事提案
    ├── /app/articles/new     → 記事作成（構成→本文）
    ├── /app/articles/[id]    → 記事編集
    ├── /app/distribute       → プラットフォーム横展開
    ├── /app/tracking         → 順位トラッキング
    └── /app/settings         → 設定
    |
[API Routes (/app/api/)]
    |
    ├── Google Search Console API
    ├── Google Analytics Data API (GA4)
    ├── SerpAPI
    ├── Claude API (Anthropic)
    └── Supabase (PostgreSQL)
```

### 1.1 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| Frontend | Next.js (App Router) | 15.x |
| UI | shadcn/ui + Tailwind CSS | v4 |
| State | Zustand | 5.x |
| Charts | Recharts | 2.x |
| Editor | Tiptap | 2.x |
| Backend | Next.js API Routes | - |
| DB | Supabase (PostgreSQL) | - |
| ORM | Prisma | 6.x |
| AI | @anthropic-ai/sdk | latest |
| Auth | Google OAuth 2.0 (next-auth) | 5.x |
| SEO API | SerpAPI | - |

---

## 2. データモデル

### 2.1 ER図（概要）

```
Blog (1) ──< Article (1) ──< ArticleVersion
  |              |
  |              ├──< PlatformContent (Note/X)
  |              |
  |              ├──< FAQ
  |              |
  |              └──< InternalLink
  |
  ├──< KeywordAnalysis
  |
  ├──< CompetitorAnalysis
  |
  ├──< RankTracking
  |
  └──< CTASetting
```

### 2.2 テーブル定義

#### blogs

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| name | varchar(100) | ブログ名（マーケブログ/美容ブログ） |
| type | enum | 'marketing' / 'beauty' |
| url | varchar(500) | ブログURL |
| sc_property_id | varchar(200) | Search Console プロパティID |
| ga_property_id | varchar(200) | GA4 プロパティID |
| created_at | timestamp | 作成日時 |

#### articles

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| blog_id | uuid | FK → blogs |
| title | varchar(200) | 記事タイトル |
| slug | varchar(200) | URLスラッグ |
| status | enum | 'draft' / 'outline' / 'generating' / 'review' / 'published' |
| target_keyword | varchar(100) | ターゲットキーワード |
| meta_description | text | メタディスクリプション |
| outline | jsonb | 記事構成（H1/H2/H3構造） |
| content | text | 本文（HTML） |
| word_count | integer | 文字数 |
| seo_score | integer | SEOスコア（0-100） |
| published_url | varchar(500) | 公開URL |
| published_at | timestamp | 公開日時 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### platform_contents

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| article_id | uuid | FK → articles |
| platform | enum | 'note' / 'x_long' / 'x_post' |
| content | text | 変換済みコンテンツ |
| cannibalization_score | integer | カニバリスコア（0-100） |
| status | enum | 'draft' / 'published' |
| scheduled_at | timestamp | 公開予定日時 |
| created_at | timestamp | 作成日時 |

#### keyword_analyses

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| blog_id | uuid | FK → blogs |
| keyword | varchar(200) | キーワード |
| search_volume | integer | 推定検索ボリューム |
| current_rank | integer | 現在の順位（null=未ランク） |
| difficulty | enum | 'easy' / 'medium' / 'hard' |
| lead_potential | enum | 'high' / 'medium' / 'low' |
| gap_type | enum | 'no_content' / 'low_rank' / 'competitor_only' / 'trending' |
| status | enum | 'suggested' / 'selected' / 'in_progress' / 'completed' |
| analyzed_at | timestamp | 分析日時 |

#### competitor_analyses

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| keyword_analysis_id | uuid | FK → keyword_analyses |
| rank | integer | 検索順位（1-10） |
| url | varchar(500) | 記事URL |
| title | varchar(300) | 記事タイトル |
| word_count | integer | 文字数 |
| headings | jsonb | 見出し構成 |
| co_occurrence_words | jsonb | 共起語リスト |
| meta_description | text | メタディスクリプション |
| has_faq_schema | boolean | FAQ構造化データの有無 |
| analyzed_at | timestamp | 分析日時 |

#### rank_trackings

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| article_id | uuid | FK → articles |
| keyword | varchar(200) | トラッキングキーワード |
| rank | integer | 順位 |
| clicks | integer | クリック数 |
| impressions | integer | 表示回数 |
| ctr | decimal | CTR |
| tracked_at | date | トラッキング日 |

#### cta_settings

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| blog_id | uuid | FK → blogs |
| type | enum | 'line' / 'mail_magazine' / 'consultation' / 'download' |
| position | enum | 'middle' / 'end' / 'both' |
| title | varchar(200) | CTAタイトル |
| description | text | CTA説明文 |
| url | varchar(500) | CTAリンク先 |
| is_active | boolean | 有効/無効 |

#### faqs

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| article_id | uuid | FK → articles |
| question | text | 質問 |
| answer | text | 回答 |
| sort_order | integer | 表示順 |

#### internal_links

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| article_id | uuid | FK → articles（リンク元） |
| target_article_id | uuid | FK → articles（リンク先） |
| anchor_text | varchar(200) | アンカーテキスト |
| position | varchar(50) | 挿入推奨箇所（H2-1, H2-2等） |
| status | enum | 'suggested' / 'approved' / 'inserted' |

---

## 3. API設計

### 3.1 Google連携

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/auth/google` | GET | Google OAuth開始 |
| `/api/auth/callback` | GET | OAuthコールバック |
| `/api/sc/properties` | GET | SCプロパティ一覧 |
| `/api/sc/performance` | GET | SCパフォーマンスデータ取得 |
| `/api/ga/properties` | GET | GA4プロパティ一覧 |
| `/api/ga/report` | GET | GA4レポート取得 |

### 3.2 分析

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/analysis/auto` | POST | 自動分析実行（SC+GA統合） |
| `/api/competitors/analyze` | POST | 競合分析実行（キーワード指定） |
| `/api/keywords/gap` | POST | ギャップ分析実行 |
| `/api/keywords/suggestions` | GET | 記事提案リスト取得 |
| `/api/keywords/[id]/select` | POST | 記事候補を選択 |
| `/api/cannibalization/check` | POST | カニバリチェック |

### 3.3 記事生成

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/articles` | GET | 記事一覧 |
| `/api/articles` | POST | 記事新規作成 |
| `/api/articles/[id]` | GET | 記事詳細 |
| `/api/articles/[id]` | PATCH | 記事更新 |
| `/api/articles/[id]/outline` | POST | 構成生成（Claude API） |
| `/api/articles/[id]/generate` | POST | 本文生成（Claude API, streaming） |
| `/api/articles/[id]/regenerate` | POST | 部分再生成（H2指定） |
| `/api/articles/[id]/meta` | POST | メタ・タイトル候補生成 |
| `/api/articles/[id]/faq` | POST | FAQ生成 |
| `/api/articles/[id]/internal-links` | GET | 内部リンク提案取得 |

### 3.4 横展開

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/distribute/note` | POST | Note用変換 |
| `/api/distribute/x-long` | POST | X長文用変換 |
| `/api/distribute/x-posts` | POST | Xポスト用変換（3-5本） |
| `/api/distribute/[id]/cannibalization` | GET | カニバリスコア取得 |

### 3.5 トラッキング

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/tracking/ranks` | GET | 順位一覧（フィルタ付き） |
| `/api/tracking/rewrite-suggestions` | GET | リライト提案一覧 |
| `/api/tracking/sync` | POST | SC順位データ同期 |

### 3.6 設定

| Endpoint | Method | 説明 |
|----------|--------|------|
| `/api/blogs` | GET | ブログ一覧 |
| `/api/blogs` | POST | ブログ追加 |
| `/api/blogs/[id]/cta` | GET/POST/PATCH | CTA設定 |

---

## 4. 画面遷移

```
[ログイン]
    |
    v
[ダッシュボード] ← BlogSwitcher で常時切り替え可能
    |
    ├── [自動分析] → SC/GAデータ + AIインサイト
    |
    ├── [競合分析] → キーワード入力 → 上位10記事分析結果
    |       |
    |       └── [記事提案] → 提案リスト → 選択
    |               |
    |               └── [記事作成]
    |                     ├── Step 1: 構成生成 → 編集 → 承認
    |                     ├── Step 2: 本文生成 → Tiptapエディタで編集
    |                     ├── Step 3: メタ・タイトル選択
    |                     ├── Step 4: FAQ生成 → 編集
    |                     ├── Step 5: CTA確認
    |                     ├── Step 6: 内部リンク承認
    |                     └── Step 7: 最終プレビュー → 公開
    |
    ├── [横展開] → 記事選択 → Note/X変換 → カニバリチェック → プレビュー
    |
    ├── [トラッキング] → 順位推移グラフ → リライト提案 → カニバリ検出
    |
    └── [設定] → ブログ設定 / CTA設定 / API連携
```

---

## 5. 画面詳細仕様

### 5.1 ダッシュボード

**パス**: `/dashboard`

**コンポーネント構成**:
```
DashboardPage
  ├── BlogSwitcher（ヘッダー内）
  ├── KPICards（PV/UU/オーガニック流入/平均順位）
  ├── RankChangesSummary（順位変動: 上昇/下降/新規）
  ├── ActionableItems（未対応アクション一覧）
  │   ├── 新記事提案（N件）
  │   ├── リライト推奨（N件）
  │   └── カニバリ検出（N件）
  └── ArticleQueue（記事生成キュー）
```

### 5.2 記事作成（コアフロー）

**パス**: `/articles/new?keyword_id=xxx`

**ステップUI**: 水平ステッパー（7段階）

#### Step 1: 構成生成

```
ArticleOutlinePage
  ├── KeywordInfo（ターゲットKW, 検索ボリューム, 競合の強さ）
  ├── CompetitorOutlines（競合記事の構成プレビュー、折りたたみ）
  ├── GenerateButton → Claude API呼び出し
  ├── OutlineEditor（ドラッグ&ドロップ）
  │   ├── H1 EditableField
  │   ├── H2 EditableField + AddH3 + Delete
  │   │   ├── H3 EditableField + Delete
  │   │   └── H3 EditableField + Delete
  │   ├── H2 ...
  │   └── H2: まとめ（固定）
  └── ApproveButton → Step 2へ
```

**Claude APIプロンプト設計（構成生成）**:
```
入力: ターゲットKW, ブログタイプ(marketing/beauty), 競合上位記事の構成, 共起語リスト
参照: ナレッジテンプレート（3.1 or 3.2）
出力: JSON形式の見出し構成 + 各見出しの書くべき内容要約
```

#### Step 2: 本文生成

```
ArticleContentPage
  ├── OutlineSidebar（構成プレビュー、クリックでスクロール）
  ├── TiptapEditor（WYSIWYG）
  │   └── StreamingText（Claude APIストリーミング表示）
  ├── RegenerateButton（H2単位で再生成）
  └── SEOPreviewPanel（右サイド）
      ├── SEOScore（ゲージ）
      ├── KeywordDensity
      ├── WordCount
      └── ReadabilityScore
```

**Claude APIプロンプト設計（本文生成）**:
```
入力: 承認済み構成, ブログタイプ, ターゲットKW, 共起語リスト
参照: ナレッジテンプレート（トーン, フレーズ, E-E-A-T要素）
制約:
  - 3000-5000文字（美容ブログの場合5000-9000文字）
  - 冒頭300文字にメインKW含む
  - 共起語を自然に散りばめ
  - E-E-A-Tテンプレート適用
  - CTA挿入ポイントをマーク
出力: HTML形式の本文（streaming）
```

### 5.3 横展開

**パス**: `/distribute`

```
DistributePage
  ├── ArticleSelector（公開済み記事一覧）
  ├── PlatformTabs（Note / X長文 / Xポスト）
  ├── GenerateButton
  ├── ContentPreview
  │   ├── NotePreview（Note風UIで表示）
  │   ├── XLongPreview（X風UIで表示）
  │   └── XPostsPreview（3-5投稿カード表示）
  ├── CannibalizationAlert（スコア表示, 0-100）
  ├── SchedulePicker（公開タイミング設定）
  └── EditableContent（変換結果の編集）
```

---

## 6. AI処理フロー

### 6.1 記事生成パイプライン

```
1. キーワード選択
    ↓
2. 競合分析（SerpAPI → スクレイピング → 共起語抽出）
    ↓
3. 構成生成（Claude API）
    ↓ ← 円香さんが編集・承認
4. 本文生成（Claude API, streaming）
    ↓ ← Tiptapで編集
5. メタディスクリプション生成（3候補）
    ↓ ← 選択
6. タイトル候補生成（5候補）
    ↓ ← 選択
7. FAQ生成（3-5件, JSON-LD出力）
    ↓ ← 編集
8. 内部リンク提案（3-5本）
    ↓ ← 承認
9. CTA自動挿入
    ↓
10. 最終プレビュー → 公開
```

### 6.2 横展開パイプライン

```
1. 公開済み記事選択
    ↓
2. プラットフォーム選択（Note / X長文 / Xポスト）
    ↓
3. 変換生成（Claude API）
   - ナレッジテンプレート 3.3 参照
   - ブログタイプ別の変換ルール適用
    ↓
4. カニバリチェック（元記事との類似度計算）
    ↓ ← スコア100中30以上で警告
5. プレビュー → 編集
    ↓
6. 公開タイミング設定
```

---

## 7. 外部API連携仕様

### 7.1 Google Search Console API

```typescript
// 使用スコープ
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

// 主要エンドポイント
// POST /webmasters/v3/sites/{siteUrl}/searchAnalytics/query
// クエリパラメータ: startDate, endDate, dimensions, rowLimit
// dimensions: ['query', 'page', 'device', 'country']
```

### 7.2 Google Analytics Data API (GA4)

```typescript
// 使用スコープ
const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

// 主要メソッド
// analyticsdata.properties.runReport
// metrics: ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration']
// dimensions: ['pagePath', 'sessionSource', 'deviceCategory']
```

### 7.3 SerpAPI

```typescript
// 検索パラメータ
{
  engine: 'google',
  q: keyword,
  google_domain: 'google.co.jp',
  gl: 'jp',
  hl: 'ja',
  num: 10
}
// organic_results から url, title, snippet を取得
```

### 7.4 Claude API（記事生成）

```typescript
// モデル: claude-sonnet-4-6（コスト効率重視）
// ストリーミング有効
// max_tokens: 8192（本文生成時）
// temperature: 0.7（創造性と安定性のバランス）
```

---

## 8. セキュリティ仕様

| 項目 | 実装 |
|------|------|
| 認証 | Google OAuth 2.0 (next-auth v5) |
| トークン保管 | Supabase Auth + HTTP-only Cookie |
| API保護 | Next.js Middleware でセッション検証 |
| CSRF | next-auth 組み込みCSRF保護 |
| Rate Limiting | Upstash Redis (API routes) |
| 環境変数 | .env.local（ローカル）/ AWS Secrets Manager（本番） |
| 入力検証 | Zod スキーマバリデーション |

---

## 9. パフォーマンス仕様

| 処理 | 目標 | 実装方針 |
|------|------|---------|
| ダッシュボード表示 | 2秒以内 | ISR (revalidate: 300) + SWR |
| 競合分析 | 30秒以内 | Background Job + Polling |
| 構成生成 | 10秒以内 | Claude API streaming |
| 本文生成 | 60秒以内 | Claude API streaming + チャンク表示 |
| 横展開変換 | 30秒以内 | 3プラットフォーム並列生成 |
| 順位同期 | バックグラウンド | Cron Job (daily) |

---

*Generated by CCAGI SDK v3.13.0 - Phase 2: Specification (spec.md)*
