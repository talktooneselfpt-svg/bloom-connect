"use client";

import { Building2, Settings } from "lucide-react";

export default function EstablishmentSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">事業所マイページ</h1>
          <p className="text-gray-600">
            事業所の業種・業態、契約アプリなどの情報を管理できます。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">事業所マイページ</h2>
          <p className="text-gray-600 mb-4">
            業種・業態の登録、契約アプリの確認などができます。
          </p>
          <p className="text-xs text-gray-400">※ 管理者のみアクセス可能（今後実装予定）</p>
        </div>
      </div>
    </div>
  );
}
