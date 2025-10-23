'use client';

import { useEffect, useState } from 'react';

interface Order {
  don_hang_id: number;
  nguoi_dung_id: number | null;
  giam_gia_id: number | null;
  HT_Thanh_toan_id: number;
  ngay_dat: string | null;
  ngay_TT: string | null;
  DC_GH: string;
  tong_tien: number | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3003/orders');
        if (!res.ok) throw new Error('Không thể tải đơn hàng');
        const data: Order[] = await res.json();
        console.log('📦 Dữ liệu đơn hàng:', data);
        setOrders(data);
      } catch (err) {
        console.error('❌ Lỗi tải đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">📦 Quản lý đơn hàng</h2>

      {loading ? (
        <p className="text-center">⏳ Đang tải dữ liệu...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">Không có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full border border-gray-200 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Người dùng</th>
                <th className="px-4 py-2 border">Địa chỉ giao hàng</th>
                <th className="px-4 py-2 border">Ngày đặt</th>
                <th className="px-4 py-2 border">Tổng tiền</th>
                <th className="px-4 py-2 border">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.don_hang_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{o.don_hang_id}</td>
                  <td className="px-4 py-2 border text-center">{o.nguoi_dung_id ?? 'Khách lẻ'}</td>
                  <td className="px-4 py-2 border">{o.DC_GH}</td>
                  <td className="px-4 py-2 border text-center">
                    {o.ngay_dat
                      ? new Date(o.ngay_dat).toLocaleString('vi-VN')
                      : '—'}
                  </td>
                  <td className="px-4 py-2 border text-right text-red-600 font-semibold">
                    {o.tong_tien ? o.tong_tien.toLocaleString('vi-VN') + ' ₫' : '—'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {o.HT_Thanh_toan_id === 1 ? 'COD' : 'Chuyển khoản'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
