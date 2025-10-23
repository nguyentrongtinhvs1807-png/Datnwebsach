"use client";

import React, { useEffect, useState } from "react";

interface Order {
  don_hang_id: number;
  nguoi_dung_id: number | null;
  giam_gia_id: number | null;
  HT_Thanh_toan_id: number;
  ngay_dat: string | null;
  ngay_TT: string | null;
  DC_GH: string;
  tong_tien?: number | null;
  trang_thai?: string | null;
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3003/orders");
        if (!res.ok) throw new Error("Không thể tải dữ liệu đơn hàng");
        const data = await res.json();

        // ✅ Đảm bảo dữ liệu là mảng
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 🟡 Cập nhật trạng thái đơn hàng
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3003/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: newStatus }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật trạng thái");

      setOrders((prev) =>
        prev.map((o) =>
          o.don_hang_id === id ? { ...o, trang_thai: newStatus } : o
        )
      );
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  // 🧹 Xử lý trạng thái loading / lỗi / rỗng
  if (loading) return <p className="text-center mt-5">⏳ Đang tải đơn hàng...</p>;
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">📦 Quản lý đơn hàng</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Địa chỉ giao hàng</th>
              <th>Ngày đặt</th>
              <th>Ngày thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.don_hang_id}>
                  <td>{o.don_hang_id}</td>
                  <td>{o.nguoi_dung_id ?? "Khách lẻ"}</td>
                  <td>{o.DC_GH || "—"}</td>
                  <td>
                    {o.ngay_dat
                      ? new Date(o.ngay_dat).toLocaleString("vi-VN")
                      : "Chưa có"}
                  </td>
                  <td>
                    {o.ngay_TT
                      ? new Date(o.ngay_TT).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    {o.tong_tien && !isNaN(o.tong_tien)
                      ? o.tong_tien.toLocaleString("vi-VN") + " ₫"
                      : "—"}
                  </td>
                  <td>
                    <select
                      value={o.trang_thai || "Chờ xác nhận"}
                      onChange={(e) =>
                        updateStatus(o.don_hang_id, e.target.value)
                      }
                      className="form-select form-select-sm"
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-muted text-center py-3">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
