"use client";

import { Users, MessageSquare, ThumbsUp } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">コミュニティ</h1>
          <p className="text-gray-600">
            エンドユーザーの皆様と一緒にこのアプリを作り上げていきます。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">コミュニティ機能</h2>
          <p className="text-gray-600 mb-4">
            追加してほしい機能や使用感などを共有できます。
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>投稿</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp size={16} />
              <span>リアクション</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">※ 今後実装予定</p>
        </div>
      </div>
    </div>
  );
}
