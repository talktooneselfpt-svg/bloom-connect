"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, IdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // 未ログイン時はログイン画面へ
        if (pathname !== "/user/login") {
          router.push("/user/login");
        }
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      // ログイン済み：Custom Claimsをチェック
      try {
        const tokenResult: IdTokenResult = await user.getIdTokenResult();
        const mustChange = tokenResult.claims.mustChangePassword;

        if (mustChange) {
          // 強制変更フラグが立っている場合
          if (pathname !== "/user/force-change-password") {
            router.push("/user/force-change-password");
          }
        } else {
          // 正常なユーザーが変更画面に迷い込んだらホームへ戻す
          if (pathname === "/user/force-change-password") {
            router.push("/user/home");
          }
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("認証エラー:", error);
        router.push("/user/login");
        setAuthenticated(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-600">読み込み中...</p>
      </div>
    );
  }

  // ログインページと強制変更ページは認証不要
  if (pathname === "/user/login" || pathname === "/user/force-change-password") {
    return <>{children}</>;
  }

  // 認証済みでない場合は何も表示しない（リダイレクト中）
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
