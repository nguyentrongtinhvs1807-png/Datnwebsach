"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3003/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("❌ Lỗi khi lấy orders:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>📦 Danh sách đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} className="card p-3 mb-3">
            <h4>Đơn hàng #{idx + 1}</h4>
            <p>👤 Khách hàng: {order.ho_ten || "Không rõ"}</p>
            <p>📧 Email: {order.email || "Không có"}</p>
            <p>📞 SĐT: {order.phone || "Không có"}</p>
            <p>🏠 Địa chỉ: {order.address || "Không có"}</p>
            <p>💳 Thanh toán: {order.payment || "Không có"}</p>
            <p>⏰ Thời gian: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Chưa có"}</p>
            <p>💰 Tổng tiền: {order.totalPrice?.toLocaleString() || 0}đ</p>

            <h5>Sản phẩm:</h5>
            <ul>
              {order.products?.length > 0 ? (
                order.products.map((p: any, i: number) => (
                  <li key={i}>
                    {p.name} × {p.quantity} — {(p.price * p.quantity).toLocaleString()}đ
                  </li>
                ))
              ) : (
                <li>Không có sản phẩm</li>
              )}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
