"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// ナビゲーションを動的にインポート（初期ロードを高速化）
const Navigation = dynamic(() => import("@/components/Navigation"), {
  ssr: true,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
});

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /user/* 配下ではNavigationを表示しない
  const isUserRoute = pathname.startsWith("/user");

  if (isUserRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <div className="lg:ml-64">
        {children}
      </div>
    </>
  );
}
