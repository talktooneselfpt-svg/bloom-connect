"use client";

import { Users, Plus } from "lucide-react";

export default function StaffManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">スタッフ管理</h1>
            <p className="text-gray-600">
              スタッフの登録・編集・削除などの管理ができます。
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={20} />
            新規登録
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">スタッフ管理</h2>
          <p className="text-gray-600 mb-4">
            所属部署ごとの一覧表示、新規作成、変更、削除機能を実装予定です。
          </p>
          <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto text-left">
            <li>✓ 所属部署別の表示</li>
            <li>✓ 個人ID・初期パスワードの自動生成</li>
            <li>✓ パスワードリセット機能</li>
          </ul>
          <p className="text-xs text-gray-400 mt-6">※ 管理者のみアクセス可能（今後実装予定）</p>
        </div>
      </div>
    </div>
  );
}
