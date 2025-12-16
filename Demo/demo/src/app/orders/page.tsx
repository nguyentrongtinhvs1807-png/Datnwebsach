"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  "Chờ xác nhận": { label: "Chờ xác nhận", color: "#faad15", bg: "#fffbe6" },
  "Đang xử lý": { label: "Đang xử lý", color: "#0d6efd", bg: "#e3f2fd" },
  "Đang giao": { label: "Đang giao", color: "#17a2b8", bg: "#d1ecf1" },
  "Hoàn thành": { label: "Hoàn thành", color: "#28a745", bg: "#d4edda" },
  "Đã hủy": { label: "Đã hủy", color: "#dc3545", bg: "#f8d7da" },
};

const ALL_STATUS = ["Tất cả", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];

function getStatusProps(status?: string) {
  if (!status) return STATUS_MAP["Chờ xác nhận"];
  return STATUS_MAP[status] || STATUS_MAP["Chờ xác nhận"];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

  const formatPrice = (price: number | string) => {
    const n = Number(price);
    if (isNaN(n)) return "0 ₫";
    return n.toLocaleString("vi-VN") + " ₫";
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

        const userName = (user.ten_nguoi_dung || user.ho_ten || user.name || "").toLowerCase();

        const userOrders = data.filter((o) => {
          if (o.nguoi_dung_id !== null) {
            return Number(o.nguoi_dung_id) === userId;
          }
          return o.DC_GH?.toLowerCase().includes(userName);
        });

        userOrders.sort((a, b) => (b.don_hang_id || 0) - (a.don_hang_id || 0));

        setOrders(userOrders);

        for (const order of userOrders) {
          const resDetail = await fetch(`http://localhost:3003/orders/${order.don_hang_id}/details`);
          if (!resDetail.ok) continue;

          let details: OrderItem[] = await resDetail.json();

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

  const filteredOrders = selectedStatus === "Tất cả"
    ? orders
    : orders.filter(order => order.trang_thai === selectedStatus);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <img src="/image/animate-loading-book.svg" alt="loading" className="w-20 opacity-70" />
        <p className="text-warning text-2xl font-bold mt-4">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <img src="/image/empty-order.png" alt="Chưa có đơn" className="w-40 opacity-60 mx-auto mb-8" />
        <p className="text-muted text-3xl">Bạn chưa có đơn hàng nào</p>
        <Link href="/" className="btn btn-primary mt-6 text-xl px-8 py-3">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-8">
      <h2 className="text-center fw-bold mb-6" style={{ color: "#f5b100", fontSize: "2.2rem" }}>
        ĐƠN HÀNG ĐÃ ĐẶT
      </h2>

      <div className="d-flex justify-content-center mb-5 overflow-x-auto pb-2">
        <div className="d-flex gap-2">
          {ALL_STATUS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-5 py-2 fw-bold rounded-pill transition-all text-sm ${
                selectedStatus === status
                  ? "bg-warning text-dark shadow"
                  : "bg-light text-muted border hover:bg-gray-100"
              }`}
              style={{ minWidth: "120px" }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-xl">Không có đơn hàng ở trạng thái này</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredOrders.map((order) => {
            const status = getStatusProps(order.trang_thai);
            const canCancel = !["Đang giao", "Hoàn thành", "Đã hủy"].includes(order.trang_thai || "");
            const isCancelled = order.trang_thai === "Đã hủy";

            const items = orderDetails[order.don_hang_id] || [];
            const totalItems = items.reduce((sum, item) => sum + item.So_luong, 0);

            return (
              <div key={order.don_hang_id} className="col-12">
                <div
                  className="card border-0 shadow rounded-3 overflow-hidden position-relative"
                  style={{
                    background: "linear-gradient(105deg, #fff8ed 70%, #ffeccf 100%)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => !isCancelled && (e.currentTarget.style.transform = "translateY(-6px)")}
                  onMouseLeave={(e) => !isCancelled && (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {/* Badge trạng thái */}
                  <div
                    className="position-absolute top-0 end-0 mt-3 me-3 px-4 py-1 rounded-pill fw-bold text-white shadow"
                    style={{ backgroundColor: status.color, fontSize: "0.85rem" }}
                  >
                    {status.label}
                  </div>

                  <div className="card-body p-4">
                    {/* Thông tin đơn */}
                    <div className="mb-3">
                      <h5 className="fw-bold text-warning mb-1">
                        Đơn #{order.don_hang_id}
                      </h5>
                      <p className="text-muted small mb-1">
                        Ngày đặt: <strong className="text-dark">
                          {order.ngay_dat 
                            ? new Date(order.ngay_dat).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </strong>
                      </p>
                      <p className="text-muted small mb-0">
                        Thanh toán: <strong className="text-primary">
                          {order.HT_Thanh_toan_id === 1 ? "COD" : "Chuyển khoản / VNPAY"}
                        </strong>
                      </p>
                    </div>

                    {/* Tổng thanh toán - gọn, nổi bật */}
                    <div className="text-center mb-4 py-3 bg-white/70 rounded-3">
                      <div className="fs-3 fw-black text-danger mb-1">
                        {formatPrice(order.tong_tien || 0)}
                      </div>
                      <p className="text-muted small mb-0">
                        Tổng thanh toán ({totalItems} sản phẩm)
                      </p>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="row g-3 mb-4">
                      {items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                          <div className="d-flex align-items-center bg-white rounded-3 shadow-sm p-2 h-100">
                            <img
                              src={item.image || "/image/default-book.jpg"}
                              alt={item.ten_sach}
                              className="rounded me-2 flex-shrink-0"
                              style={{ width: 45, height: 60, objectFit: "cover" }}
                            />
                            <div className="flex-grow-1">
                              <p className="fw-bold text-dark text-sm mb-1 line-clamp-2">{item.ten_sach}</p>
                              <p className="text-muted text-sm mb-0">x{item.So_luong}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className="col-6 col-md-3 d-flex align-items-center justify-content-center">
                          <p className="text-muted fw-bold text-sm">+ {items.length - 4} sản phẩm</p>
                        </div>
                      )}
                    </div>

                    {/* Nút hành động */}
                    <div className="d-flex justify-content-between align-items-center">
                      <Link
                        href={`/order-detail/${order.don_hang_id}`}
                        className="btn btn-outline-primary px-5 py-2 fw-bold rounded-pill text-sm"
                      >
                        Xem chi tiết
                      </Link>

                      {canCancel && (
                        <button
                          className="btn btn-danger px-5 py-2 fw-bold rounded-pill text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/cancel/${order.don_hang_id}`;
                          }}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}