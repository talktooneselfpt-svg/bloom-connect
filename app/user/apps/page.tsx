"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Grid3x3,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  Lock,
  CheckCircle2,
  Loader2,
  Activity,
  ClipboardList,
} from "lucide-react";

interface App {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  path: string;
  requiredPlan: "demo" | "paid";
  status: "available" | "coming_soon" | "beta";
}

const APPS: App[] = [
  {
    id: "incident-report",
    name: "ヒヤリハット",
    description: "ヒヤリハット報告の作成・管理",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    path: "/user/apps/incident-report",
    requiredPlan: "paid",
    status: "coming_soon",
  },
  {
    id: "shift",
    name: "シフト管理",
    description: "スタッフのシフト作成・確認",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    path: "/user/apps/shift",
    requiredPlan: "paid",
    status: "coming_soon",
  },
  {
    id: "patients",
    name: "利用者記録",
    description: "利用者の記録・管理",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
    path: "/user/settings/patients",
    requiredPlan: "paid",
    status: "available",
  },
  {
    id: "staff",
    name: "スタッフ管理",
    description: "スタッフアカウントの管理",
    icon: Settings,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    path: "/user/settings/staff",
    requiredPlan: "paid",
    status: "available",
  },
  {
    id: "reports",
    name: "レポート作成",
    description: "各種レポートの作成・出力",
    icon: FileText,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    path: "/user/apps/reports",
    requiredPlan: "paid",
    status: "coming_soon",
  },
  {
    id: "community",
    name: "コミュニティ",
    description: "情報共有・質問フォーラム",
    icon: MessageSquare,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    path: "/user/community",
    requiredPlan: "demo",
    status: "coming_soon",
  },
  {
    id: "notifications",
    name: "通知センター",
    description: "重要な通知の確認",
    icon: Bell,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    path: "/user/notifications",
    requiredPlan: "demo",
    status: "coming_soon",
  },
  {
    id: "vital-signs",
    name: "バイタル記録",
    description: "体温・血圧などの記録",
    icon: Activity,
    color: "text-red-600",
    bgColor: "bg-red-100",
    path: "/user/apps/vital-signs",
    requiredPlan: "paid",
    status: "coming_soon",
  },
  {
    id: "care-plan",
    name: "ケアプラン",
    description: "ケアプランの作成・管理",
    icon: ClipboardList,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    path: "/user/apps/care-plan",
    requiredPlan: "paid",
    status: "coming_soon",
  },
];

type TabType = "all" | "available" | "paid";

export default function AppsPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<"demo" | "paid">("demo");
  const [userRole, setUserRole] = useState<"admin" | "staff">("staff");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/user/login");
      return;
    }

    try {
      const tokenResult = await user.getIdTokenResult();
      const plan = (tokenResult.claims.plan as "demo" | "paid") || "demo";
      const role = (tokenResult.claims.role as "admin" | "staff") || "staff";

      setUserPlan(plan);
      setUserRole(role);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load user info:", error);
      setLoading(false);
    }
  };

  const handleAppClick = (app: App) => {
    if (app.status === "coming_soon") {
      alert("このアプリは開発中です。しばらくお待ちください。");
      return;
    }

    if (app.requiredPlan === "paid" && userPlan === "demo") {
      alert("この機能は有料プランでのみ利用可能です。");
      return;
    }

    router.push(app.path);
  };

  const filteredApps = APPS.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "available") return app.status === "available";
    if (activeTab === "paid") return app.requiredPlan === "paid";
    return true;
  });

  const availableAppsCount = APPS.filter((app) => app.status === "available").length;
  const paidAppsCount = APPS.filter((app) => app.requiredPlan === "paid").length;

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
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">アプリ一覧</h1>
          <p className="text-sm text-gray-600 mt-1">
            利用可能なアプリを確認して、業務に役立ててください
          </p>
        </div>

        {/* プラン情報 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">現在のプラン</p>
              <p className="text-lg font-bold text-gray-800">
                {userPlan === "paid" ? "有料プラン" : "デモプラン"}
              </p>
            </div>
            {userPlan === "demo" && (
              <button
                onClick={() => router.push("/user/settings/billing")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                有料プランにアップグレード
              </button>
            )}
          </div>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                activeTab === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              すべて ({APPS.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                activeTab === "available"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              利用可能 ({availableAppsCount})
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                activeTab === "paid"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              有料プラン限定 ({paidAppsCount})
            </button>
          </div>
        </div>

        {/* アプリグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            const isLocked = app.requiredPlan === "paid" && userPlan === "demo";
            const isAvailable = app.status === "available";

            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition hover:shadow-lg ${
                  isAvailable && !isLocked
                    ? "border-gray-200 hover:border-blue-400"
                    : "border-gray-200 opacity-75"
                }`}
              >
                {/* アイコンとステータス */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-full ${app.bgColor} flex items-center justify-center`}>
                    <Icon className={app.color} size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {isLocked && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded flex items-center gap-1">
                        <Lock size={10} />
                        有料
                      </span>
                    )}
                    {app.status === "available" && !isLocked && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        利用可能
                      </span>
                    )}
                    {app.status === "coming_soon" && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        開発中
                      </span>
                    )}
                    {app.status === "beta" && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        β版
                      </span>
                    )}
                  </div>
                </div>

                {/* タイトルと説明 */}
                <h3 className="text-lg font-bold text-gray-800 mb-1">{app.name}</h3>
                <p className="text-sm text-gray-600">{app.description}</p>

                {/* ロック時のメッセージ */}
                {isLocked && (
                  <p className="text-xs text-orange-600 mt-2">
                    有料プランへのアップグレードが必要です
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* フィルター結果なし */}
        {filteredApps.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">該当するアプリがありません</p>
          </div>
        )}

        {/* フッター情報 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">アプリについて</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 利用可能なアプリは順次追加されます</p>
            <p>• 有料プランでは、すべてのアプリが利用可能です</p>
            <p>• アプリのリクエストは<a href="/user/community" className="text-blue-600 hover:underline">コミュニティ</a>からお願いします</p>
          </div>
        </div>
      </div>
    </div>
  );
}
