"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import { auth, functions } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Building2, User, Lock, ArrowRight, AlertCircle, Loader2, Smartphone, Shield } from "lucide-react";
import { getOrCreateDeviceId } from "@/lib/auth/device";
import { getTrustedDevice } from "@/lib/auth/pin";
import { httpsCallable } from "firebase/functions";

type LoginMode = "password" | "pin";

export default function UserLoginPage() {
  const router = useRouter();

  // LocalStorageから事業所IDを復元
  const [eid, setEid] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [isTrustedDevice, setIsTrustedDevice] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    // クライアントサイドでのみLocalStorageにアクセス
    const savedEid = localStorage.getItem("saved_eid");
    if (savedEid) {
      setEid(savedEid);
    }

    // 信頼できるデバイスかチェック
    const checkTrustedDevice = async () => {
      try {
        const deviceId = getOrCreateDeviceId();
        const device = await getTrustedDevice(deviceId);

        if (device) {
          setIsTrustedDevice(true);
          setDeviceName(device.deviceName);
          setLoginMode("pin"); // デフォルトでPINログイン
        }
      } catch (error) {
        console.error("Failed to check trusted device:", error);
      }
    };

    checkTrustedDevice();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginMode === "pin") {
        // PINログイン
        const deviceId = getOrCreateDeviceId();
        const loginWithPinAuth = httpsCallable(functions, "loginWithPinAuth");

        const result = await loginWithPinAuth({ deviceId, pin });
        const data = result.data as { success: boolean; customToken?: string; uid?: string };

        if (!data.success || !data.customToken) {
          setError("PINが間違っています。");
          setLoading(false);
          return;
        }

        // Custom tokenでFirebase Authにサインイン
        await signInWithCustomToken(auth, data.customToken);

        // ログイン成功後、ホームへリダイレクト
        router.push("/user/home");
      } else {
        // パスワードログイン
        const syntheticEmail = `${eid}-${staffId}@sys.bloom-connect.jp`;

        await signInWithEmailAndPassword(auth, syntheticEmail, password);

        // 成功したら次回用にEIDを保存
        localStorage.setItem("saved_eid", eid);

        // AuthGuardが自動的にリダイレクトするので、ここでは何もしない
        // 念のため手動でホームへ
        router.push("/user/home");
      }
    } catch (err: any) {
      console.error("ログインエラー:", err);

      // エラーメッセージの日本語化
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("IDまたはパスワードが間違っています。");
      } else if (err.code === "auth/too-many-requests") {
        setError("ログイン試行回数が多すぎます。しばらくしてから再度お試しください。");
      } else {
        setError("ログインに失敗しました。時間をおいて再度お試しください。");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ブルームコネクト</h1>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">スタッフログイン</h2>

          {/* PIN/パスワード切り替えタブ（信頼できるデバイスの場合のみ表示） */}
          {isTrustedDevice && (
            <div className="mb-6 flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMode("pin")}
                className={`flex-1 py-2 px-4 rounded-md transition font-medium text-sm flex items-center justify-center gap-2 ${
                  loginMode === "pin"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Smartphone size={16} />
                PIN
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("password")}
                className={`flex-1 py-2 px-4 rounded-md transition font-medium text-sm flex items-center justify-center gap-2 ${
                  loginMode === "password"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Lock size={16} />
                パスワード
              </button>
            </div>
          )}

          {/* 信頼できるデバイスの表示 */}
          {isTrustedDevice && loginMode === "pin" && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <Shield size={16} />
              信頼できるデバイス: {deviceName}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === "pin" ? (
              /* PINモード */
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  PIN（4〜6桁）
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-base text-gray-900 text-center text-2xl tracking-widest"
                    placeholder="••••"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  信頼できるデバイスでPINを使用してログインできます
                </p>
              </div>
            ) : (
              /* パスワードモード */
              <>
                {/* 事業所ID (6桁) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    事業所ID
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={eid}
                      onChange={(e) => setEid(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900"
                      placeholder="100001"
                      required
                    />
                  </div>
                </div>

                {/* 個人ID (5桁) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    個人ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      maxLength={5}
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value.toLowerCase())}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900"
                      placeholder="a1b2c"
                      required
                    />
                  </div>
                </div>

                {/* パスワード */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    パスワード
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => alert("パスワードを忘れた場合は、管理者にお問い合わせください。")}
                    >
                      パスワードを忘れた場合
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  ログイン <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* デモプランへのリンク */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">初めてご利用の方</p>
            <button
              type="button"
              onClick={() => router.push("/demo")}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              デモプランを試す →
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2026 Bright Bloom Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
