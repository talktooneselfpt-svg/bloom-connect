# Firebase環境変数設定ガイド

このガイドでは、ブルームコネクトアプリケーションでFirebaseを使用するための環境変数設定方法を説明します。

## 目次

1. [Firebaseプロジェクトの作成](#1-firebaseプロジェクトの作成)
2. [Firebase設定情報の取得](#2-firebase設定情報の取得)
3. [環境変数ファイルの作成](#3-環境変数ファイルの作成)
4. [Firestoreデータベースの設定](#4-firestoreデータベースの設定)
5. [Firebase Authenticationの設定](#5-firebase-authenticationの設定)
6. [セキュリティルールの設定](#6-セキュリティルールの設定)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. Firebaseプロジェクトの作成

### 手順

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `bloom-connect`）
4. Google Analyticsの設定（任意、推奨：有効）
5. 「プロジェクトを作成」をクリック

### 注意事項

- プロジェクトIDは後から変更できません
- 本番環境と開発環境で別々のプロジェクトを作成することを推奨します
  - `bloom-connect-dev` (開発環境)
  - `bloom-connect-prod` (本番環境)

---

## 2. Firebase設定情報の取得

### 手順

1. Firebase Consoleでプロジェクトを開く
2. 左サイドバーの「プロジェクトの設定」（歯車アイコン）をクリック
3. 「全般」タブを選択
4. 「マイアプリ」セクションまでスクロール
5. 「ウェブアプリにFirebaseを追加」（</>アイコン）をクリック
6. アプリのニックネームを入力（例: `bloom-connect-web`）
7. 「Firebase Hostingも設定する」はチェック不要（後で設定可）
8. 「アプリを登録」をクリック

### 設定情報の確認

「SDK の設定と構成」画面に以下の情報が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

この情報を次のステップで使用します。

---

## 3. 環境変数ファイルの作成

### ファイルの作成

プロジェクトのルートディレクトリに `.env.local` ファイルを作成します：

```bash
touch .env.local
```

### 環境変数の設定

`.env.local` ファイルに以下の内容を記述します：

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 各環境変数の説明

| 環境変数 | 説明 | 取得場所 |
|---------|------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase APIキー | Firebase Console > プロジェクト設定 > 全般 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 認証ドメイン | 同上 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | プロジェクトID | 同上 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ストレージバケット | 同上 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | メッセージング送信者ID | 同上 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | アプリID | 同上 |
| `NEXT_PUBLIC_ENVIRONMENT` | 実行環境 | `development` または `production` |

### 重要な注意事項

⚠️ **セキュリティ上の注意**

1. `.env.local` ファイルは **絶対にGitにコミットしない**
   - `.gitignore` に `.env.local` が含まれていることを確認
2. API KeyはFirebaseコンソールで制限を設定する（後述）
3. 本番環境では環境変数を安全に管理する（Vercel、Netlify等のプラットフォーム機能を使用）

### 環境変数の確認

設定後、開発サーバーを再起動します：

```bash
npm run dev
```

ブラウザのコンソールでエラーが表示されないことを確認してください。

---

## 4. Firestoreデータベースの設定

### Firestoreの有効化

1. Firebase Console > 「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルールの選択：
   - **開発時**: 「テストモードで開始」を選択
   - **本番時**: 「本番環境モードで開始」を選択（推奨）
4. ロケーションを選択（推奨: `asia-northeast1` または `asia-northeast2`）
5. 「有効にする」をクリック

### コレクションの作成

以下のコレクションを作成します（アプリ使用時に自動作成されますが、手動で作成も可能）：

- `organizations` - 事業所情報
- `staff` - 職員情報
- `clients` - 利用者情報
- `subscriptions` - サブスクリプション情報
- `notifications` - 通知情報

---

## 5. Firebase Authenticationの設定

### Authenticationの有効化

1. Firebase Console > 「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 使用する認証プロバイダーを有効化：

#### メール/パスワード認証（推奨）

1. 「メール/パスワード」をクリック
2. 「有効にする」をオン
3. 「メールリンク（パスワードなしでログイン）」は任意
4. 「保存」をクリック

#### Googleログイン（オプション）

1. 「Google」をクリック
2. 「有効にする」をオン
3. プロジェクトのサポートメールを選択
4. 「保存」をクリック

### 承認済みドメインの設定

1. 「Settings」タブ > 「Authorized domains」
2. ローカル開発用に `localhost` が追加されていることを確認
3. 本番環境のドメインを追加（例: `bloom-connect.com`）

---

## 6. セキュリティルールの設定

### Firestoreセキュリティルール

Firebase Console > Firestore Database > 「ルール」タブで以下を設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ヘルパー関数: ユーザーが認証済みか確認
    function isAuthenticated() {
      return request.auth != null;
    }

    // ヘルパー関数: ユーザーが管理者か確認
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role == '管理者';
    }

    // ヘルパー関数: ユーザーが開発者か確認
    function isDeveloper() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role == '開発者';
    }

    // 事業所コレクション
    match /organizations/{orgId} {
      // 管理者と開発者のみ作成・更新・削除可能
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin() || isDeveloper();
    }

    // 職員コレクション
    match /staff/{staffId} {
      // 認証済みユーザーは閲覧可能
      allow read: if isAuthenticated();
      // 管理者と開発者のみ作成・更新・削除可能
      allow create, update, delete: if isAdmin() || isDeveloper();
      // 自分自身の情報は更新可能
      allow update: if isAuthenticated() && request.auth.uid == staffId;
    }

    // 利用者コレクション
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin() || isDeveloper();
    }

    // サブスクリプションコレクション
    match /subscriptions/{subId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin() || isDeveloper();
    }

    // 通知コレクション
    match /notifications/{notificationId} {
      // 自分宛の通知のみ読み取り可能
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      // 管理者と開発者のみ作成・削除可能
      allow create, delete: if isAdmin() || isDeveloper();
      // 既読状態の更新は本人のみ可能
      allow update: if isAuthenticated() &&
                      resource.data.userId == request.auth.uid &&
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
    }
  }
}
```

### Firebase Storageセキュリティルール（使用する場合）

Firebase Console > Storage > 「ルール」タブで以下を設定：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 認証済みユーザーのみアクセス可能
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 7. トラブルシューティング

### エラー: "Firebase: Error (auth/configuration-not-found)"

**原因**: 環境変数が正しく読み込まれていない

**解決方法**:
1. `.env.local` ファイルがプロジェクトルートにあることを確認
2. 環境変数名が `NEXT_PUBLIC_` で始まっていることを確認
3. 開発サーバーを再起動: `npm run dev`

### エラー: "Firebase: Error (auth/api-key-not-valid)"

**原因**: APIキーが正しくない

**解決方法**:
1. Firebase Console > プロジェクト設定 > 全般 でAPIキーを確認
2. `.env.local` の `NEXT_PUBLIC_FIREBASE_API_KEY` を修正
3. 開発サーバーを再起動

### エラー: "Missing or insufficient permissions"

**原因**: Firestoreセキュリティルールでアクセスが拒否されている

**解決方法**:
1. Firebase Console > Firestore Database > ルール を確認
2. 開発中は一時的にテストモードのルールを使用（本番では非推奨）
3. ユーザーの認証状態とロールを確認

### パフォーマンスの問題

**症状**: データ取得が遅い

**解決方法**:
1. Firestoreインデックスを作成
   - Firebase Console > Firestore Database > インデックス
2. クエリを最適化（limit、orderBy等を使用）
3. キャッシュを活用

---

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. Vercelプロジェクトの設定画面を開く
2. 「Environment Variables」セクションで環境変数を追加
3. 各環境変数を追加（`.env.local` と同じ内容）
4. 「Production」環境を選択
5. デプロイを実行

### Netlifyへのデプロイ

1. Netlifyプロジェクトの設定画面を開く
2. 「Site settings」 > 「Environment variables」
3. 各環境変数を追加
4. デプロイを実行

### セキュリティ強化

本番環境では以下の設定を追加してください：

1. **APIキーの制限**（Firebase Console > 認証情報）
   - HTTPリファラー制限を設定
   - 本番ドメインのみ許可

2. **Firebase App Checkの有効化**
   - Firebase Console > App Check
   - reCAPTCHA v3を設定

3. **セキュリティルールの厳格化**
   - テストモードから本番モードに切り替え
   - 最小権限の原則に従ってルールを設定

---

## サポート

設定に問題がある場合は、以下を確認してください：

1. [Firebase公式ドキュメント](https://firebase.google.com/docs)
2. [Next.js環境変数ガイド](https://nextjs.org/docs/basic-features/environment-variables)
3. プロジェクトのIssueトラッカー

---

**最終更新日**: 2025年12月30日
