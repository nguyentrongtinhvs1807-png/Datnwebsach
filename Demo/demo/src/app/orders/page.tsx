"use client";

import { useEffect, useState } from "react";

interface DonHang {
  don_hang_id: number;
  nguoi_dung_id: number;
  giam_gia_id?: number | null;
  HT_Thanh_toan_id?: number | null;
  ngay_dat?: string | null;
  ngay_TT?: string | null;
  DC_GH?: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3003/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu đơn hàng");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        else if (Array.isArray(data.don_hang)) setOrders(data.don_hang);
        else setOrders([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-center text-muted py-5">⏳ Đang tải đơn hàng...</p>;
  if (error)
    return <p className="text-center text-danger py-5">⚠️ Lỗi: {error}</p>;

  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold text-primary mb-4">Đơn Hàng của Bạn</h2>

      {orders.length === 0 ? (
        <p className="text-center text-muted">Không có đơn hàng nào.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Mã đơn hàng</th>
                <th>Mã người dùng</th>
                <th>Mã giảm giá</th>
                <th>Hình thức thanh toán</th>
                <th>Ngày đặt</th>
                <th>Ngày thanh toán</th>
                <th>Địa chỉ giao hàng</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.don_hang_id || index}>
                  <td>{index + 1}</td>
                  <td className="fw-semibold text-primary">{order.don_hang_id}</td>
                  <td>{order.nguoi_dung_id}</td>
                  <td>{order.giam_gia_id || "—"}</td>
                  <td>{order.HT_Thanh_toan_id || "—"}</td>
                  <td>
                    {order.ngay_dat
                      ? new Date(order.ngay_dat).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>
                    {order.ngay_TT
                      ? new Date(order.ngay_TT).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td>{order.DC_GH || "Chưa có địa chỉ"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
