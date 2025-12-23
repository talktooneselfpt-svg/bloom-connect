import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createStaff } from '@/lib/firestore/staff';
import { Staff } from '@/types/staff';

/**
 * 職員用の Firebase Authentication アカウントを作成し、
 * 同時に Firestore に職員データを保存する
 *
 * @param email メールアドレス
 * @param password パスワード
 * @param staffData 職員データ（uid を除く）
 * @returns 作成されたユーザーの UID
 */
export async function createStaffWithAuth(
  email: string,
  password: string,
  staffData: Omit<Staff, 'createdAt' | 'updatedAt' | 'uid'>
): Promise<string> {
  try {
    // Firebase Authentication でユーザーを作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ユーザーのプロフィールを更新（表示名を設定）
    await updateProfile(user, {
      displayName: staffData.nameKanji,
      photoURL: staffData.photoUrl,
    });

    // Firestore に職員データを保存（uid を含める）
    await createStaff(user.uid, {
      ...staffData,
      uid: user.uid,
      email, // 確実にメールアドレスを保存
    });

    return user.uid;
  } catch (error) {
    // エラーハンドリング
    if (error instanceof Error) {
      // Firebase Auth のエラーコードに応じて適切なメッセージを返す
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          throw new Error('このメールアドレスは既に使用されています');
        case 'auth/invalid-email':
          throw new Error('無効なメールアドレスです');
        case 'auth/weak-password':
          throw new Error('パスワードが弱すぎます（6文字以上推奨）');
        default:
          throw new Error(`アカウント作成に失敗しました: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Firebase Admin SDK を使用して職員アカウントを作成する関数
 * （サーバーサイドでのみ使用可能）
 *
 * この関数は Next.js の Server Actions や API Routes で使用してください。
 *
 * 使用例：
 * ```typescript
 * // app/api/staff/create/route.ts
 * import { NextRequest, NextResponse } from 'next/server';
 * import { createStaffWithAdminAuth } from '@/lib/auth/staff';
 *
 * export async function POST(request: NextRequest) {
 *   const data = await request.json();
 *   const uid = await createStaffWithAdminAuth(data.email, data.password, data.staffData);
 *   return NextResponse.json({ uid });
 * }
 * ```
 */
export async function createStaffWithAdminAuth(
  email: string,
  password: string,
  staffData: Omit<Staff, 'createdAt' | 'updatedAt' | 'uid'>
): Promise<string> {
  // この実装には Firebase Admin SDK が必要です
  // npm install firebase-admin でインストールしてください

  /*
  実装例：

  import { getAuth } from 'firebase-admin/auth';
  import { initializeApp, getApps, cert } from 'firebase-admin/app';

  // Admin SDK の初期化
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  const adminAuth = getAuth();

  // ユーザーを作成
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName: staffData.nameKanji,
    photoURL: staffData.photoUrl,
  });

  // Firestore に保存
  await createStaff(userRecord.uid, {
    ...staffData,
    uid: userRecord.uid,
    email,
  });

  return userRecord.uid;
  */

  throw new Error('この関数を使用するには Firebase Admin SDK を実装してください');
}
