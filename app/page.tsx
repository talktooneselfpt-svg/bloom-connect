"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 認証状態を確認してリダイレクト
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // ログイン済み → ユーザーホーム画面へ
        router.push("/user/home")
      } else {
        // 未ログイン → ログイン画面へ
        router.push("/user/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  // リダイレクト中のローディング表示
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <p className="text-sm text-gray-600">読み込み中...</p>
    </div>
  )
}
