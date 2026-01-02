"use client";

import { FileText, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">利用規約</h1>
          <p className="text-gray-600">
            Bloom Connectをご利用いただくための規約です。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <Scale className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">利用規約</h2>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-bold text-gray-800 mb-2">第1条（目的）</h3>
            <p className="text-sm text-gray-600 mb-4">
              本規約は、株式会社Bright Bloom（以下「当社」といいます。）が提供する
              Bloom Connect（以下「本サービス」といいます。）の利用条件を定めるものです。
            </p>

            <h3 className="text-lg font-bold text-gray-800 mb-2">第2条（適用）</h3>
            <p className="text-sm text-gray-600 mb-4">
              本規約は、本サービスの利用に関して、当社とユーザーとの間に適用されます。
            </p>

            <h3 className="text-lg font-bold text-gray-800 mb-2">第3条（禁止事項）</h3>
            <p className="text-sm text-gray-600 mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc mb-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社のサービスの運営を妨害する行為</li>
            </ul>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                ※ 詳細な利用規約は今後整備予定です
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
