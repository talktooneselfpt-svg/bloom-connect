import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // 静的エクスポート時に画像最適化を無効化
  images: {
    unoptimized: true,
  },
  // トレイリングスラッシュを追加してFirebase Hostingと互換性を持たせる
  trailingSlash: true,
};

export default nextConfig;
