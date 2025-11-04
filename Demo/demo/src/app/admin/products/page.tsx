"use client";

import { useEffect, useState } from "react";

interface Sach {
  sach_id: number;
  Loai_sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number;
  loai_bia: string;
}

export default function AdminProduct() {
  const [sachs, setSachs] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Lấy dữ liệu sách từ backend
  useEffect(() => {
    fetch("http://localhost:3003/sach")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu sách");
        return res.json();
      })
      .then((data) => {
        console.log("📘 Dữ liệu từ API:", data);
        if (Array.isArray(data)) setSachs(data);
        else if (Array.isArray(data.sach)) setSachs(data.sach);
        else setSachs([]);
      })
      .catch((err) => {
        console.error("❌ Lỗi fetch:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 font-semibold py-6">
         Lỗi: {error}
      </p>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
             Quản lý sản phẩm (Sách)
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition">
            ➕ Thêm sách
          </button>
        </div>

        {sachs.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            Không có sản phẩm nào.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Tên sách</th>
                  <th className="px-4 py-3 font-semibold">Tác giả</th>
                  <th className="px-4 py-3 font-semibold">Nhà XB</th>
                  <th className="px-4 py-3 font-semibold">Giá (₫)</th>
                  <th className="px-4 py-3 font-semibold">Tồn kho</th>
                  <th className="px-4 py-3 font-semibold">Giảm giá (₫)</th>
                  <th className="px-4 py-3 font-semibold">Loại bìa</th>
                  <th className="px-4 py-3 font-semibold">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {sachs.map((sach, i) => (
                  <tr
                    key={sach.sach_id}
                    className={`text-gray-700 ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-2 border text-center font-semibold text-gray-800">
                      {sach.sach_id}
                    </td>
                    <td className="px-4 py-2 border font-medium">
                      {sach.ten_sach}
                    </td>
                    <td className="px-4 py-2 border">{sach.ten_tac_gia}</td>
                    <td className="px-4 py-2 border">{sach.ten_NXB}</td>
                    <td className="px-4 py-2 border text-right text-red-600 font-semibold">
                      {Number(sach.gia_sach).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {sach.ton_kho_sach}
                    </td>
                    <td className="px-4 py-2 border text-right text-gray-700">
                      {Number(sach.gg_sach).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {sach.loai_bia || "—"}
                    </td>
                    <td className="px-4 py-2 border text-gray-600 max-w-xs truncate">
                      {sach.mo_ta || "Không có mô tả"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
