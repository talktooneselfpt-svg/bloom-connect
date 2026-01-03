"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // インストール可能になったときのイベントをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトのインストールプロンプトを防ぐ
      e.preventDefault()
      // イベントを保存して後で使用
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // カスタムプロンプトを表示
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // アプリが既にインストールされているかチェック
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // インストールプロンプトを表示
    deferredPrompt.prompt()

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("PWA installed")
    } else {
      console.log("PWA installation dismissed")
    }

    // プロンプトを使用後は削除
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // 1週間後に再度表示するためにローカルストレージに保存
    localStorage.setItem(
      "pwa-install-dismissed",
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    )
  }

  // 前回却下から7日経過しているかチェック
  useEffect(() => {
    const dismissedAt = localStorage.getItem("pwa-install-dismissed")
    if (dismissedAt) {
      const dismissDate = new Date(dismissedAt)
      if (new Date() < dismissDate) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              アプリをインストール
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              ブルームコネクトをホーム画面に追加して、より快適にご利用いただけます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                インストール
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                後で
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
