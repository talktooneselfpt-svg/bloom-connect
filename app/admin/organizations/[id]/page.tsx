import { OrganizationDetail } from './OrganizationDetail'

// 静的エクスポート用の空のgenerateStaticParams
export async function generateStaticParams() {
  return []
}

// ビルド時に存在しないパスもクライアントサイドで処理可能にする
export const dynamicParams = true

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  return <OrganizationDetail organizationId={params.id} />
}
