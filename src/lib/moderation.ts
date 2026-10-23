// 投稿前に端末側でかけるチェック（SPEC.md「安全・審査対応」「未成年への配慮」）。
// サーバー側の最後の砦は通報と運営の確認なので、ここは「うっかり」を止めるためのもの。

/** 全角英数・全角記号をそろえ、比較しやすくする。 */
function normalize(text: string) {
  return text.normalize('NFKC').toLowerCase();
}

// 外部での接触につながる連絡先。
const CONTACT_PATTERNS: RegExp[] = [
  /https?:\/\//, // URL
  /www\./,
  /[a-z0-9-]+\.(com|net|org|jp|io|me|app|ly|gl|co|info|link|xyz)\b/, // ドメイン
  /[\w.+-]+@[\w-]+\.[\w.]+/, // メールアドレス
  /(?:\d[\s-]?){10,11}/, // 電話番号（ハイフン・空白区切りも含む）
  /0\d{1,4}-\d{1,4}-\d{3,4}/,
  /@[a-z0-9_.]{2,}/, // SNS の ID
  /(line|ライン|insta|インスタ|twitter|ツイッター|tiktok|discord|ディスコ|kakao|カカオ)\s*(id|ＩＤ|アイディー)?\s*[:：は]/,
  /(id|ＩＤ)\s*[:：]\s*[a-z0-9_.]{3,}/,
];

// 他の村人を傷つける言葉。必要に応じて足していく。
const NG_WORDS = [
  '死ね',
  'しね',
  '殺す',
  'ころす',
  '消えろ',
  'きえろ',
  'きもい',
  'キモい',
  'きしょい',
  'うざい',
  'ウザい',
  'ガイジ',
  'がいじ',
  'かたわ',
  'カタワ',
  'どもりのくせに',
  'ブス',
  'デブ',
  'クズ',
  'ゴミ人間',
  'セックス',
  'エッチしよ',
  '援交',
  'パパ活',
];

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: 'contact' | 'ng-word' };

export function checkText(text: string): ModerationResult {
  const normalized = normalize(text);
  if (CONTACT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { ok: false, reason: 'contact' };
  }
  if (NG_WORDS.some((word) => normalized.includes(normalize(word)))) {
    return { ok: false, reason: 'ng-word' };
  }
  return { ok: true };
}

export const MODERATION_MESSAGES = {
  contact:
    '電話番号・メールアドレス・SNSのID・URLは書けません。村の外で連絡を取り合うことはできない決まりです。',
  'ng-word': '村人を傷つけるおそれのある言葉が含まれています。言葉を選び直してみてください。',
} as const;

// 投稿を止めずに、相談窓口をそっと案内するための言葉（SPEC.md「危機対応」）。
const CRISIS_WORDS = [
  '死にたい',
  'しにたい',
  '消えたい',
  'きえたい',
  '自殺',
  'じさつ',
  '生きていたくない',
  '生きてたくない',
  'いなくなりたい',
  '終わりにしたい',
  'リスカ',
  'リストカット',
  '首吊',
  '飛び降り',
];

export function needsCrisisSupport(text: string) {
  const normalized = normalize(text);
  return CRISIS_WORDS.some((word) => normalized.includes(normalize(word)));
}
