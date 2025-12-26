import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // 静的エクスポート時に画像最適化を無効化
  images: {
    unoptimized: true,
  },
  // トレイリングスラッシュを追加してFirebase Hostingと互換性を持たせる
  trailingSlash: true,
  // パフォーマンス最適化
  swcMinify: true, // SWCによる高速なミニファイ
  compress: true, // Gzip圧縮を有効化
  poweredByHeader: false, // X-Powered-Byヘッダーを削除（セキュリティ向上）
  reactStrictMode: true, // Reactの厳格モードを有効化
  // 本番ビルドの最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // エラーと警告以外のconsole.logを削除
    } : false,
  },
};

export default nextConfig;
