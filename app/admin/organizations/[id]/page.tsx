import { OrganizationDetail } from './OrganizationDetail'

// 静的エクスポート用の空のgenerateStaticParams
// クライアントサイドで動的にデータを取得
export async function generateStaticParams() {
  return []
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  return <OrganizationDetail organizationId={params.id} />
}
