# セキュリティ設定ガイド

## 開発者ロールの設定方法

**重要:** 開発者ロールはUIから選択できません。手動でFirestoreに設定する必要があります。

### 手順

1. Firebase Console → Firestore Database を開く
2. `staff` コレクションから自分のドキュメントを選択
3. `role` フィールドを `'開発者'` に変更
4. 保存

### セキュリティ上の注意

- 開発者ロールは**あなた専用**です
- エンドユーザー（事業所のスタッフ）には以下のロールのみ選択可能:
  - `'管理者'` - 事業所の管理者
  - `'一般'` - 一般スタッフ
- `/dev` 配下の開発者向けページは開発者ロールのみアクセス可能

## Firestoreセキュリティルールのデプロイ

### ファイルの場所
```
/home/user/bloom-connect/firestore.rules
```

### デプロイ方法

#### 方法1: Firebase CLI
```bash
firebase deploy --only firestore:rules
```

#### 方法2: Firebase Console（手動）
1. Firebase Console → Firestore Database → Rules
2. `/home/user/bloom-connect/firestore.rules` の内容をコピー
3. ペーストして「公開」をクリック

### 主なセキュリティ機能

- ✅ 組織ベースのアクセス制御（スタッフは自組織のデータのみ）
- ✅ ロールベースのアクセス制御（管理者・一般・開発者）
- ✅ データ検証（必須フィールド、型チェック）
- ✅ 開発者専用コレクション（billing, errorLogs, systemMetrics）
- ✅ デフォルト拒否（明示的に許可されたもののみアクセス可能）

## 推奨: Firebase Authentication Custom Claims

現在、Firestoreルールは各リクエストで `staff` コレクションを読み取ってロールを確認します。
これはパフォーマンスとコストの観点から改善の余地があります。

### Custom Claims の利点
- ドキュメント読み取り不要（トークンにロール情報を含める）
- 高速化
- コスト削減

### 実装例（Cloud Functions）
```typescript
import * as admin from 'firebase-admin';

export const setUserRole = functions.https.onCall(async (data, context) => {
  // 開発者のみ実行可能
  if (!context.auth || context.auth.token.role !== '開発者') {
    throw new functions.https.HttpsError('permission-denied', '権限がありません');
  }

  const { uid, role, organizationId } = data;
  
  await admin.auth().setCustomUserClaims(uid, {
    role: role,
    organizationId: organizationId
  });
  
  return { success: true };
});
```

### Firestoreルールでの使用
```javascript
function getUserRole() {
  return request.auth.token.role; // Custom Claimから取得（高速）
}

function getUserOrganizationId() {
  return request.auth.token.organizationId; // Custom Claimから取得（高速）
}
```
