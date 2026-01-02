"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

export default function ForceChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (newPassword.length < 8) {
      setError("パスワードは8文字以上で設定してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません。もう一度確認してください。");
      return;
    }

    setLoading(true);

    try {
      // 現在のユーザー情報を保存（サインアウト後に使用）
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("ユーザー情報が取得できません");
      }

      // Cloud Functions: パスワード更新とClaimsのフラグ除去を行う関数
      const changeInitialPassword = httpsCallable(functions, "changeInitialPassword");
      await changeInitialPassword({ newPassword });

      // パスワード変更後、既存のトークンは無効になるため一度サインアウト
      await auth.signOut();

      // 新しいパスワードで自動再ログイン
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, currentUser.email, newPassword);

      // 成功メッセージを表示してからホームへリダイレクト
      alert("パスワードが正常に変更されました。ホーム画面に移動します。");
      router.push("/user/home");
    } catch (err: any) {
      console.error("パスワード変更エラー:", err);
      setError("パスワード変更に失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-4 border-yellow-400">
        {/* アイコンとタイトル */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full mb-4 shadow-md">
            <Lock className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            パスワードの変更が必要です
          </h2>
          <p className="text-sm text-gray-500 text-center mt-3 leading-relaxed">
            セキュリティ保護のため、管理者が発行した初期パスワードから、
            <br />
            あなただけの新しいパスワードに変更してください。
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新しいパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-base"
                placeholder="8文字以上の英数字"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">※ 8文字以上で設定してください</p>
          </div>

          {/* パスワード確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認用）
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-base"
                placeholder="もう一度入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                更新中...
              </>
            ) : (
              "パスワードを変更して開始"
            )}
          </button>
        </form>

        {/* 注意事項 */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>💡 ヒント:</strong> パスワードは忘れないように、安全な場所にメモしておくことをおすすめします。
            忘れた場合は、管理者に再設定を依頼してください。
          </p>
        </div>
      </div>
    </div>
  );
}
