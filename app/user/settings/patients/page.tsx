"use client";

import { UserCircle, Plus } from "lucide-react";

export default function PatientsManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">利用者管理</h1>
            <p className="text-gray-600">
              利用者の登録・編集、一時非表示化などの管理ができます。
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={20} />
            新規登録
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">利用者管理</h2>
          <p className="text-gray-600 mb-4">
            利用者の一覧表示（10名ずつロード）、新規登録、編集、削除機能を実装予定です。
          </p>
          <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto text-left">
            <li>✓ 利用中/一時中止のタブ切り替え</li>
            <li>✓ 無限スクロール（10名ずつロード）</li>
            <li>✓ 一時非表示（半年後に自動削除）</li>
          </ul>
          <p className="text-xs text-gray-400 mt-6">※ 今後実装予定</p>
        </div>
      </div>
    </div>
  );
}
