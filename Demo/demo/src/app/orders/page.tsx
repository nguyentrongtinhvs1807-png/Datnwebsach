"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  don_hang_id: number;
  nguoi_dung_id: number | null;
  giam_gia_id: number | null;
  HT_Thanh_toan_id: number;
  ngay_dat: string | null;
  ngay_TT: string | null;
  DC_GH: string;
  tong_tien?: number | null;
  trang_thai?: string;
  ly_do_huy?: string | null;
}

interface OrderItem {
  sach_id: number;
  ten_sach: string;
  So_luong: number;
  gia_ban: number;
  image?: string;
}

// ĐỒNG BỘ HOÀN TOÀN VỚI TRANG ADMIN
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "Chờ xác nhận": { label: "Chờ xác nhận", color: "#faad15", bg: "#fff7df" },
  "Đang xử lý":   { label: "Đang xử lý",   color: "#0d6efd", bg: "#e7f0ff" },    
  "Đang giao":    { label: "Đang giao",    color: "#149ecc", bg: "#def5fc" },
  "Hoàn thành":   { label: "Hoàn thành",   color: "#34b764", bg: "#e7f9" },
  "Đã hủy":       { label: "Đã hủy",       color: "#e62c4b", bg: "#ffe6e9" },
};

function getStatusProps(status?: string) {
  if (!status) return STATUS_MAP["Chờ xác nhận"];
  return STATUS_MAP[status] || STATUS_MAP["Chờ xác nhận"];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const formatPrice = (price: number | string) => {
    const n = Number(price);
    if (isNaN(n)) return "—";
    return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
  };

  const fetchBookImage = async (bookId: number) => {
    try {
      const res = await fetch(`http://localhost:3003/sach/${bookId}`);
      const data = await res.json();
      return data.image || "/image/default-book.jpg";
    } catch {
      return "/image/default-book.jpg";
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return setLoading(false);

      const user = JSON.parse(storedUser);
      const userId = Number(user.id || user.user_id || user.nguoi_dung_id);

      try {
        const res = await fetch("http://localhost:3003/orders");
        if (!res.ok) throw new Error("Không tải được đơn hàng");
        const data: Order[] = await res.json();

        // Lọc đơn hàng của user hiện tại (có ID hoặc khớp tên trong địa chỉ)
        const userName = (user.ten_nguoi_dung || user.ho_ten || user.name || "").toLowerCase();

        const userOrders = data.filter((o) => {
          if (o.nguoi_dung_id !== null) {
            return Number(o.nguoi_dung_id) === userId;
          }
          return o.DC_GH?.toLowerCase().includes(userName);
        });

        setOrders(userOrders);

        // Lấy chi tiết từng đơn
        for (const order of userOrders) {
          const resDetail = await fetch(`http://localhost:3003/orders/${order.don_hang_id}/details`);
          if (!resDetail.ok) continue;

          let details: OrderItem[] = await resDetail.json();

          // Gộp sách trùng
          const merged = Object.values(
            details.reduce((acc: any, item) => {
              if (!acc[item.sach_id]) {
                acc[item.sach_id] = { ...item };
              } else {
                acc[item.sach_id].So_luong += item.So_luong;
              }
              return acc;
            }, {})
          );

          // Gắn ảnh sách
          const detailsWithImages = await Promise.all(
            merged.map(async (item: any) => ({
              ...item,
              image: item.image || (await fetchBookImage(item.sach_id)),
            }))
          );

          setOrderDetails((prev) => ({
            ...prev,
            [order.don_hang_id]: detailsWithImages,
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 380 }}>
        <img src="/image/animate-loading-book.svg" alt="loading" style={{ width: 70, opacity: 0.7 }} />
        <p className="text-warning fs-5 fw-bold mt-3">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-5">
        <img src="/image/empty-order.png" alt="Chưa có đơn" style={{ width: 180, opacity: 0.6 }} />
        <p className="text-muted mt-4 fs-4">Bạn chưa có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center fw-bold mb-5" style={{ color: "#f5b100" }}>
        ĐƠN HÀNG ĐÃ ĐẶT
      </h2>

      <div className="row g-4">
        {orders.map((order) => {
          const status = getStatusProps(order.trang_thai);

          // Cho phép hủy khi chỉ ở trạng thái: Chờ xác nhận hoặc Đang xử lý
          const canCancel = !["Đang giao", "Hoàn thành", "Đã hủy"].includes(order.trang_thai || "");

          return (
            <div key={order.don_hang_id} className="col-12">
              <div
                className="shadow border-0 position-relative"
                style={{
                  background: "linear-gradient(105deg,#fff8ed 70%,#ffeccf 100%)",
                  borderRadius: "1.7rem",
                  padding: "2rem",
                  minHeight: 220,
                }}
              >
                {/* Trạng thái nổi góc trên */}
                <div
                  style={{
                    position: "absolute",
                    right: 14,
                    top: -12,
                    padding: "8px 18px",
                    borderBottomLeftRadius: "20px",
                    borderBottomRightRadius: "20px",
                    color: status.color,
                    background: status.bg,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {status.label}
                </div>

                {/* Header đơn hàng */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <span className="badge bg-warning text-dark fw-bold fs-6">
                      Đơn #{order.don_hang_id}
                    </span>
                    <div className="text-secondary mt-2 fw-semibold">{order.DC_GH}</div>
                    <div className="text-secondary small mt-1">
                      Thanh toán:{" "}
                      <strong>
                        {order.HT_Thanh_toan_id === 1 ? "COD (Thanh toán khi nhận hàng)" : "Chuyển khoản"}
                      </strong>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-danger fw-bolder fs-3">
                      {formatPrice(order.tong_tien || 0)}
                    </div>
                    <div className="text-secondary small">Tổng thanh toán</div>
                  </div>
                </div>

                {/* Danh sách sách */}
                <div className="row gx-3 gy-3 mb-4">
                  {orderDetails[order.don_hang_id]?.map((item, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div
                        className="d-flex align-items-center rounded-4 shadow-sm p-3"
                        style={{
                          background: "#fff9f0",
                          border: "2px solid #ffebc4",
                          gap: 14,
                          minHeight: 90,
                        }}
                      >
                        <img
                          src={item.image || "/image/default-book.jpg"}
                          alt={item.ten_sach}
                          className="rounded"
                          style={{ width: 62, height: 80, objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-bold text-dark small lh-sm" style={{ fontSize: "0.95rem" }}>
                            {item.ten_sach}
                          </div>
                          <div className="d-flex gap-3 mt-2">
                            <span className="badge bg-light text-warning border">
                              x{item.So_luong}
                            </span>
                            <span className="text-danger fw-bold">
                              {formatPrice(item.gia_ban)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nút hủy đơn - chỉ hiện khi được phép */}
                {canCancel && (
                  <div className="text-end">
                    <button
                      className="btn btn-danger px-5 py-2 fw-bold rounded-pill shadow-lg"
                      onClick={() => router.push(`/cancel/${order.don_hang_id}`)}
                    >
                      Hủy đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}