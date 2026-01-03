// 静的エクスポート用の設定 - プレースホルダーパスを生成
export async function generateStaticParams() {
  // プレースホルダーパスを1つ生成（Firebase Hostingのrewrite設定で実際のルーティングを処理）
  return [{ id: 'index' }]
}

export default function CommunityPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
