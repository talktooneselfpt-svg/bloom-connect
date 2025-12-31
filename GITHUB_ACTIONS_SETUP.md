# GitHub Actions セットアップガイド

このガイドでは、GitHub ActionsでFirebase Hostingへの自動デプロイを設定する手順を説明します。

## 必要なGitHubシークレット

以下のシークレットをGitHubリポジトリに設定してください：
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. FIREBASE_SERVICE_ACCOUNT

Firebase サービスアカウントキー（JSON形式）

#### 取得手順：

1. **Firebaseコンソールにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト `bloom-connect-258b0` を選択

2. **サービスアカウントキーの生成**
   - 左側メニュー：⚙️（設定） → `プロジェクトの設定`
   - タブ：`サービス アカウント`
   - ボタン：`新しい秘密鍵の生成` をクリック
   - 確認ダイアログで `キーを生成` をクリック
   - JSONファイルがダウンロードされます

3. **GitHubシークレットに設定**
   - ダウンロードしたJSONファイルの内容をコピー
   - GitHubリポジトリ → `Settings` → `Secrets and variables` → `Actions`
   - `New repository secret` をクリック
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Secret: JSONファイルの全内容を貼り付け
   - `Add secret` をクリック

### 2. Firebase設定環境変数

以下のシークレットも設定してください（Firebaseコンソール → プロジェクト設定 → 全般 から取得）：

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## 自動デプロイのトリガー

以下のブランチにプッシュすると、自動的に開発サイトへデプロイされます：

- `main` ブランチ
- `claude/**` パターンのブランチ

## デプロイ先URL

- **開発サイト**: https://bloom-connect-dev.web.app
- **本番サイト**: https://bloom-connect-258b0.web.app

## トラブルシューティング

### デプロイが失敗する場合

1. **サービスアカウントキーの確認**
   - JSONファイルの内容が完全にコピーされているか確認
   - 余分な空白や改行がないか確認

2. **権限の確認**
   - サービスアカウントに `Firebase Hosting 管理者` ロールが付与されているか確認
   - Firebaseコンソール → プロジェクト設定 → サービス アカウント → 権限

3. **ビルドの確認**
   - ローカルで `npm run build` が成功するか確認
   - `out` ディレクトリが生成されているか確認

### ログの確認

GitHub Actions の実行ログを確認：
https://github.com/YOUR_USERNAME/bloom-connect/actions

## 参考リンク

- [Firebase サービスアカウント](https://firebase.google.com/docs/admin/setup)
- [GitHub Actions シークレット](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
- [Firebase Hosting デプロイ](https://firebase.google.com/docs/hosting/deploying)
