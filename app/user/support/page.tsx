"use client";

import { HelpCircle, Mail, MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">お問い合わせ</h1>
          <p className="text-gray-600">
            ご質問やご要望がございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">お問い合わせフォーム</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Mail className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-blue-800 mb-1">メールでのお問い合わせ</h3>
                <p className="text-sm text-blue-700">support@bloom-connect.jp</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <MessageCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-green-800 mb-1">チャットサポート</h3>
                <p className="text-sm text-green-700">平日 9:00-18:00（今後実装予定）</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            ※ お問い合わせフォームは今後実装予定です
          </p>
        </div>
      </div>
    </div>
  );
}
