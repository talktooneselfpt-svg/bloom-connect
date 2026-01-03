"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import {
  UserCircle,
  Plus,
  Edit2,
  EyeOff,
  Eye,
  Loader2,
  AlertCircle,
  Search,
  Calendar,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  nameKana: string;
  dateOfBirth: Timestamp;
  gender: "male" | "female" | "other";
  phone?: string;
  address?: string;
  notes?: string;
  status: "active" | "suspended";
  suspendedAt?: Timestamp;
  establishmentId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type TabType = "active" | "suspended";

const PATIENTS_PER_PAGE = 10;

export default function PatientsManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const observerTarget = useRef<HTMLDivElement>(null);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    nameKana: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    loadPatients(true);
  }, [activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadPatients(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, activeTab, lastVisible]);

  const loadPatients = async (reset: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (reset) {
        setLoading(true);
        setPatients([]);
        setLastVisible(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const tokenResult = await user.getIdTokenResult();
      const eid = tokenResult.claims.eid as string;

      let q = query(
        collection(db, "patients"),
        where("establishmentId", "==", eid),
        where("status", "==", activeTab),
        orderBy("createdAt", "desc"),
        limit(PATIENTS_PER_PAGE)
      );

      if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);

      const newPatients: Patient[] = [];
      querySnapshot.forEach((doc) => {
        newPatients.push({ id: doc.id, ...doc.data() } as Patient);
      });

      if (reset) {
        setPatients(newPatients);
      } else {
        setPatients((prev) => [...prev, ...newPatients]);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PATIENTS_PER_PAGE);

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Failed to load patients:", error);
      setError("利用者情報の読み込みに失敗しました");
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const user = auth.currentUser;
    if (!user) return;

    try {
      const tokenResult = await user.getIdTokenResult();
      const eid = tokenResult.claims.eid as string;

      const patientData = {
        name: formData.name,
        nameKana: formData.nameKana,
        dateOfBirth: Timestamp.fromDate(new Date(formData.dateOfBirth)),
        gender: formData.gender,
        phone: formData.phone || "",
        address: formData.address || "",
        notes: formData.notes || "",
        status: "active" as const,
        establishmentId: eid,
        updatedAt: Timestamp.now(),
      };

      if (editingPatient) {
        // 更新
        await updateDoc(doc(db, "patients", editingPatient.id), patientData);
        setSuccess("利用者情報を更新しました");
      } else {
        // 新規作成
        await addDoc(collection(db, "patients"), {
          ...patientData,
          createdAt: Timestamp.now(),
        });
        setSuccess("利用者を登録しました");
      }

      setShowModal(false);
      setEditingPatient(null);
      resetForm();
      await loadPatients(true);
    } catch (error: any) {
      console.error("Failed to save patient:", error);
      setError(error.message || "保存に失敗しました");
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      nameKana: patient.nameKana,
      dateOfBirth: patient.dateOfBirth.toDate().toISOString().split("T")[0],
      gender: patient.gender,
      phone: patient.phone || "",
      address: patient.address || "",
      notes: patient.notes || "",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (patient: Patient) => {
    const newStatus = patient.status === "active" ? "suspended" : "active";
    const message =
      newStatus === "suspended"
        ? "この利用者を一時中止しますか？\n（6ヶ月後に自動削除されます）"
        : "この利用者を利用中に戻しますか？";

    if (!confirm(message)) return;

    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      if (newStatus === "suspended") {
        updateData.suspendedAt = Timestamp.now();
      } else {
        updateData.suspendedAt = null;
      }

      await updateDoc(doc(db, "patients", patient.id), updateData);
      setSuccess(
        newStatus === "suspended"
          ? "利用者を一時中止しました"
          : "利用者を利用中に戻しました"
      );
      await loadPatients(true);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      setError("ステータス変更に失敗しました");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameKana: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      address: "",
      notes: "",
    });
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.nameKana.includes(searchQuery) ||
      (p.phone && p.phone.includes(searchQuery))
  );

  const calculateAge = (dateOfBirth: Timestamp) => {
    const today = new Date();
    const birthDate = dateOfBirth.toDate();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && patients.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">利用者管理</h1>
            <p className="text-sm text-gray-600 mt-1">
              利用者の登録・編集、一時中止などの管理ができます
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPatient(null);
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            新規登録
          </button>
        </div>

        {/* 通知 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">
            {success}
          </div>
        )}

        {/* タブと検索 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* タブ */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  activeTab === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                利用中
              </button>
              <button
                onClick={() => setActiveTab("suspended")}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  activeTab === "suspended"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                一時中止
              </button>
            </div>

            {/* 検索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900"
                placeholder="名前、フリガナ、電話番号で検索"
              />
            </div>
          </div>
        </div>

        {/* 利用者一覧 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery
                  ? "該当する利用者が見つかりません"
                  : activeTab === "active"
                  ? "利用中の利用者がいません"
                  : "一時中止中の利用者がいません"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      氏名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      生年月日 / 年齢
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      性別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      電話番号
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-xs text-gray-500">{patient.nameKana}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.dateOfBirth.toDate().toLocaleDateString("ja-JP")} (
                        {calculateAge(patient.dateOfBirth)}歳)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.gender === "male"
                          ? "男性"
                          : patient.gender === "female"
                          ? "女性"
                          : "その他"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                        >
                          <Edit2 size={14} />
                          編集
                        </button>
                        <button
                          onClick={() => handleToggleStatus(patient)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded transition ${
                            patient.status === "active"
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {patient.status === "active" ? (
                            <>
                              <EyeOff size={14} />
                              一時中止
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              利用再開
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Infinite scroll trigger */}
          {hasMore && filteredPatients.length > 0 && (
            <div ref={observerTarget} className="p-4 text-center">
              {loadingMore && (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              )}
            </div>
          )}
        </div>

        {/* 登録・編集モーダル */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingPatient ? "利用者情報編集" : "新規利用者登録"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 氏名 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      氏名 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      required
                    />
                  </div>

                  {/* フリガナ */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      フリガナ *
                    </label>
                    <input
                      type="text"
                      value={formData.nameKana}
                      onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      required
                    />
                  </div>

                  {/* 生年月日 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      生年月日 *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      required
                    />
                  </div>

                  {/* 性別 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      性別 *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as "male" | "female" | "other",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      required
                    >
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  {/* 電話番号 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      placeholder="090-1234-5678"
                    />
                  </div>

                  {/* 住所 */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      住所
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      placeholder="東京都渋谷区..."
                    />
                  </div>

                  {/* 備考 */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      備考
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      rows={3}
                      placeholder="特記事項など..."
                    />
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPatient(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    {editingPatient ? "更新" : "登録"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
