"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Shield,
  Smartphone,
  Lock,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getUserTrustedDevices,
  registerTrustedDevice,
  removeTrustedDevice,
  getTrustedDevice,
  type TrustedDevice,
} from "@/lib/auth/pin";
import { getOrCreateDeviceId } from "@/lib/auth/device";

export default function PinSettingsPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [isCurrentDeviceTrusted, setIsCurrentDeviceTrusted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/user/login");
      return;
    }

    try {
      const deviceId = getOrCreateDeviceId();
      setCurrentDeviceId(deviceId);

      // 全デバイスを取得
      const userDevices = await getUserTrustedDevices(user.uid);
      setDevices(userDevices);

      // 現在のデバイスがリストに含まれているかチェック
      const currentDevice = await getTrustedDevice(deviceId);
      setIsCurrentDeviceTrusted(!!currentDevice);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load devices:", error);
      setError("デバイス情報の読み込みに失敗しました");
      setLoading(false);
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // PIN検証
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PINは4〜6桁の数字で入力してください");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINが一致しません");
      return;
    }

    if (!deviceName.trim()) {
      setError("デバイス名を入力してください");
      return;
    }

    setSetupLoading(true);

    try {
      await registerTrustedDevice(pin, deviceName.trim());
      setSuccess("PINを設定しました。次回からPINでログインできます。");
      setShowSetupModal(false);
      setPin("");
      setConfirmPin("");
      setDeviceName("");
      await loadDevices();
    } catch (error: any) {
      console.error("Failed to setup PIN:", error);
      setError(error.message || "PIN設定に失敗しました");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm("このデバイスの信頼設定を解除しますか？")) {
      return;
    }

    try {
      await removeTrustedDevice(deviceId);
      setSuccess("デバイスの信頼設定を解除しました");
      await loadDevices();
    } catch (error) {
      console.error("Failed to remove device:", error);
      setError("デバイスの解除に失敗しました");
    }
  };

  const getDefaultDeviceName = () => {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android端末";
    if (/Mac/.test(ua)) return "Mac";
    if (/Windows/.test(ua)) return "Windows PC";
    return "このデバイス";
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            PIN認証設定
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            信頼できるデバイスでPINを使用してログインできます
          </p>
        </div>

        {/* 通知メッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {/* 現在のデバイス */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Smartphone className="text-blue-600" />
              このデバイス
            </h2>
            {isCurrentDeviceTrusted ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                登録済み
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                未登録
              </span>
            )}
          </div>

          {!isCurrentDeviceTrusted ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                このデバイスを信頼できるデバイスとして登録すると、PINでログインできるようになります。
              </p>
              <button
                onClick={() => {
                  setShowSetupModal(true);
                  setDeviceName(getDefaultDeviceName());
                }}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                このデバイスでPINを設定
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                このデバイスは信頼できるデバイスとして登録されています。次回からPINでログインできます。
              </p>
              <button
                onClick={() => handleRemoveDevice(currentDeviceId)}
                className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                信頼設定を解除
              </button>
            </div>
          )}
        </div>

        {/* 登録済みデバイス一覧 */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              登録済みデバイス一覧
            </h2>
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-800">{device.deviceName}</p>
                      <p className="text-xs text-gray-500">
                        登録: {device.createdAt.toDate().toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                  {device.deviceId === currentDeviceId && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      このデバイス
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIN設定モーダル */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="text-blue-600" />
                PIN設定
              </h3>

              <form onSubmit={handleSetupPin} className="space-y-4">
                {/* デバイス名 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    デバイス名
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900"
                    placeholder="iPhone"
                    required
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    PIN（4〜6桁の数字）
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900 text-center text-2xl tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>

                {/* PIN確認 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    PIN（確認）
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base text-gray-900 text-center text-2xl tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSetupModal(false);
                      setPin("");
                      setConfirmPin("");
                      setError("");
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    disabled={setupLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {setupLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "設定"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
