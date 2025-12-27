# ブルームコネクト

介護・医療施設向けの職員管理システム

## 概要

ブルームコネクト は、介護・医療施設向けの職員データ基盤を提供するアプリケーションです。
Firebase Authentication と Firestore を活用し、職員の登録・管理を行います。

## 主な機能

### 職員データ基盤

- ✅ **Step1**: TypeScript の型定義（Staff 型）
- ✅ **Step2**: Firestore への保存機能（createStaff 関数）
- ✅ **Step3**: 職員登録フォーム
- ✅ **Step4**: Firebase Authentication との連携

### 実装済み機能

1. **🔐 認証・ログイン機能**（`/auth/login`）
   - **初回ログイン（完全認証）**: 事業所番号 + 個人番号 + パスワード
   - **簡易ログイン（信頼済みデバイス）**:
     - PIN認証（4〜6桁）
     - 生体認証（顔認証・指紋認証）- Web Authentication API使用
   - デバイスを信頼済みとして登録
   - ログイン方式の自動切り替え

2. **職員登録**（`/staff/new`）
   - 氏名（漢字・ひらがな）、個人番号
   - 職種・役職・権限ロール、所属部署・勤務形態の選択
   - 電話番号・メールアドレス
   - 入社日、資格番号、緊急連絡先
   - Firebase Auth でのアカウント作成

3. **職員一覧**（`/staff`）
   - 検索機能（名前、職種、役職、メールアドレス）
   - 絞り込み機能（在職状態、権限ロール）
   - 行クリックで詳細ページへ遷移
   - 編集・退職処理機能

4. **職員詳細**（`/staff/[id]`）
   - 職員情報の詳細表示
   - セクション別に整理（基本情報、連絡先、勤務情報、システム情報）

5. **職員編集**（`/staff/[id]/edit`）
   - 職員情報の更新
   - すべてのフィールドに対応

6. **Firebase連携**
   - Firebase Authentication でのユーザー管理
   - Firestore への職員・組織データ保存
   - ロールベースのアクセス制御（Security Rules）

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
| `/auth/login` | ログインページ（完全認証・PIN・生体認証） |
| `/staff` | 職員一覧（検索・絞り込み機能付き） |
| `/staff/new` | 職員登録フォーム |
| `/staff/[id]` | 職員詳細ページ |
| `/staff/[id]/edit` | 職員編集ページ |

## 認証アーキテクチャ

### **ログイン方式**

#### 1. 初回ログイン（完全認証）
- **事業所番号**（organizationCode）で組織を特定
- **個人番号**（staffNumber）+ **パスワード**で職員を認証
- 「このデバイスを信頼する」をONにすると、次回から簡易ログイン可能

#### 2. 簡易ログイン（信頼済みデバイス）
- **PIN認証**: 4〜6桁のPINで認証
- **生体認証**: Web Authentication API（WebAuthn）で顔認証・指紋認証

### **デバイス管理**

- デバイスフィンガープリント生成（ブラウザ情報から一意のIDを生成）
- `trustedDevices` コレクションで信頼済みデバイスを管理
- デバイスごとにPINハッシュ、生体認証Credential IDを保存
- 最終使用日時を記録し、一定期間後に再認証を要求可能

### **セキュリティ**

- PINはSHA-256でハッシュ化して保存
- 生体認証はブラウザのネイティブAPIを使用（指紋データはサーバーに送信されない）
- Firestore Security Rulesでロールベースのアクセス制御

## データモデル

### Organization（事業所）

```typescript
interface Organization {
  id: string;                 // 事業所ID
  organizationCode: string;   // 事業所番号（ログイン用）
  name: string;               // 事業所名
  nameKana?: string;          // 事業所名（ひらがな）
  postalCode?: string;        // 郵便番号
  address?: string;           // 住所
  phone?: string;             // 電話番号
  email?: string;             // メールアドレス
  isActive: boolean;          // 有効状態
  plan?: string;              // プラン
  createdAt: string;          // 作成日時
  updatedAt: string;          // 更新日時
}
```

### Staff（職員）

```typescript
interface Staff {
  organizationId: string;     // 組織ID
  uid: string;                // Firebase Auth UID
  staffNumber: string;        // 個人番号（ログイン用・職員番号）
  nameKanji: string;          // 氏名（漢字）
  nameKana: string;           // 氏名（ひらがな）
  jobType: string;            // 職種
  position: string;           // 役職
  role: string;               // 権限ロール
  department?: string;        // 所属部署
  employmentType?: string;    // 勤務形態
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

### Auth 関数

#### `lib/auth/staff.ts`
- `createStaffWithAuth(email, password, staffData)` - Auth アカウントと職員データを同時作成

#### `lib/auth/device.ts`
- `generateDeviceFingerprint()` - デバイスフィンガープリントを生成
- `getOrCreateDeviceId()` - デバイスIDを取得または生成
- `hashPin(pin)` - PINをハッシュ化
- `verifyPin(pin, pinHash)` - PINを検証
- `isBiometricAvailable()` - 生体認証が利用可能かチェック
- `registerBiometric(userId, userName)` - 生体認証を登録
- `authenticateWithBiometric(credentialId)` - 生体認証で認証

#### `lib/firestore/auth.ts`
- `getOrganizationByCode(organizationCode)` - 事業所番号から組織を取得
- `getStaffByNumber(organizationId, staffNumber)` - 組織ID + 個人番号から職員を取得
- `registerTrustedDevice(device)` - 信頼済みデバイスを登録
- `getTrustedDevice(deviceId)` - 信頼済みデバイスを取得
- `updateDeviceLastUsed(deviceId)` - デバイスの最終使用日時を更新
- `updateDevicePin(deviceId, pinHash)` - デバイスのPINハッシュを更新
- `updateDeviceBiometric(deviceId, credentialId)` - デバイスの生体認証設定を更新

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase
  - Authentication (メール/パスワード認証)
  - Firestore (NoSQL データベース)
- **UI**: React 19

## TODO

### 実装済み ✅
- [x] 職員データ基盤の実装
- [x] ログイン機能の実装（完全認証・PIN・生体認証）
- [x] 職員詳細ページ
- [x] 職員編集ページ
- [x] 検索・フィルタリング機能
- [x] Firestore Security Rules（ロールベースのアクセス制御）
- [x] データ構造の拡張（所属部署、勤務形態、入社日、資格番号、緊急連絡先）

### 今後の実装予定
- [ ] 組織管理機能の実装（事業所番号の発行・管理）
- [ ] PIN設定ページ（初回ログイン後にPINを設定）
- [ ] 生体認証設定ページ（初回ログイン後に生体認証を設定）
- [ ] AuthContext（認証状態管理・グローバルな認証情報の管理）
- [ ] ログアウト機能
- [ ] プロフィール編集機能（自分自身の情報を編集）
- [ ] エクスポート機能（CSV/Excel）
- [ ] 職員のインポート機能
- [ ] ページネーション機能
- [ ] トースト通知コンポーネント

## ライセンス

MIT

## サポート

問題が発生した場合は、Issues に報告してください。
