"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { Users, Plus, Edit, Key, UserX, UserCheck, Copy, Check, AlertCircle, Loader2, X } from "lucide-react";

interface StaffMember {
  uid: string;
  establishmentId: string;
  staffId: string;
  name: string;
  role: "admin" | "staff";
  jobType: string;
  createdAt: Timestamp;
  status: "active" | "suspended";
}

interface CreateStaffResult {
  success: boolean;
  data: {
    staffId: string;
    initialPassword: string;
    name: string;
    email: string;
  };
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdStaffData, setCreatedStaffData] = useState<CreateStaffResult["data"] | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [currentUserEid, setCurrentUserEid] = useState<string>("");
  const [error, setError] = useState("");

  // 新規作成フォーム
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "staff" as "admin" | "staff",
    jobType: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError("ログインが必要です");
        return;
      }

      // Custom Claimsから事業所IDを取得
      const tokenResult = await user.getIdTokenResult();
      const eid = tokenResult.claims.eid as string;
      setCurrentUserEid(eid);

      // 同じ事業所のスタッフを取得
      const q = query(
        collection(db, "users"),
        where("establishmentId", "==", eid)
      );
      const querySnapshot = await getDocs(q);

      const staff: StaffMember[] = [];
      querySnapshot.forEach((doc) => {
        staff.push({ uid: doc.id, ...doc.data() } as StaffMember);
      });

      // 作成日時でソート（新しい順）
      staff.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setStaffList(staff);
    } catch (err: any) {
      console.error("スタッフ一覧の取得エラー:", err);
      setError("スタッフ一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const createStaffAccount = httpsCallable<any, CreateStaffResult>(
        functions,
        "createStaffAccount"
      );

      const result = await createStaffAccount({
        name: newStaff.name,
        role: newStaff.role,
        jobType: newStaff.jobType,
      });

      // 作成成功：初期パスワードを表示
      setCreatedStaffData(result.data.data);
      setShowCreateModal(false);
      setShowPasswordModal(true);

      // フォームをリセット
      setNewStaff({ name: "", role: "staff", jobType: "" });

      // 一覧を再読み込み
      await loadStaffList();
    } catch (err: any) {
      console.error("スタッフ作成エラー:", err);
      setError("スタッフの作成に失敗しました: " + (err.message || ""));
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (uid: string, name: string) => {
    if (!confirm(`${name}さんのパスワードをリセットしますか？`)) {
      return;
    }

    try {
      const resetStaffAccount = httpsCallable<any, { success: boolean; newPassword: string }>(
        functions,
        "resetStaffAccount"
      );

      const result = await resetStaffAccount({ targetUid: uid });

      // 新しいパスワードを表示
      setCreatedStaffData({
        staffId: staffList.find((s) => s.uid === uid)?.staffId || "",
        initialPassword: result.data.newPassword,
        name: name,
        email: "",
      });
      setShowPasswordModal(true);
    } catch (err: any) {
      console.error("パスワードリセットエラー:", err);
      alert("パスワードのリセットに失敗しました");
    }
  };

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "active" ? "有効化" : "無効化";

    if (!confirm(`このスタッフを${action}しますか？`)) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", uid), {
        status: newStatus,
      });

      // 一覧を再読み込み
      await loadStaffList();
    } catch (err: any) {
      console.error("ステータス変更エラー:", err);
      alert("ステータスの変更に失敗しました");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">スタッフ管理</h1>
            <p className="text-gray-600">
              スタッフの登録・編集・削除などの管理ができます。
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            新規登録
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* スタッフ一覧 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  スタッフID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  氏名
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  役割
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  職種
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    スタッフが登録されていません
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.uid} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {staff.staffId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staff.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {staff.role === "admin" ? "管理者" : "スタッフ"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{staff.jobType || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staff.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {staff.status === "active" ? "有効" : "無効"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetPassword(staff.uid, staff.name)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="パスワードリセット"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(staff.uid, staff.status)}
                          className={`p-2 rounded-lg transition ${
                            staff.status === "active"
                              ? "text-gray-600 hover:bg-gray-100"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={staff.status === "active" ? "無効化" : "有効化"}
                        >
                          {staff.status === "active" ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 新規登録モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">スタッフ新規登録</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="山田 太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役割 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as "admin" | "staff" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  >
                    <option value="staff">スタッフ</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    職種
                  </label>
                  <input
                    type="text"
                    value={newStaff.jobType}
                    onChange={(e) => setNewStaff({ ...newStaff, jobType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="看護師、介護士など"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        作成中...
                      </>
                    ) : (
                      "登録"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 初期パスワード表示モーダル */}
        {showPasswordModal && createdStaffData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">スタッフ登録完了</h2>
                <p className="text-sm text-gray-600">
                  以下の情報を本人に安全な方法で伝えてください
                </p>
              </div>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    氏名
                  </label>
                  <p className="text-lg font-medium text-gray-900">{createdStaffData.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    個人ID（スタッフID）
                  </label>
                  <p className="text-lg font-mono font-bold text-blue-600">{createdStaffData.staffId}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    初期パスワード
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-bold text-red-600 flex-1">
                      {createdStaffData.initialPassword}
                    </p>
                    <button
                      onClick={() => copyToClipboard(createdStaffData.initialPassword)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                      title="コピー"
                    >
                      {copiedPassword ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ 重要:</strong> このパスワードは一度しか表示されません。
                  必ずメモするかコピーしてから閉じてください。
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCreatedStaffData(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
