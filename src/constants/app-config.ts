// リリース前に必ず実際の値へ差し替えること（SPEC.md「安全・審査対応」）。

/** 運営の連絡先。アプリ内「お問い合わせ」と審査情報に掲示する。 */
export const CONTACT_EMAIL = 'TODO-contact@kitsuonmura.com';

/** kitsuonmura.com 上に置くプライバシーポリシー。下書きは docs/privacy-policy.md。 */
export const PRIVACY_POLICY_URL = 'https://www.kitsuonmura.com/lite/privacy';

/** 利用規約を改定したら上げる。上がると村人に再同意を求める。 */
export const TERMS_VERSION = 1;

/** 厚生労働省「まもろうよ こころ」 */
export const CRISIS_SUPPORT_URL = 'https://www.mhlw.go.jp/mamorouyokokoro/';

export const SEED_MAX_LENGTH = 100;
export const POST_MAX_LENGTH = 140;
export const POST_LIFETIME_MS = 24 * 60 * 60 * 1000;
/** この件数の通報で自動的に非表示にする。 */
export const REPORT_HIDE_THRESHOLD = 3;
