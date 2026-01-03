"use client";

import { HelpCircle, BookOpen, Video, FileText } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ヘルプ</h1>
          <p className="text-gray-600">
            ブルームコネクトの使い方や機能について確認できます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">マニュアル</h3>
            <p className="text-sm text-gray-600">操作方法を確認</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Video className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">動画ガイド</h3>
            <p className="text-sm text-gray-600">動画で学ぶ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">FAQ</h3>
            <p className="text-sm text-gray-600">よくある質問</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">ヘルプコンテンツは今後充実させていきます。</p>
          <p className="text-xs text-gray-400 mt-2">※ 今後実装予定</p>
        </div>
      </div>
    </div>
  );
}
