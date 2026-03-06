// ---------------------------------------------------------------------------
// AI Prompt Templates
// ---------------------------------------------------------------------------

export type BlogType = "marketing" | "beauty";
export type Platform = "note" | "x_long" | "x_post";

// ---------------------------------------------------------------------------
// Knowledge bases per blog type
// ---------------------------------------------------------------------------

const MARKETING_KNOWLEDGE = `
あなたは講座ビジネス・UTAGE・自動化マーケティングの専門家です。
一人称は「わたし」を使い、プロフェッショナルかつ信頼感のあるトーンで執筆します。

重要な文脈:
- UTAGE（統合マーケティングツール）を活用した講座ビジネスの構築
- ファネル設計、メルマガ自動化、LP作成、決済連携
- ターゲット: 個人起業家・コーチ・コンサルタント・講師業

文体の特徴:
- 「〜だけでは〜」（限定否定で深掘りを促す）
- 「この順番が逆になると」（順序の重要性を強調）
- 「やりがちなミス」（読者の共感と注意喚起）
- 具体的な数値や事例を交えて説明する
- 読者が次のアクションを取れるよう導線を設計する
`.trim();

const BEAUTY_KNOWLEDGE = `
あなたは東洋医学・陰陽五行に基づいた美容・健康の専門家です。
寄り添い型で共感的なトーンを使い、読者の身体と心に優しく語りかけます。

重要な文脈:
- 陰陽五行（木火土金水）に基づいた体質分析と養生法
- 季節・月経周期に合わせたセルフケア
- 薬膳レシピ・ハーブティー・経絡マッサージ
- ターゲット: 30-50代女性、自然派ケアに関心がある方

文体の特徴:
- 「負担を増やさない」（無理をしないケアの提案）
- 「身体の声に耳を傾ける」（自己観察の促し）
- 「小さな選択が次の周期を支える」（日常の積み重ねを重視）
- レシピ形式での具体的な実践法の提示
- 季節や体質に合わせたパーソナライズされたアドバイス
`.trim();

function getKnowledge(blogType: BlogType): string {
  return blogType === "marketing" ? MARKETING_KNOWLEDGE : BEAUTY_KNOWLEDGE;
}

// ---------------------------------------------------------------------------
// 1. Outline Generation
// ---------------------------------------------------------------------------

export interface OutlinePromptParams {
  keyword: string;
  blogType: BlogType;
  competitors: string[];
  coOccurrenceWords: string[];
}

export function generateOutlinePrompt({
  keyword,
  blogType,
  competitors,
  coOccurrenceWords,
}: OutlinePromptParams): { system: string; user: string } {
  const knowledge = getKnowledge(blogType);
  const charRange =
    blogType === "marketing" ? "3000〜5000文字" : "5000〜9000文字";

  const system = `${knowledge}

あなたはSEOに精通したブログ記事の構成作成者でもあります。
与えられたキーワード・競合情報・共起語をもとに、検索意図を満たしつつ
独自の切り口を持った記事構成（アウトライン）を作成してください。

出力は必ず以下のJSON形式で返してください（他のテキストは一切含めないでください）:

{
  "h1": "記事タイトル（H1）",
  "summary": "記事全体の要約（100-150文字）",
  "sections": [
    {
      "h2": "見出し2のテキスト",
      "h2_summary": "このセクションで伝えること（50-80文字）",
      "subsections": [
        {
          "h3": "見出し3のテキスト",
          "h3_summary": "このサブセクションで伝えること（30-50文字）"
        },
        {
          "h3": "見出し3のテキスト",
          "h3_summary": "このサブセクションで伝えること（30-50文字）"
        }
      ]
    }
  ]
}

制約:
- H2は必ず3つ
- 各H2の下にH3を必ず2つ
- 想定文字数: ${charRange}
- キーワードをH1とH2に自然に含める
- 共起語を各セクションに分散して含める
- 競合と差別化できる独自の切り口を入れる`;

  const competitorList =
    competitors.length > 0
      ? competitors.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "（競合情報なし）";

  const coOccurrenceList =
    coOccurrenceWords.length > 0
      ? coOccurrenceWords.join("、")
      : "（共起語情報なし）";

  const user = `以下の情報をもとに、記事構成（アウトライン）を作成してください。

【対策キーワード】
${keyword}

【ブログタイプ】
${blogType === "marketing" ? "マーケティング・講座ビジネス" : "美容・東洋医学・薬膳"}

【競合記事の見出し構成】
${competitorList}

【共起語】
${coOccurrenceList}

JSONのみで回答してください。`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// 2. Content Generation
// ---------------------------------------------------------------------------

export interface ContentPromptParams {
  outline: Record<string, unknown>;
  blogType: BlogType;
  keyword: string;
  coOccurrenceWords: string[];
}

export function generateContentPrompt({
  outline,
  blogType,
  keyword,
  coOccurrenceWords,
}: ContentPromptParams): { system: string; user: string } {
  const knowledge = getKnowledge(blogType);
  const charRange =
    blogType === "marketing" ? "3000〜5000文字" : "5000〜9000文字";

  const phraseExamples =
    blogType === "marketing"
      ? `
- 「〜だけでは〜」
- 「この順番が逆になると」
- 「やりがちなミス」
- 「実際にわたしのクライアントでも〜」`
      : `
- 「負担を増やさない」
- 「身体の声に耳を傾ける」
- 「小さな選択が次の周期を支える」
- 「この季節は〜の気が高まるため」`;

  const eatGuidelines = `
E-E-A-T要素を必ず含めてください:
- Experience（経験）: 実体験に基づくエピソードや具体例を含める
- Expertise（専門性）: 専門用語を適切に使い、根拠を示す
- Authoritativeness（権威性）: 信頼できる情報源への言及
- Trustworthiness（信頼性）: 正確な情報、バランスの取れた視点`;

  const system = `${knowledge}

あなたはSEOに最適化された高品質なブログ記事を執筆するライターです。
与えられたアウトラインに従い、${charRange}の本文を生成してください。

${eatGuidelines}

CTA（行動喚起）の挿入ポイント:
- 記事中盤（H2の2つ目の後）に自然な導線を1つ
- 記事末尾に明確なCTAを1つ
- CTAは「<!-- CTA_POINT -->」コメントで位置を示す

文体で使うべきフレーズ例:${phraseExamples}

制約:
- マークダウン形式で出力
- H1は含めない（タイトルは別途管理）
- H2, H3の見出しはアウトラインどおり
- 各セクションの文字数バランスを保つ
- キーワード「${keyword}」を自然に含める（詰め込みすぎない）
- 共起語を各セクションに自然に分散させる`;

  const user = `以下のアウトラインに従って、ブログ記事本文を生成してください。

【アウトライン】
${JSON.stringify(outline, null, 2)}

【対策キーワード】
${keyword}

【共起語】
${coOccurrenceWords.join("、")}

マークダウン形式で本文のみ出力してください。`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// 3. Meta Description & Title Candidates
// ---------------------------------------------------------------------------

export interface MetaPromptParams {
  title: string;
  content: string;
  keyword: string;
}

export function generateMetaPrompt({
  title,
  content,
  keyword,
}: MetaPromptParams): { system: string; user: string } {
  const system = `あなたはSEOメタデータの専門家です。
ブログ記事のタイトルと本文をもとに、以下を生成してください。

出力は必ず以下のJSON形式で返してください（他のテキストは一切含めないでください）:

{
  "metaDescriptions": [
    "メタディスクリプション1（120-160文字）",
    "メタディスクリプション2（120-160文字）",
    "メタディスクリプション3（120-160文字）"
  ],
  "titleCandidates": [
    "タイトル候補1",
    "タイトル候補2",
    "タイトル候補3",
    "タイトル候補4",
    "タイトル候補5"
  ]
}

制約:
- メタディスクリプションは120〜160文字
- メタディスクリプションにキーワードを自然に含める
- 各メタディスクリプションは異なるアプローチ（疑問形、数字訴求、ベネフィット訴求）
- タイトル候補は32文字以内を推奨
- タイトル候補にキーワードを含める
- クリック率を高める表現を使う（数字、疑問、限定など）`;

  const truncatedContent =
    content.length > 3000 ? content.slice(0, 3000) + "..." : content;

  const user = `以下のブログ記事のメタデータを生成してください。

【現在のタイトル】
${title}

【対策キーワード】
${keyword}

【記事本文（抜粋）】
${truncatedContent}

JSONのみで回答してください。`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// 4. Platform Distribution
// ---------------------------------------------------------------------------

export interface PlatformPromptParams {
  content: string;
  blogType: BlogType;
  platform: Platform;
}

export function generatePlatformPrompt({
  content,
  blogType,
  platform,
}: PlatformPromptParams): { system: string; user: string } {
  const knowledge = getKnowledge(blogType);

  const platformInstructions: Record<Platform, string> = {
    note: `【note向けリライト】
元のブログ記事を、noteに適したパーソナルストーリー形式にリライトしてください。

制約:
- 2000〜3000文字
- 一人称視点で、体験談として再構成する
- 「〜と思っていた時期がありました」「実はわたしも〜」など個人的なエピソードを交える
- SEOキーワードの意図的な挿入は不要（自然な文脈のみ）
- 読者が共感しやすいストーリー構成にする
- 見出しはH2のみ（2-3個）
- マークダウン形式で出力`,

    x_long: `【X（Twitter）長文ポスト向け】
元のブログ記事を、X（旧Twitter）の長文ポスト形式に凝縮してください。

制約:
- 280〜1000文字
- 冒頭1行で強いフックを入れる（問いかけ、意外な事実、数字）
- 箇条書きやナンバリングで読みやすく
- 最後にブログ記事へのCTA（「詳しくはブログで」など）
- ハッシュタグは2-3個
- 改行を効果的に使う
- プレーンテキストで出力`,

    x_post: `【X（Twitter）ポスト向け】
元のブログ記事から、X（旧Twitter）用の短文ポストを複数生成してください。

出力は必ず以下のJSON形式で返してください:

{
  "posts": [
    {
      "text": "ポスト本文（140文字以内）",
      "hashtags": ["タグ1", "タグ2"]
    }
  ]
}

制約:
- 3〜5個のポストを生成
- 各ポスト140文字以内（ハッシュタグ含まず）
- 各ポストは独立して意味が通じる
- 1つは問いかけ形式、1つは数字・データ形式、1つは共感形式を含める
- ハッシュタグは各ポスト2-3個
- JSONのみで回答`,
  };

  const system = `${knowledge}

あなたはSNSマーケティングとコンテンツリパーパシングの専門家です。
ブログ記事を指定されたプラットフォーム向けに変換してください。

${platformInstructions[platform]}`;

  const truncatedContent =
    content.length > 5000 ? content.slice(0, 5000) + "..." : content;

  const user = `以下のブログ記事を変換してください。

【元のブログ記事】
${truncatedContent}`;

  return { system, user };
}
