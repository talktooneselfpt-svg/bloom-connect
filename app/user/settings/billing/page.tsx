"use client";

import { CreditCard, DollarSign } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">決済管理</h1>
          <p className="text-gray-600">
            サブスクリプション料金の確認と決済方法の管理ができます。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">決済管理</h2>
          <p className="text-gray-600 mb-4">
            外部APIを導入予定です（Stripe等）。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-bold text-blue-800 mb-2">料金体系</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>・基本使用料: 2,000円/月（20名まで）</li>
              <li>・追加料金: 1,500円/10名</li>
              <li>・アプリごとの追加料金</li>
            </ul>
          </div>
          <p className="text-xs text-gray-400 mt-6">※ 今後実装予定</p>
        </div>
      </div>
    </div>
  );
}
