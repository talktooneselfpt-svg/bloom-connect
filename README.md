# Bloom Connect

介護・医療施設向けの職員管理システム

## 概要

Bloom Connect は、介護・医療施設向けの職員データ基盤を提供するアプリケーションです。
Firebase Authentication と Firestore を活用し、職員の登録・管理を行います。

## 主な機能

### 職員データ基盤

- ✅ **Step1**: TypeScript の型定義（Staff 型）
- ✅ **Step2**: Firestore への保存機能（createStaff 関数）
- ✅ **Step3**: 職員登録フォーム
- ✅ **Step4**: Firebase Authentication との連携

### 実装済み機能

1. **職員登録**（`/staff/new`）
   - 氏名（漢字・ひらがな）
   - 職種・役職・権限ロールの選択
   - 電話番号・メールアドレス
   - Firebase Auth でのアカウント作成

2. **職員一覧**（`/staff`）
   - 在職中の職員一覧表示
   - 退職者の表示切り替え
   - 退職処理機能

3. **認証連携**
   - Firebase Authentication でのユーザー作成
   - Firestore への職員データ保存
   - UID の自動紐づけ

## プロジェクト構成

```
bloom-connect/
├── app/
│   ├── staff/
│   │   ├── page.tsx          # 職員一覧ページ
│   │   └── new/
│   │       └── page.tsx      # 職員登録フォーム
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── firebase.ts           # Firebase 初期化
│   ├── auth/
│   │   └── staff.ts          # Auth 連携関数
│   └── firestore/
│       └── staff.ts          # Firestore CRUD 関数
├── types/
│   └── staff.ts              # Staff 型定義・定数
└── .env.local.example        # 環境変数テンプレート
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
npm install firebase
```

### 2. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firestore Database を作成
4. プロジェクト設定から Firebase Config を取得

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Firebase の設定情報を入力してください。

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore セキュリティルール

Firebase Console で以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 職員データ
    match /staff/{staffId} {
      // 認証済みユーザーのみ読み取り可能
      allow read: if request.auth != null;
      // admin または manager ロールのみ書き込み可能
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
  }
}
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

## ページ一覧

| パス | 説明 |
|------|------|
| `/` | トップページ |
| `/staff` | 職員一覧 |
| `/staff/new` | 職員登録フォーム |

## データモデル

### Staff（職員）

```typescript
interface Staff {
  organizationId: string;     // 組織ID
  uid: string;                // Firebase Auth UID
  nameKanji: string;          // 氏名（漢字）
  nameKana: string;           // 氏名（ひらがな）
  jobType: string;            // 職種
  position: string;           // 役職
  role: string;               // 権限ロール
  phoneCompany: string;       // 会社用電話番号
  phonePersonal?: string;     // 個人用電話番号
  email: string;              // メールアドレス
  isActive: boolean;          // 在職状態
  hireDate?: string;          // 入社日
  retireDate?: string;        // 退職日
  licenseNumber?: string;     // 資格番号
  emergencyContact?: string;  // 緊急連絡先
  photoUrl?: string;          // プロフィール写真URL
  memo?: string;              // メモ
  createdAt: string;          // 作成日時
  updatedAt: string;          // 更新日時
  createdBy: string;          // 作成者
  updatedBy: string;          // 更新者
}
```

### 職種一覧

医師、看護師、准看護師、保健師、助産師、理学療法士（PT）、作業療法士（OT）、言語聴覚士（ST）、臨床検査技師、臨床工学技士、放射線技師、薬剤師、管理栄養士、栄養士、介護福祉士、初任者研修（旧ヘルパー2級）、実務者研修、生活相談員、ケアマネジャー（介護支援専門員）、サービス提供責任者、相談支援専門員、社会福祉士、精神保健福祉士、保育士、児童指導員、生活支援員、就労支援員、ドライバー、事務職、その他（自由記載）

### 役職一覧

代表、施設長、管理者、主任、リーダー、サブリーダー、サービス提供責任者、スタッフ、パートスタッフ、事務、ビューアー

### 権限ロール

- `admin`: 管理者（全権限）
- `manager`: マネージャー（職員管理可能）
- `leader`: リーダー（閲覧・編集可能）
- `staff`: スタッフ（閲覧可能）
- `viewer`: ビューアー（閲覧のみ）

## API 関数

### Firestore 関数（`lib/firestore/staff.ts`）

- `createStaff(staffId, data)` - 職員を作成
- `getStaff(staffId)` - 職員を取得
- `updateStaff(staffId, data)` - 職員を更新
- `getStaffByOrganization(organizationId)` - 組織の全職員を取得
- `getActiveStaff(organizationId)` - 在職中の職員を取得
- `retireStaff(staffId, retireDate, updatedBy)` - 職員を退職状態にする

### Auth 関数（`lib/auth/staff.ts`）

- `createStaffWithAuth(email, password, staffData)` - Auth アカウントと職員データを同時作成

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase
  - Authentication (メール/パスワード認証)
  - Firestore (NoSQL データベース)
- **UI**: React 19

## TODO

- [ ] 組織管理機能の実装
- [ ] ログイン機能の実装
- [ ] プロフィール編集機能
- [ ] 職員詳細ページ
- [ ] 検索・フィルタリング機能
- [ ] エクスポート機能（CSV/Excel）
- [ ] 職員のインポート機能

## ライセンス

MIT

## サポート

問題が発生した場合は、Issues に報告してください。
