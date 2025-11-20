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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "Đang giao": { label: "Đang giao", color: "#149ecc", bg: "#def5fc" },
  "Hoàn thành": { label: "Hoàn thành", color: "#34b764", bg: "#e7faef" },
  "Đã hủy": { label: "Đã hủy", color: "#e62c4b", bg: "#ffe6e9" },
  "Chờ xác nhận": { label: "Chờ xác nhận", color: "#faad15", bg: "#fff7df" },
};

function getStatusProps(status?: string) {
  if (!status || !STATUS_MAP[status]) return STATUS_MAP["Chờ xác nhận"];
  return STATUS_MAP[status];
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

  // LẤY ẢNH SÁCH
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
      const userId = Number(user.id || user.user_id);

      try {
        const res = await fetch("http://localhost:3003/orders");
        const data: Order[] = await res.json();

        const userOrders = data.filter(
          (o) => Number(o.nguoi_dung_id) === userId
        );

        setOrders(userOrders);

        // FETCH CHI TIẾT ĐƠN
        for (const order of userOrders) {
          const resDetail = await fetch(
            `http://localhost:3003/orders/${order.don_hang_id}/details`
          );

          let details: OrderItem[] = await resDetail.json();

          // GỘP SẢN PHẨM TRÙNG THEO sach_id
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

          // ĐẢM BẢO TỪNG SÁCH CÓ ẢNH
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
        console.error("❌ Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 380 }}>
        <img src="/image/animate-loading-book.svg" style={{ width: 70, opacity: 0.7 }} />
        <p className="text-warning fs-5 fw-bold mt-3">Đang tải đơn hàng...</p>
      </div>
    );

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center fw-bold mb-5" style={{ color: "#f5b100" }}>
        ĐƠN HÀNG ĐÃ ĐẶT
      </h2>

      <div className="row g-4">
        {orders.map((order) => {
          const status = getStatusProps(order.trang_thai);

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
                {/* STATUS */}
                <div
                  style={{
                    position: "absolute",
                    right: 14,
                    top: -12,
                    padding: "6px 14px",
                    borderBottomLeftRadius: "18px",
                    color: status.color,
                    background: status.bg,
                    fontWeight: 600,
                  }}
                >
                  {status.label}
                </div>

                {/* HEADER */}
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <span className="badge bg-warning fw-bold">Đơn #{order.don_hang_id}</span>
                    <div className="text-secondary mt-2 fw-semibold">{order.DC_GH}</div>
                    <div className="text-secondary mt-1">
                      Hình thức:
                      <strong>
                        {" "}
                        {order.HT_Thanh_toan_id === 1
                          ? "Thanh toán khi nhận (COD)"
                          : "Chuyển khoản"}
                      </strong>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-danger fw-bolder fs-4">
                      {formatPrice(order.tong_tien || 0)}
                    </div>
                    <div className="text-secondary fw-medium">Tổng tiền</div>
                  </div>
                </div>

                {/* DANH SÁCH SÁCH */}
                <div className="row gx-2 gy-3">
                  {orderDetails[order.don_hang_id]?.map((item, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-md-4">
                      <div
                        className="d-flex align-items-center rounded-4 shadow-sm px-2 py-2"
                        style={{
                          background: "#fff6e3",
                          minHeight: 76,
                          border: "1.5px solid #ffeabf",
                          gap: 12,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.ten_sach}
                          style={{
                            width: 60,
                            height: 78,
                            objectFit: "cover",
                            borderRadius: "0.6rem",
                          }}
                        />

                        <div>
                          <div className="fw-semibold text-dark">{item.ten_sach}</div>
                          <div className="d-flex gap-2">
                            <span className="badge bg-light border text-warning">SL: {item.So_luong}</span>
                            <span className="text-danger fw-semibold">
                              {formatPrice(item.gia_ban)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BUTTON */}
                {order.trang_thai === "Chờ xác nhận" && (
                  <div className="text-end mt-4">
                    <button
                      className="btn btn-outline-danger px-3 fw-semibold"
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
