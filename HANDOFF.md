# Bloom Connect 開発引き継ぎ

**作成日時:** 2026-01-01
**対象環境:** エンドユーザー向けPWA (bloom-connect-258b0.web.app)
**開発ブランチ:** `claude/fix-github-actions-deploy-JDAE4`

---

## 📋 現在の状態

### ✅ 完了した作業

1. **認証・セッション管理の実装**
   - AuthContext による認証状態の一元管理
   - AuthGuard による認証ルートの保護
   - ログイン中のユーザー、スタッフ、組織情報の自動取得

2. **全ページでの認証情報統合**
   - 全14ファイルで `temp-org-id` と `temp-user-id` を実際の認証値に置き換え
   - すべてのCRUD操作で認証済みユーザーIDと組織IDを使用

3. **デプロイ環境の整理**
   - bloom-connect-dev.web.app: 運営管理用（管理パネル）
   - bloom-connect-258b0.web.app: エンドユーザー向けPWA

### 🎯 現在の動作状況

- エンドユーザー向けアプリが表示されている
- 認証フローが実装済み
- データの作成・更新・削除が認証情報と連携

---

## 🏗️ アーキテクチャ概要

### 認証フロー

```
ブラウザアクセス
    ↓
AuthProvider (contexts/AuthContext.tsx)
    ↓
Firebase Authentication で認証確認
    ↓
├─ 未認証 → AuthGuard がログインページへリダイレクト
└─ 認証済み → スタッフ情報・組織情報を自動取得
    ↓
各ページで useAuth() を使用してデータアクセス
```

### 重要なファイル構成

#### 🔐 認証関連
```
contexts/
  └─ AuthContext.tsx          # 認証状態管理（User, Staff, Organization）

components/
  ├─ AuthGuard.tsx            # 認証ガード（未認証時リダイレクト）
  └─ ConditionalNav.tsx       # AuthProvider/AuthGuard ラッパー
```

#### 👥 スタッフ管理
```
app/staff/
  ├─ page.tsx                 # スタッフ一覧（organization.id でフィルタ）
  ├─ new/page.tsx             # スタッフ登録（user.uid, organization.id 使用）
  ├─ [id]/edit/page.tsx       # スタッフ編集（user.uid 使用）
  └─ import/page.tsx          # CSV一括登録（user.uid, organization 使用）
```

#### 👴 利用者管理
```
app/clients/
  ├─ page.tsx                 # 利用者一覧（organization.id でフィルタ）
  ├─ new/page.tsx             # 利用者登録（user.uid, organization.id 使用）
  ├─ [id]/page.tsx            # 利用者詳細（user.uid 使用）
  ├─ [id]/edit/page.tsx       # 利用者編集（user.uid 使用）
  └─ import/page.tsx          # CSV一括登録（user.uid, organization 使用）
```

#### 🏢 事業所管理
```
app/organizations/
  ├─ new/page.tsx             # 事業所登録（user.uid 使用）
  └─ [id]/page.tsx            # 事業所詳細（user.uid 使用）
```

---

## 🔧 技術的な詳細

### AuthContext の使い方

```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function YourPage() {
  const { user, staff, organization, loading } = useAuth()

  // 認証チェック
  if (!user?.uid) {
    throw new Error('ユーザー情報の取得に失敗しました')
  }

  // 組織IDを使用
  const data = await getData(organization.id)

  // ユーザーIDを使用
  await createData({
    createdBy: user.uid,
    organizationId: organization.id
  })
}
```

### 提供される認証情報

| プロパティ | 型 | 説明 |
|----------|---|------|
| `user` | `User \| null` | Firebase Auth ユーザー（uid, email等） |
| `staff` | `Staff \| null` | スタッフ情報（職種、役職等） |
| `organization` | `Organization \| null` | 組織情報（id, organizationCode等） |
| `loading` | `boolean` | 認証状態読み込み中 |
| `signOut` | `() => Promise<void>` | サインアウト関数 |

### 認証ガードの対象外ルート

以下のルートは認証不要でアクセス可能:
- `/auth/*` - 認証関連ページ
- `/setup/*` - セットアップページ
- `/admin/*` - 管理者パネル

---

## 🎨 次のセッションで検討すべき改善項目

### UI/UX 改善
1. **レスポンシブデザインの最適化**
   - モバイル表示の改善
   - タブレット表示の調整

2. **エラーハンドリングの強化**
   - より分かりやすいエラーメッセージ
   - エラー時の UI フィードバック改善

3. **ローディング状態の改善**
   - スケルトンローディングの追加
   - ローディングアニメーションの統一

### 機能追加
1. **ダッシュボードの充実**
   - 統計情報の表示
   - 最近の活動履歴
   - アラート・通知機能

2. **検索・フィルタ機能の強化**
   - 高度な検索条件
   - ソート機能
   - ページネーション

3. **一括操作機能**
   - 複数選択・一括編集
   - 一括削除
   - 一括エクスポート

### セキュリティ・パフォーマンス
1. **Firestore セキュリティルールの強化**
   - 現在: `allow read: if true;` (開発用)
   - 本番: 適切な認証ルールの実装

2. **パフォーマンス最適化**
   - 画像の最適化
   - コード分割の改善
   - キャッシング戦略

### データ管理
1. **バリデーションの強化**
   - フォーム入力の詳細なチェック
   - サーバーサイドバリデーション

2. **データ整合性**
   - トランザクション処理の実装
   - 楽観的ロックの検討

---

## 📝 現在のコミット状態

**最新コミット:** `a078e9f`
```
Implement authentication context and replace hardcoded IDs

- Created AuthContext to manage user, staff, and organization state
- Added AuthGuard component to protect routes requiring authentication
- Wrapped app with AuthProvider and AuthGuard in ConditionalNav
- Replaced all temp-org-id and temp-user-id with actual authenticated values
```

**変更ファイル数:** 14ファイル
- 新規作成: 2ファイル (AuthContext.tsx, AuthGuard.tsx)
- 更新: 12ファイル（全ページで認証統合）

---

## 🧪 動作確認チェックリスト

### 基本動作
- [ ] ログインなしでページアクセス → ログインページにリダイレクト
- [ ] ログイン成功 → ダッシュボード表示
- [ ] ナビゲーションの表示・非表示が正しく切り替わる

### スタッフ管理
- [ ] スタッフ一覧が組織でフィルタされて表示される
- [ ] スタッフ新規登録時、正しいユーザーID・組織IDが保存される
- [ ] スタッフ編集時、updatedBy に正しいユーザーIDが設定される
- [ ] CSV一括登録が正常に動作する

### 利用者管理
- [ ] 利用者一覧が組織でフィルタされて表示される
- [ ] 利用者新規登録時、正しいユーザーID・組織IDが保存される
- [ ] 利用者編集時、updatedBy に正しいユーザーIDが設定される
- [ ] 利用者詳細ページが表示される
- [ ] 退所・再アクティブ化が正常に動作する

### 事業所管理
- [ ] 事業所登録が正常に動作する
- [ ] 事業所詳細が表示される
- [ ] 無効化・再アクティブ化が正常に動作する

---

## 🔍 既知の課題・制約事項

### 1. 静的エクスポートの制約
- **問題:** `output: 'export'` のため動的ルート `[id]` が制限される
- **現状:** 詳細ページは一時的に実装済みだが、generateStaticParams は未実装
- **影響:** ビルド時にすべての動的ページが生成されない
- **対応策:** 将来的に SSR への移行を検討

### 2. Firestore セキュリティルール
- **問題:** dev_ コレクションは `allow read: if true;` で開発用設定
- **現状:** 誰でも読み取り可能（本番環境では NG）
- **対応策:** 本番リリース前に認証ベースのルールに変更必須

### 3. 環境変数の管理
- **NEXT_PUBLIC_APP_ENV:** development/production の切り替え
- **Firebase 設定:** 開発環境と本番環境で異なる設定ファイル

---

## 🚀 次のセッションでの開始方法

```bash
# 1. ブランチを確認
git status

# 2. 最新の変更を確認
git log --oneline -5

# 3. 開発サーバー起動（ローカルで確認する場合）
npm run dev

# 4. ビルド確認
npm run build
```

### よくある質問

**Q: 認証情報がない状態でページにアクセスしたらどうなる？**
A: AuthGuard が `/auth/login` にリダイレクトします。

**Q: organization.id が取得できない場合は？**
A: エラーメッセージ「組織情報の取得に失敗しました」が表示されます。

**Q: スタッフ登録時のメールアドレスはどう生成される？**
A: `{staffNumber}@{organizationCode}.bloom-connect.local` の形式で自動生成されます。

---

## 📚 参考リンク

### Firebase
- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)

### Next.js
- [Next.js 16 ドキュメント](https://nextjs.org/docs)
- [Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

### プロジェクト固有
- 運営管理画面: https://bloom-connect-dev.web.app
- エンドユーザーアプリ: https://bloom-connect-258b0.web.app

---

## 💡 提案: 次の優先タスク

### 高優先度
1. **UI/UX の洗練**
   - フォームの使いやすさ改善
   - エラーメッセージの分かりやすさ向上
   - モバイル対応の強化

2. **ダッシュボードの実装**
   - 統計情報の表示
   - クイックアクション
   - 最近の更新履歴

3. **検索・フィルタ機能**
   - スタッフ一覧の検索
   - 利用者一覧の詳細フィルタ
   - ソート機能

### 中優先度
4. **通知機能**
   - システム通知
   - アラート機能
   - リマインダー

5. **データエクスポート**
   - PDF 出力
   - Excel エクスポート
   - レポート生成

6. **権限管理の詳細化**
   - ロールベースのアクセス制御
   - 機能ごとの権限設定

### 低優先度
7. **パフォーマンス最適化**
   - 画像の遅延読み込み
   - コード分割の最適化

8. **テストの追加**
   - E2Eテスト
   - ユニットテスト

---

## 📞 トラブルシューティング

### ビルドエラーが発生した場合
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 認証エラーが発生した場合
1. Firebase コンソールで Authentication が有効か確認
2. `.env.local` ファイルの設定を確認
3. ブラウザのキャッシュをクリア

### デプロイエラーが発生した場合
1. GitHub Actions のログを確認
2. Firebase Hosting の設定を確認
3. firebase.json の設定を確認

---

**引き継ぎ作成者より:**
認証・セッション管理の基盤が完成しました。エンドユーザー向けアプリは表示されており、CRUD操作もすべて認証情報と連携しています。次のステップは、UI/UXの改善とビジネスロジックの強化です。特にダッシュボードの充実と検索機能の強化を優先することをお勧めします。

Good luck! 🚀
