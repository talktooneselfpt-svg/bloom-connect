"use client";

import { Grid3x3, Plus } from "lucide-react";

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">アプリ一覧</h1>
          <p className="text-gray-600">契約中のアプリと利用可能なアプリを確認できます。</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">アプリ一覧</h2>
          <p className="text-gray-600 mb-4">
            今後実装予定のアプリがここに表示されます。
          </p>
          <p className="text-sm text-gray-500">
            ※ ヒヤリハット、シフト管理などのアプリを順次追加予定
          </p>
        </div>
      </div>
    </div>
  );
}
