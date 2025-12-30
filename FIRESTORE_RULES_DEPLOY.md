# Firestoreセキュリティルールのデプロイ手順

このガイドでは、Firestoreセキュリティルールをデプロイする方法を説明します。

## 前提条件

- Firebase CLIがインストールされていること
- Firebaseプロジェクトが作成されていること
- プロジェクトの所有者またはエディター権限があること

## Firebase CLIのインストール

### 1. Node.jsの確認

```bash
node --version
npm --version
```

### 2. Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

### 3. インストールの確認

```bash
firebase --version
```

## ログインとプロジェクト初期化

### 1. Firebaseにログイン

```bash
firebase login
```

ブラウザが開き、Googleアカウントでログインを求められます。

### 2. プロジェクトの初期化（初回のみ）

プロジェクトルートディレクトリで以下を実行：

```bash
firebase init
```

以下の質問に回答：

1. **使用する機能を選択**
   - `Firestore` を選択（スペースキーで選択、Enterで確定）

2. **既存のプロジェクトを使用**
   - `Use an existing project` を選択
   - プロジェクト一覧から該当プロジェクトを選択

3. **Firestoreルールファイル**
   - デフォルト（`firestore.rules`）のまま Enter

4. **Firestoreインデックスファイル**
   - デフォルト（`firestore.indexes.json`）のまま Enter

## セキュリティルールのデプロイ

### 方法1: Firestoreルールのみデプロイ

```bash
firebase deploy --only firestore:rules
```

### 方法2: すべてのFirebaseリソースをデプロイ

```bash
firebase deploy
```

### 方法3: 特定のプロジェクトにデプロイ

```bash
firebase deploy --only firestore:rules --project your-project-id
```

## デプロイ後の確認

### 1. Firebase Consoleで確認

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 「Firestore Database」→「ルール」タブを開く
4. デプロイしたルールが表示されていることを確認

### 2. ルールのテスト

Firebase Consoleの「ルール」タブで「ルールシミュレータ」を使用：

**テストケース例：**

#### ケース1: 一般ユーザーがスタッフ作成を試みる
```
Location: /databases/(default)/documents/staff/test123
Read/Write: Write
Authenticated: はい
Custom Claims: {"role": "一般"}
```
→ **期待結果**: アクセス拒否

#### ケース2: 管理者がスタッフ作成を試みる
```
Location: /databases/(default)/documents/staff/test123
Read/Write: Write
Authenticated: はい
Custom Claims: {"role": "管理者"}
```
→ **期待結果**: アクセス許可

#### ケース3: 一般ユーザーが自分の情報を更新
```
Location: /databases/(default)/documents/staff/user123
Read/Write: Update
Authenticated: はい (UID: user123)
Custom Claims: {"role": "一般"}
```
→ **期待結果**: アクセス許可（ロール・メール・職員番号以外）

## セキュリティルールの主要な保護内容

### 1. **事業所（organizations）**
- 閲覧: 全認証ユーザー
- 作成・更新: 管理者・開発者のみ
- 削除: 開発者のみ

### 2. **職員（staff）**
- 閲覧: 全認証ユーザー
- 作成・削除: 管理者・開発者のみ
- 更新: 管理者・開発者は全て、一般は自分のデータのみ（制限付き）

### 3. **利用者（clients）**
- 閲覧: 全認証ユーザー
- 作成・更新・削除: 管理者・開発者のみ

### 4. **通知（notifications）**
- 閲覧: 自分宛の通知のみ
- 作成・削除: 管理者・開発者のみ
- 更新: 既読状態のみ本人が可能

### 5. **ユーザー設定（userSettings）**
- 読み書き: 本人のみ
- 閲覧: 開発者は全て可能

### 6. **お気に入りアプリ（favoriteApps）**
- 読み書き: 本人のみ
- 閲覧: 開発者は全て可能

### 7. **監査ログ（auditLogs）**
- 閲覧: 開発者のみ
- 書き込み: 不可（サーバーサイドのみ）

## トラブルシューティング

### エラー: "Permission denied"

**原因**: Firebase CLIにログインしていないか、権限が不足している

**解決方法**:
```bash
firebase login --reauth
```

### エラー: "Project not found"

**原因**: プロジェクトIDが正しくないか、初期化されていない

**解決方法**:
```bash
firebase use --add
```
プロジェクトを選択してエイリアスを設定

### エラー: "Invalid rules"

**原因**: ルールの構文エラー

**解決方法**:
1. `firestore.rules`ファイルを確認
2. 構文エラーを修正
3. ローカルでテスト:
```bash
firebase emulators:start --only firestore
```

### デプロイが反映されない

**原因**: キャッシュの問題

**解決方法**:
1. 数分待つ（反映に時間がかかる場合がある）
2. Firebase Consoleで手動確認
3. クライアントアプリを再起動

## ベストプラクティス

### 1. **段階的デプロイ**
開発環境で十分テストしてから本番環境にデプロイ

```bash
# 開発環境
firebase deploy --only firestore:rules --project bloom-connect-dev

# 本番環境（テスト後）
firebase deploy --only firestore:rules --project bloom-connect-prod
```

### 2. **バージョン管理**
ルールファイルは必ずGitで管理し、変更履歴を残す

### 3. **定期的な監査**
Firebase Consoleの「使用状況」タブで、拒否されたリクエストを監視

### 4. **ドキュメント化**
ルール変更時は必ずコメントと共にコミット

## 関連リンク

- [Firebase Security Rules公式ドキュメント](https://firebase.google.com/docs/firestore/security/get-started)
- [ルールシミュレータ](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [ベストプラクティス](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**最終更新日**: 2025年12月30日
