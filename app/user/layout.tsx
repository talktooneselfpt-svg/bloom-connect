"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/user/AuthGuard";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Grid3x3,
  Users,
  Bell,
  Settings,
  Building2,
  UserCircle,
  CreditCard,
  HelpCircle,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.role === "admin");
        setUserName(user.displayName || "ユーザー");
      }
    });

    return () => unsubscribe();
  }, []);

  const menuItems: MenuItem[] = [
    { icon: Home, label: "ホーム", path: "/user/home" },
    { icon: Grid3x3, label: "アプリ一覧", path: "/user/apps" },
    { icon: Users, label: "コミュニティ", path: "/user/community" },
    { icon: Bell, label: "通知詳細", path: "/user/notifications" },
  ];

  const adminMenuItems: MenuItem[] = [
    { icon: Building2, label: "事業所マイページ", path: "/user/settings/establishment", adminOnly: true },
    { icon: UserCircle, label: "利用者管理", path: "/user/settings/patients", adminOnly: true },
    { icon: Users, label: "スタッフ管理", path: "/user/settings/staff", adminOnly: true },
    { icon: CreditCard, label: "決済管理", path: "/user/settings/billing", adminOnly: true },
  ];

  const otherMenuItems: MenuItem[] = [
    { icon: HelpCircle, label: "お問い合わせ", path: "/user/support" },
    { icon: HelpCircle, label: "ヘルプ", path: "/user/help" },
    { icon: FileText, label: "利用規約", path: "/user/terms" },
  ];

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await auth.signOut();
      router.push("/user/login");
    }
  };

  // ログイン画面と強制変更画面ではサイドバーを表示しない
  if (pathname === "/user/login" || pathname === "/user/force-change-password") {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* サイドバー */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
        >
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">Bloom Connect</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* メニュー */}
          <nav className="flex-1 overflow-y-auto py-4">
            {/* メインメニュー */}
            <div className="px-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
            </div>

            {/* 管理機能セクション（管理者のみ） */}
            {isAdmin && (
              <>
                <div className="px-3 mt-6 mb-2">
                  {sidebarOpen && (
                    <span className="text-xs font-semibold text-gray-400 uppercase">管理機能</span>
                  )}
                </div>
                <div className="px-3 space-y-1">
                  {adminMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                        pathname === item.path
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon size={20} />
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* その他セクション */}
            <div className="px-3 mt-6 mb-2">
              {sidebarOpen && (
                <span className="text-xs font-semibold text-gray-400 uppercase">その他</span>
              )}
            </div>
            <div className="px-3 space-y-1">
              {otherMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
          </nav>

          {/* ユーザー情報 & ログアウト */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">ログイン中</p>
                <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">ログアウト</span>}
            </button>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
