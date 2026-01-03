"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Clock,
  Calendar,
  Bell,
  TrendingUp,
  Activity,
  Users,
  AlertCircle,
  CheckCircle2,
  Star,
  Settings,
  FileText,
  Loader2,
} from "lucide-react";

export default function UserHomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "staff">("staff");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || "ゲスト");

        // Custom Claimsからロールを取得
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role as "admin" | "staff" | undefined;
        if (role) {
          setUserRole(role);
        }
        setIsLoading(false);
      } else {
        // 未認証の場合はログイン画面へ
        router.push("/user/login");
      }
    });

    // 現在時刻の更新（1分ごと）
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [router]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // サンプルデータ（今後実装するアプリの使用履歴から取得）
  const frequentApps = [
    { id: 1, name: "ヒヤリハット", icon: AlertCircle, color: "bg-orange-100 text-orange-600", path: "/user/apps/incident-report" },
    { id: 2, name: "シフト管理", icon: Calendar, color: "bg-blue-100 text-blue-600", path: "/user/apps/shift" },
    { id: 3, name: "利用者記録", icon: Users, color: "bg-green-100 text-green-600", path: "/user/settings/patients" },
  ];

  const recentNotifications = [
    { id: 1, title: "新しいスタッフが追加されました", time: "2時間前", type: "info" as const },
    { id: 2, title: "今月のシフトが確定しました", time: "5時間前", type: "success" as const },
    { id: 3, title: "システムメンテナンスのお知らせ", time: "1日前", type: "warning" as const },
  ];

  const monthlyUpdate = {
    title: "2026年1月のアップデート",
    items: [
      "スタッフ管理機能の完全実装",
      "入力フィールドの文字色を黒に統一",
      "Service Worker削除スクリプト追加",
    ],
  };

  const quickActions = userRole === "admin"
    ? [
        { label: "スタッフ管理", path: "/user/settings/staff", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
        { label: "利用者管理", path: "/user/settings/patients", color: "bg-green-50 text-green-700 hover:bg-green-100" },
        { label: "施設設定", path: "/user/settings/establishment", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
      ]
    : [
        { label: "利用者記録を見る", path: "/user/settings/patients", color: "bg-green-50 text-green-700 hover:bg-green-100" },
        { label: "今日のシフトを確認", path: "/user/apps/shift", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
        { label: "コミュニティに投稿", path: "/user/community", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
      ];

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              ようこそ、{userName} さん
            </h1>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                <span className="text-lg font-semibold">{formatTime(currentTime)}</span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
            </div>
          </div>
          <p className="text-gray-600">本日もお疲れ様です。業務を開始しましょう。</p>
        </div>

        {/* メインコンテンツ - 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム */}
          <div className="lg:col-span-2 space-y-6">
            {/* よく使うアプリ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-500" size={20} />
                <h2 className="text-lg font-bold text-gray-800">よく使うアプリ</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {frequentApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => router.push(app.path)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className={`w-12 h-12 rounded-full ${app.color} flex items-center justify-center mb-2`}>
                      <app.icon size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{app.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                ※ 使用履歴に基づいて表示されます（今後実装予定）
              </p>
            </div>

            {/* 今月のアップデート */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">{monthlyUpdate.title}</h2>
              </div>
              <ul className="space-y-2">
                {monthlyUpdate.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-600">
                  新機能へのフィードバックは
                  <a href="/user/community" className="text-blue-600 hover:underline ml-1">
                    コミュニティ
                  </a>
                  でお待ちしています！
                </p>
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            {/* 最新の通知 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-800">最新の通知</h2>
                </div>
                <a
                  href="/user/notifications"
                  className="text-xs text-blue-600 hover:underline"
                >
                  すべて見る
                </a>
              </div>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {notification.type === "success" && (
                          <CheckCircle2 className="text-green-500" size={16} />
                        )}
                        {notification.type === "info" && (
                          <Bell className="text-blue-500" size={16} />
                        )}
                        {notification.type === "warning" && (
                          <AlertCircle className="text-orange-500" size={16} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-green-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">クイックアクション</h2>
              </div>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(action.path)}
                    className={`w-full px-4 py-2 ${action.color} rounded-lg transition text-sm font-medium text-left`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {userRole === "admin"
                    ? "管理者として、施設全体の設定や管理が可能です"
                    : "各機能へのクイックアクセスができます"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
