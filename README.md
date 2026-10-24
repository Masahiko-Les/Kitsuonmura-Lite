# 吃音村Lite

吃音のある人が自分の苦労を種として育て、言葉を交わさずにねぎらい合う iPhone アプリです。
仕様は [SPEC.md](SPEC.md) にあります。

- Expo SDK 58（React Native）+ TypeScript + Expo Router
- Firebase（Authentication / Cloud Firestore、JS SDK）
- Firebase の匿名認証（テスト用。リリース前に Sign in with Apple に戻すかを決める）

## フォルダ構成

```
src/
  app/                    画面（Expo Router。ファイル＝画面）
    _layout.tsx           サインイン → 村人登録 → 村 の切り替え
    sign-in.tsx           村に入る（匿名でサインイン）
    register.tsx          村人登録（利用規約・年齢への同意）
    terms.tsx             利用規約
    (app)/
      _layout.tsx         手持ちのかご・贈り物のお知らせ・期限切れ投稿の片付け
      (tabs)/             農園（index）・焚き火・砂漠
      basket.tsx          手持ちのかご（受け取った贈り物の一覧）
      settings.tsx        設定（ブロック一覧・規約・プライバシー・お問い合わせ・退会）
      blocked.tsx         ブロック一覧
  components/             画面の部品（seed-board は農園と砂漠で共通）
  constants/              配色・カタログ・規約・連絡先などの設定値
  lib/                    Firebase・Firestore の読み書き・NGワード
  providers/              サインイン状態・手持ちのかご
firestore.rules           セキュリティルール
firestore.indexes.json    複合インデックス
docs/privacy-policy.md    プライバシーポリシーの下書き
```

## はじめて動かすまで

### 1. Firebase プロジェクト

1. [Firebase コンソール](https://console.firebase.google.com/)でプロジェクトを作る（Spark プランで可）。
2. **Firestore Database** を作成（本番モード、リージョンは `asia-northeast1` など）。
3. **Authentication → Sign-in method → 匿名** を有効にする。
4. **プロジェクトの設定 → マイアプリ** でウェブアプリを追加し、表示された `firebaseConfig` の値を控える。

### 2. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に手順1-4の値を入れます。

### 3. セキュリティルールとインデックス

```bash
firebase login
firebase use --add            # 作ったプロジェクトを選ぶ
firebase deploy --only firestore
```

インデックスの作成には数分かかります。それまでは一覧が読み込めません。

### 4. 実機で動かす

ネイティブモジュールは Expo Go に入っているものだけなので、まずは Expo Go で動きます。

```bash
npx expo start
```

EAS でビルドする場合、`.env.local` は git に入らずビルドに送られないため、同じ値を `eas.json` の
`build.base.env` に書いてあります（ウェブ用の設定値で、アプリに埋め込まれるものなので公開されても問題ありません）。
Firebase の設定を変えたら、`.env.local` と `eas.json` の両方を直してください。

```bash
npx eas-cli@latest init
npx eas-cli@latest build --profile preview --platform ios
```

## 確認コマンド

```bash
npx tsc --noEmit   # 型チェック
npx expo lint      # リント
```

## 運営のしかた

- **通報の確認**：Firebase コンソール → Firestore → `reports`。対象の `seeds` / `posts` を開き、
  問題があれば削除するか `hidden` を `true` にする。通報3件で自動的に見えなくなります。
- **NGワード**：`src/lib/moderation.ts` の `NG_WORDS`（連絡先は `CONTACT_PATTERNS`、危機対応は `CRISIS_WORDS`）に足す。
- **作物・花を増やす**：`src/constants/catalog.ts` と `firestore.rules` の `cropIds()` / `flowerIds()` を両方変える。
- **利用規約を改定する**：`src/constants/terms.ts` を直し、`src/constants/app-config.ts` の `TERMS_VERSION` を上げると、全員に再同意を求めます。
- **Blaze プランに移ったら**：Firestore の TTL ポリシーを `posts` の `expiresAt` に設定する（`cleanUpMyExpiredPosts` は残しておいて問題ありません）。

## 既知の制限

- 手持ちの数はサーバーに保存せず記録から数えるため、「贈る」ときに手持ちが足りるかは端末側でしか確かめていません。
  不正な改造アプリからは、持っていない作物を贈れてしまいます。気になるようになったら、Blaze プランで Cloud Functions に贈る処理を移してください。
- 贈り物のお知らせはアプリを開いた時に表示します（プッシュ通知はありません）。
- 匿名認証のアカウントは端末に結びつくため、アプリを削除すると同じ村人には戻れません。そのためサインアウトは置いていません。
