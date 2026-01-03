"use client"

import { useEffect } from "react"
import { setupGlobalErrorHandlers } from "@/lib/errorLogger"

export default function GlobalErrorHandler() {
  useEffect(() => {
    // グローバルエラーハンドラーをセットアップ
    setupGlobalErrorHandlers()
  }, [])

  return null // このコンポーネントは何も描画しない
}
