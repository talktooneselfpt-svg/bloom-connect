"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Service Workerの登録
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration.scope)

            // 更新チェック
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // 新しいService Workerが利用可能
                    console.log("New Service Worker available")

                    // ユーザーに更新を通知（オプション）
                    if (
                      confirm(
                        "新しいバージョンが利用可能です。ページを更新しますか？"
                      )
                    ) {
                      newWorker.postMessage({ type: "SKIP_WAITING" })
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })

        // Service Workerの制御が変更されたときにリロード
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload()
        })
      })
    }
  }, [])

  return null // このコンポーネントは何も描画しない
}
