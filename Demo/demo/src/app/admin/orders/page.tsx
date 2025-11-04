'use client';

import { useEffect, useState } from 'react';

// Định nghĩa kiểu cho đơn hàng
interface Order {
  don_hang_id: number;
  nguoi_dung_id: number | null;
  giam_gia_id: number | null;
  HT_Thanh_toan_id: number;
  ngay_dat: string | null;
  ngay_TT: string | null;
  DC_GH: string;
  tong_tien: number | null;
  trang_thai: string;
}

const statusColors: Record<string, string> = {
  'Hoàn thành': 'badge bg-success',
  'Đang giao': 'badge bg-info text-dark',
  'Đã hủy': 'badge bg-danger',
  'Chờ xác nhận': 'badge bg-warning text-dark'
};

const statusOptions = [
  'Chờ xác nhận',
  'Đang giao',
  'Hoàn thành',
  'Đã hủy'
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3003/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải đơn hàng');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('❌ Lỗi tải đơn hàng:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refresh]);

  // Cập nhật trạng thái
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3003/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trang_thai: newStatus.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      setRefresh(r => !r);
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái:', error);
      alert('Không thể cập nhật trạng thái đơn hàng!');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold mb-0" style={{ color: "#21409A" }}>
          <i className="bi bi-truck me-2"></i> Quản lý đơn hàng
        </h2>
        <span className="badge bg-primary fs-6 px-3">
          Tổng đơn: {orders.length || 0}
        </span>
      </div>
      <div className="card shadow border-0">
        <div className="card-body px-0 pt-0 pb-2">
          {loading ? (
            <div className="py-5 text-center">
              <div className="spinner-border text-primary mb-3"></div>
              <div>Đang tải dữ liệu đơn hàng...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-secondary py-5 fs-5">
              <i className="bi bi-cart-x display-4 mb-2 d-block"></i>
              Không có đơn hàng nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 60 }}>#</th>
                    <th style={{ minWidth: 110 }}>Khách hàng</th>
                    <th style={{ minWidth: 230 }}>Địa chỉ giao hàng</th>
                    <th style={{ minWidth: 125 }}>Ngày đặt</th>
                    <th style={{ minWidth: 110 }}>Tổng tiền</th>
                    <th style={{ minWidth: 120 }}>Thanh toán</th>
                    <th style={{ minWidth: 140 }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.don_hang_id}>
                      <td className="text-center fw-semibold">{o.don_hang_id}</td>
                      <td className="text-center">
                        <span className={`badge bg-secondary`}>
                          {o.nguoi_dung_id ?? "Khách lẻ"}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark">{o.DC_GH}</span>
                      </td>
                      <td className="text-center">
                        {o.ngay_dat
                          ? new Date(o.ngay_dat).toLocaleString('vi-VN')
                          : <span className="text-secondary">—</span>}
                      </td>
                      <td className="text-end fw-bold text-danger">
                        {o.tong_tien !== null && o.tong_tien !== undefined
                          ? (
                            <>
                              {Number(o.tong_tien).toLocaleString('vi-VN')} <span className="text-black-50 fs-6">₫</span>
                            </>
                          )
                          : <span className="text-secondary">—</span>
                        }
                      </td>
                      <td className="text-center">
                        {o.HT_Thanh_toan_id === 1
                          ? <span className="badge bg-warning text-dark">COD</span>
                          : o.HT_Thanh_toan_id === 2
                          ? <span className="badge bg-info text-dark">Chuyển khoản</span>
                          : <span className="badge bg-secondary">Khác</span>
                        }
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <select
                            value={o.trang_thai?.trim() || 'Chờ xác nhận'}
                            onChange={(e) =>
                              handleStatusChange(o.don_hang_id, e.target.value)
                            }
                            className="form-select form-select-sm"
                            style={{ width: 140 }}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <span className={statusColors[o.trang_thai?.trim() || 'Chờ xác nhận']}>
                            {o.trang_thai?.trim() || 'Chờ xác nhận'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
