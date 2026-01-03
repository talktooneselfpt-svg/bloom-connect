import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

// Firebase Admin の初期化
admin.initializeApp();

// グローバル設定（リージョン）
setGlobalOptions({ region: "asia-northeast1" });

const db = admin.firestore();

// ========================================
// ヘルパー関数: ランダム文字列生成
// ========================================

// 読みやすい文字だけで構成したID/パスワード生成用辞書（紛らわしい文字を除外）
const CHARS_ID = "abcdefghijkmnpqrstuvwxyz23456789"; // l, 1, o, 0 を除外
const CHARS_PW = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

const generateRandomString = (length: number, chars: string): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ========================================
// Cloud Function 1: スタッフアカウント作成
// ========================================

interface CreateStaffAccountData {
  establishmentId?: string; // SuperAdminが他の事業所のスタッフを作る場合
  name: string;
  role?: "admin" | "staff";
  jobType?: string;
}

export const createStaffAccount = onCall(async (request) => {
  // 1. セキュリティガード
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const callerClaims = request.auth.token;

  // SuperAdminでない場合、自分の事業所IDを強制適用
  const targetEid = callerClaims.admin ? request.data.establishmentId : callerClaims.eid;

  if (!targetEid || (callerClaims.role !== "admin" && !callerClaims.admin)) {
    throw new HttpsError("permission-denied", "管理者権限が必要です");
  }

  const { name, role, jobType } = request.data as CreateStaffAccountData;

  if (!name) {
    throw new HttpsError("invalid-argument", "氏名は必須です");
  }

  // 2. ユニークID生成トライ（最大5回）
  let staffId = "";
  let email = "";
  let isUnique = false;

  for (let i = 0; i < 5; i++) {
    staffId = generateRandomString(5, CHARS_ID);
    email = `${targetEid}-${staffId}@sys.bloom-connect.jp`;

    try {
      await admin.auth().getUserByEmail(email);
      // エラーが出なければユーザーが存在するのでループ継続
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        isUnique = true;
        break;
      }
    }
  }

  if (!isUnique) {
    throw new HttpsError("aborted", "ID生成に失敗しました。再試行してください。");
  }

  // 3. 初期パスワード生成 & Auth作成
  const initialPassword = generateRandomString(8, CHARS_PW);

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: initialPassword,
      displayName: name,
    });

    // 4. Custom Claims 設定
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      eid: targetEid,
      role: role || "staff",
      plan: callerClaims.plan || "free", // 作成者のプランを引き継ぐ
      mustChangePassword: true, // 重要: 初回ログイン時の強制変更フラグ
    });

    // 5. Firestore 保存
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        establishmentId: targetEid,
        staffId: staffId,
        name: name,
        role: role || "staff",
        jobType: jobType || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
        status: "active",
      });

    // 6. フロントへ返す（この一瞬だけパスワードが見える）
    return {
      success: true,
      data: {
        staffId,
        initialPassword,
        name,
        email, // デバッグ用
      },
    };
  } catch (error: any) {
    console.error("ユーザー作成エラー:", error);
    throw new HttpsError("internal", `ユーザー作成に失敗しました: ${error.message}`);
  }
});

// ========================================
// Cloud Function 2: パスワードリセット
// ========================================

interface ResetStaffAccountData {
  targetUid: string;
}

export const resetStaffAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const { targetUid } = request.data as ResetStaffAccountData;

  if (!targetUid) {
    throw new HttpsError("invalid-argument", "対象ユーザーIDが必要です");
  }

  // 対象ユーザーの取得と所属確認
  const targetUserDoc = await db.collection("users").doc(targetUid).get();

  if (!targetUserDoc.exists) {
    throw new HttpsError("not-found", "ユーザーが見つかりません");
  }

  const targetData = targetUserDoc.data();

  // 他事業所のスタッフを操作させないためのガード
  if (targetData?.establishmentId !== request.auth.token.eid && !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "権限がありません");
  }

  // 新しいパスワード生成
  const newPassword = generateRandomString(8, CHARS_PW);

  try {
    await admin.auth().updateUser(targetUid, { password: newPassword });

    // 既存のClaimsを維持しつつ、フラグだけ更新
    const currentUser = await admin.auth().getUser(targetUid);
    const currentClaims = currentUser.customClaims || {};

    await admin.auth().setCustomUserClaims(targetUid, {
      ...currentClaims,
      mustChangePassword: true,
    });

    return {
      success: true,
      newPassword,
    };
  } catch (error: any) {
    console.error("パスワードリセットエラー:", error);
    throw new HttpsError("internal", "パスワードリセットに失敗しました");
  }
});

// ========================================
// Cloud Function 3: 初回パスワード変更
// ========================================

interface ChangeInitialPasswordData {
  newPassword: string;
}

export const changeInitialPassword = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const { newPassword } = request.data as ChangeInitialPasswordData;

  if (!newPassword || newPassword.length < 8) {
    throw new HttpsError("invalid-argument", "パスワードは8文字以上で設定してください");
  }

  const uid = request.auth.uid;

  try {
    // パスワードを更新
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    // Custom Claims から mustChangePassword フラグを削除
    const currentUser = await admin.auth().getUser(uid);
    const currentClaims = currentUser.customClaims || {};

    await admin.auth().setCustomUserClaims(uid, {
      ...currentClaims,
      mustChangePassword: false,
    });

    return {
      success: true,
      message: "パスワードが正常に変更されました",
    };
  } catch (error: any) {
    console.error("パスワード変更エラー:", error);
    throw new HttpsError("internal", "パスワード変更に失敗しました");
  }
});

// ========================================
// Cloud Function 4: PINログイン
// ========================================

import { createHash } from "crypto";

// PINをハッシュ化（SHA-256）
function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

interface LoginWithPinData {
  deviceId: string;
  pin: string;
}

export const loginWithPinAuth = onCall(async (request) => {
  const { deviceId, pin } = request.data as LoginWithPinData;

  if (!deviceId || !pin) {
    throw new HttpsError("invalid-argument", "デバイスIDとPINが必要です");
  }

  // PIN検証（4〜6桁の数字）
  if (!/^\d{4,6}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "PINは4〜6桁の数字で入力してください");
  }

  try {
    // 信頼できるデバイスを取得
    const deviceRef = db.collection("trustedDevices").doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists) {
      throw new HttpsError("not-found", "このデバイスは登録されていません");
    }

    const deviceData = deviceSnap.data();
    if (!deviceData) {
      throw new HttpsError("not-found", "デバイス情報が見つかりません");
    }

    // PINハッシュを検証
    const inputPinHash = hashPin(pin);
    if (inputPinHash !== deviceData.pinHash) {
      throw new HttpsError("permission-denied", "PINが間違っています");
    }

    // 最終使用日時を更新
    await deviceRef.update({
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Custom tokenを生成
    const customToken = await admin.auth().createCustomToken(deviceData.uid);

    return {
      success: true,
      customToken,
      uid: deviceData.uid,
    };
  } catch (error: any) {
    console.error("PINログインエラー:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "PINログインに失敗しました");
  }
});
