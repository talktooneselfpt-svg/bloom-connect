# 開発者用アプリ設計ドキュメント

## 概要

Bloom Connectを、エンドユーザー（事業所）向けの機能と開発者向けの管理機能を持つ統合アプリケーションとして拡張します。

## ユーザーロール

### 1. システム管理者（system_admin）
- 開発者・運営者
- 全事業所のデータを閲覧・管理
- アプリの開発・テスト・リリース
- 使用状況の分析

### 2. 事業所管理者（organization_admin）
- 各事業所の代表者
- 自組織のスタッフ・利用者を管理
- 自組織のデータのみアクセス可能

### 3. スタッフ（staff）
- 現場スタッフ
- 限定的な機能のみ使用

## データモデルの拡張

### Users コレクション（新規）
```typescript
interface User {
  id: string                    // Firebase Auth UID
  email: string
  role: 'system_admin' | 'organization_admin' | 'staff'
  organizationId?: string       // system_admin以外は必須
  displayName: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### OrganizationUsageStats コレクション（新規）
```typescript
interface OrganizationUsageStats {
  organizationId: string
  date: string                  // YYYY-MM-DD
  staffCount: number
  activeStaffCount: number
  clientCount: number
  activeClientCount: number
  loginCount: number            // その日のログイン回数
  dataOperations: {
    create: number
    update: number
    delete: number
  }
  createdAt: Timestamp
}
```

### AppRelease コレクション（新規）
```typescript
interface AppRelease {
  id: string
  version: string               // 例: "1.0.0"
  environment: 'development' | 'staging' | 'production'
  status: 'testing' | 'approved' | 'released' | 'rolled_back'
  features: string[]            // 新機能のリスト
  bugFixes: string[]            // バグ修正のリスト
  deployedAt?: Timestamp
  approvedBy?: string           // system_admin UID
  createdBy: string             // system_admin UID
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## 画面設計

### システム管理者用ダッシュボード（/admin/dashboard）

#### 統計カード
- 総事業所数（アクティブ/非アクティブ）
- 総スタッフ数（全事業所合計）
- 総利用者数（全事業所合計）
- 本日のログイン数
- 本日のデータ操作数

#### グラフ
- 事業所登録推移（月次）
- データ操作トレンド（日次・週次）
- アクティブ事業所数の推移

### 事業所モニタリング（/admin/organizations）

#### 機能
- 全事業所の一覧表示
- フィルター：
  - アクティブ/非アクティブ
  - 事業所種別
  - 登録日期間
- ソート：
  - スタッフ数
  - 利用者数
  - 最終ログイン日時
- 詳細表示：
  - 事業所情報
  - 使用状況（スタッフ数、利用者数、アクティビティ）
  - アクティビティログ

### 使用状況分析（/admin/analytics）

#### 機能
- 期間指定での使用状況分析
- 事業所別の使用頻度ランキング
- 機能別使用統計
- エラーログ一覧

### アプリ管理（/admin/releases）

#### 機能
- リリース一覧（開発・ステージング・本番）
- 新規リリースの作成
- テスト環境へのデプロイ
- 本番環境へのリリース承認
- ロールバック機能

## 実装フェーズ

### Phase 1: 基盤構築（優先度：高）
- [ ] ユーザーロール管理の実装
- [ ] 認証・認可の強化
- [ ] システム管理者用レイアウトの作成

### Phase 2: モニタリング機能（優先度：高）
- [ ] システム管理者用ダッシュボード
- [ ] 事業所モニタリング画面
- [ ] 使用状況統計の収集

### Phase 3: 分析機能（優先度：中）
- [ ] 使用状況分析画面
- [ ] グラフ・チャートの実装
- [ ] エクスポート機能

### Phase 4: アプリ管理（優先度：中）
- [ ] リリース管理画面
- [ ] デプロイメント管理
- [ ] バージョン管理

## 技術スタック

### 追加ライブラリ
- **Recharts** または **Chart.js**: グラフ・チャート表示
- **React Query**: データフェッチング・キャッシング
- **Zustand** または **Context API**: グローバル状態管理（ユーザーロール等）

### Firestore セキュリティルール拡張

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーロールを取得する関数
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isSystemAdmin() {
      return getUserRole() == 'system_admin';
    }

    function isOrganizationAdmin() {
      return getUserRole() == 'organization_admin';
    }

    // システム管理者のみアクセス可能
    match /organizationUsageStats/{statId} {
      allow read, write: if isSystemAdmin();
    }

    match /appReleases/{releaseId} {
      allow read, write: if isSystemAdmin();
    }

    // 全事業所データ（システム管理者は全件、事業所管理者は自組織のみ）
    match /staff/{staffId} {
      allow read, write: if isSystemAdmin()
        || (isOrganizationAdmin() && resource.data.organizationId == request.auth.token.organizationId);
    }
  }
}
```

## セキュリティ考慮事項

1. **ロール検証**: サーバーサイド（Firestore Rules）で厳密に検証
2. **監査ログ**: システム管理者の操作は全て記録
3. **アクセス制限**: システム管理者は特定のIPアドレスからのみアクセス可能（オプション）
4. **2要素認証**: システム管理者は必須

## 次のステップ

1. この設計を確認・承認
2. Phase 1から順次実装
3. 各フェーズごとにテスト・デプロイ
