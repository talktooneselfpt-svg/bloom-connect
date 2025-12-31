# 環境セットアップガイド

このガイドでは、Firebase Hostingマルチサイト機能を使用した開発環境と本番環境の切り分け方法を説明します。

## 概要

本プロジェクトは以下の2つの環境を完全に分離して運用します：

- **開発環境 (dev)**: 開発・テスト用の環境。`dev_` プレフィックス付きコレクションを使用
- **本番環境 (prod)**: エンドユーザー向けの本番環境。プレフィックスなしのコレクションを使用

## アーキテクチャ

### データベース分離

環境に応じてFirestoreのコレクション名を自動的に変更します：

- **開発環境**: `dev_staff`, `dev_clients`, `dev_organizations`, `dev_trustedDevices`
- **本番環境**: `staff`, `clients`, `organizations`, `trustedDevices`

この仕組みにより、同じFirebaseプロジェクト内で開発データと本番データを完全に分離できます。

### 環境変数

各環境用の環境変数ファイル：
- `.env.development` - 開発環境用
- `.env.production` - 本番環境用
- `.env.local` - ローカル開発用（Git管理外）

## Firebase Hosting マルチサイト設定

### 1. Firebaseコンソールでの設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「bloom-connect-258b0」を選択
3. 左メニューから「Hosting」を選択
4. 「別のサイトを追加」をクリック
5. 開発用サイトと本番用サイトを作成：
   - 開発用サイトID（例: `bloom-connect-dev`）
   - 本番用サイトID（例: `bloom-connect-258b0`）※既存のサイト

### 2. Firebase CLIでのターゲット設定

ローカル環境で以下のコマンドを実行してデプロイターゲットを設定します：

```bash
# Firebaseにログイン
firebase login

# プロジェクトを初期化（既に設定済みの場合はスキップ可）
firebase use bloom-connect-258b0

# 開発用サイトのターゲットを設定
firebase target:apply hosting dev-site bloom-connect-dev

# 本番用サイトのターゲットを設定
firebase target:apply hosting prod-site bloom-connect-258b0
```

**注意**: `bloom-connect-dev` と `bloom-connect-258b0` は実際のFirebase HostingサイトIDに置き換えてください。

### 3. `.firebaserc` の確認

上記のコマンド実行後、`.firebaserc` ファイルに以下のような設定が追加されます：

```json
{
  "projects": {
    "default": "bloom-connect-258b0"
  },
  "targets": {
    "bloom-connect-258b0": {
      "hosting": {
        "dev-site": [
          "bloom-connect-dev"
        ],
        "prod-site": [
          "bloom-connect-258b0"
        ]
      }
    }
  }
}
```

## GitHub Secrets の設定

GitHub Actionsで自動デプロイするために、以下のSecretsを設定してください：

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
2. 以下のSecretsを追加：

### 必須のSecrets

- `FIREBASE_TOKEN`
  - Firebase CLIトークン
  - 取得方法: `firebase login:ci` を実行してトークンを取得

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

これらの値は `.env.local` ファイルまたはFirebaseコンソールの「プロジェクトの設定」から取得できます。

## デプロイ方法

### ローカルからのデプロイ

#### 開発環境にデプロイ

```bash
npm run deploy:dev
```

このコマンドは以下を実行します：
1. 開発環境用のビルド (`build:dev`)
2. Firebase Hosting の `dev-site` ターゲットにデプロイ

#### 本番環境にデプロイ

```bash
npm run deploy:prod
```

このコマンドは以下を実行します：
1. 本番環境用のビルド (`build:prod`)
2. Firebase Hosting の `prod-site` ターゲットにデプロイ

### GitHub Actionsによる自動デプロイ

#### 開発環境への自動デプロイ

以下のブランチにプッシュすると自動的に開発環境にデプロイされます：
- `claude/**` (Claude Codeブランチ)
- `dev`
- `develop`

ワークフローファイル: `.github/workflows/firebase-hosting.yml`

#### 本番環境への自動デプロイ

以下の方法で本番環境にデプロイできます：

1. **自動デプロイ**: `main` または `master` ブランチにプッシュ
2. **手動デプロイ**: GitHub Actionsの「Run workflow」ボタンから手動実行

ワークフローファイル: `.github/workflows/firebase-hosting-prod.yml`

**注意**: 本番環境へのデプロイは慎重に行ってください。`production` 環境の承認設定を推奨します。

## 開発ワークフロー

### 推奨ワークフロー

1. **ローカル開発**
   ```bash
   npm run dev
   ```
   - `.env.local` の `NEXT_PUBLIC_APP_ENV=development` で開発環境に接続

2. **Claude Codeでの開発**
   - `claude/` プレフィックス付きブランチで開発
   - プッシュすると自動的に開発サイトにデプロイ

3. **開発サイトでテスト**
   - デプロイされた開発サイトでテスト
   - 問題なければ `main` ブランチにマージ

4. **本番デプロイ**
   - `main` ブランチへのマージで自動デプロイ
   - または手動でワークフローを実行

## トラブルシューティング

### デプロイエラー

**エラー**: `Error: HTTP Error: 404, Site not found`

**解決方法**:
1. Firebase Consoleで該当サイトが作成されているか確認
2. `firebase target:apply` コマンドでターゲットを再設定
3. `.firebaserc` ファイルを確認

### コレクション名の問題

開発環境で `dev_` プレフィックスが付かない場合：

1. `.env.local` ファイルで `NEXT_PUBLIC_APP_ENV=development` が設定されているか確認
2. ビルド後にアプリを再起動
3. ブラウザのキャッシュをクリア

### GitHub Actions デプロイ失敗

1. GitHub Secretsが正しく設定されているか確認
2. `FIREBASE_TOKEN` が有効か確認（期限切れの場合は再取得）
3. Firebase Hostingのサイトが存在するか確認

## 環境の確認方法

### ローカルでの確認

ブラウザの開発者ツールで以下を実行：

```javascript
console.log(process.env.NEXT_PUBLIC_APP_ENV)
// 'development' または 'production' が表示されるはず
```

### コレクション名の確認

Firebaseコンソールの「Firestore Database」で、実際に使用されているコレクション名を確認できます：

- 開発環境: `dev_staff`, `dev_clients` など
- 本番環境: `staff`, `clients` など

## セキュリティに関する注意

1. **Firestore Rules**: 現在のルールは開発用（`allow read, write: if true`）です。本番運用前に必ず適切なセキュリティルールに更新してください。

2. **環境変数**: `.env.local` ファイルは `.gitignore` に含まれており、Git管理されません。機密情報を含むため、チームメンバーと共有する際は安全な方法で共有してください。

3. **GitHub Secrets**: Firebase トークンやAPIキーは GitHub Secrets に安全に保管してください。

## 参考リンク

- [Firebase Hosting マルチサイト](https://firebase.google.com/docs/hosting/multisites)
- [Next.js 環境変数](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
