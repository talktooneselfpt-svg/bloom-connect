'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">利用規約</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 mb-4">
                本規約は、ブルームコネクト（以下「当サービス」といいます）の利用に関する条件を、当サービスを利用するお客様（以下「利用者」といいます）と当社との間で定めるものです。
              </p>
              <p className="text-gray-700 mb-4">
                利用者は、本規約に同意した上で、当サービスを利用するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第2条（定義）</h2>
              <p className="text-gray-700 mb-4">
                本規約において使用する用語の定義は、以下のとおりとします。
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>「当サービス」とは、当社が提供する職員・利用者管理サービス「ブルームコネクト」を意味します。</li>
                <li>「利用者」とは、本規約に同意の上、当サービスを利用する個人または法人を意味します。</li>
                <li>「利用契約」とは、本規約を契約条件として当社と利用者の間で締結される、当サービスの利用契約を意味します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第3条（利用登録）</h2>
              <p className="text-gray-700 mb-4">
                利用希望者は、本規約を遵守することに同意し、当社所定の方法により利用登録を申請するものとします。
              </p>
              <p className="text-gray-700 mb-4">
                当社は、当社の基準に従って、利用登録の可否を判断し、当社が登録を認める場合にはその旨を申請者に通知します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第4条（アカウント情報の管理）</h2>
              <p className="text-gray-700 mb-4">
                利用者は、自己の責任において、当サービスに関するアカウント情報を適切に管理および保管するものとし、これを第三者に利用させ、または貸与、譲渡、名義変更、売買等をしてはならないものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第5条（利用料金および支払方法）</h2>
              <p className="text-gray-700 mb-4">
                利用者は、当サービスの利用の対価として、当社が別途定め、当サイトに表示する利用料金を、当社が指定する方法により支払うものとします。
              </p>
              <p className="text-gray-700 mb-4">
                利用料金は、以下のとおりとします：
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>デモプラン：無料（30日間、スタッフ3名まで）</li>
                <li>サブスクプラン：基本料金 月額2,000円（スタッフ20名まで）+ スタッフ20名超過時は10名ごとに月額1,000円 + プロダクト料金</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第6条（禁止事項）</h2>
              <p className="text-gray-700 mb-4">
                利用者は、当サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、当サービスの他の利用者、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
                <li>当サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>不正な目的を持って当サービスを利用する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第7条（サービスの停止等）</h2>
              <p className="text-gray-700 mb-4">
                当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく当サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>当サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が当サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第8条（免責事項）</h2>
              <p className="text-gray-700 mb-4">
                当社は、当サービスに関して、利用者と他の利用者または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第9条（個人情報の取扱い）</h2>
              <p className="text-gray-700 mb-4">
                当社は、当サービスの利用によって取得する個人情報については、当社のプライバシーポリシーに従い適切に取り扱うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第10条（利用規約の変更）</h2>
              <p className="text-gray-700 mb-4">
                当社は、利用者の承諾を得ることなく、いつでも本規約の内容を変更することができるものとします。変更後の利用規約は、当社が別途定める場合を除いて、当サイト上に表示した時点より効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第11条（準拠法・裁判管轄）</h2>
              <p className="text-gray-700 mb-4">
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p className="text-gray-700 mb-4">
                当サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                2025年1月1日 制定
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
