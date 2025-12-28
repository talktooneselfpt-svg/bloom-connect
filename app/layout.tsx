import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// ナビゲーションを動的にインポート（初期ロードを高速化）
const Navigation = dynamic(() => import("@/components/Navigation"), {
  ssr: true,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ブルームコネクト",
  description: "介護・医療施設向けスタッフ管理システム",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ブルームコネクト"
  },
  other: {
    'link': 'preconnect https://firestore.googleapis.com, preconnect https://identitytoolkit.googleapis.com'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <Navigation />
        <div className="lg:ml-64">
          {children}
        </div>
      </body>
    </html>
  );
}
