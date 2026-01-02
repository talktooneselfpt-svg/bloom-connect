"use client";

import { Bell, Inbox } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">通知詳細</h1>
          <p className="text-gray-600">
            事業所からの通知、スタッフ間の連絡、運営からのお知らせを確認できます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-bold text-red-800 mb-1">代表/管理者（重要）</h3>
            <p className="text-sm text-red-600">0件</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 mb-1">スタッフ間（業務連絡）</h3>
            <p className="text-sm text-blue-600">0件</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-bold text-green-800 mb-1">運営（ニュース）</h3>
            <p className="text-sm text-green-600">0件</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">通知機能</h2>
          <p className="text-gray-600">既読管理機能付きの通知システムを実装予定です。</p>
          <p className="text-xs text-gray-400 mt-4">※ 今後実装予定</p>
        </div>
      </div>
    </div>
  );
}
