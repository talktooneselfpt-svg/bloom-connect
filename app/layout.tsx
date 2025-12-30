import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import dynamic from "next/dynamic";

// ナビゲーションを動的にインポート（初期ロードを高速化）
const ConditionalNavigation = dynamic(() => import("@/components/ConditionalNavigation"), {
  ssr: true,
  loading: () => null
});

const ConditionalLayout = dynamic(() => import("@/components/ConditionalLayout"), {
  ssr: true,
  loading: () => null
});

const ServiceWorkerRegister = dynamic(() => import("@/components/ServiceWorkerRegister"), {
  ssr: true,
  loading: () => null
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
  description: "介護・医療施設向け職員・利用者管理システム",
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
        <Providers>
          <ServiceWorkerRegister />
          <ConditionalNavigation />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
