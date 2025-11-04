"use client";

import { useEffect, useState } from "react";

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
}

interface OrderItem {
  sach_id: number;
  ten_sach: string;
  So_luong: number;
  gia_ban: number;
  image: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "Đang giao": {
    label: "Đang giao",
    color: "#149ecc",
    bg: "#def5fc"
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    color: "#34b764",
    bg: "#e7faef"
  },
  "Đã hủy": {
    label: "Đã hủy",
    color: "#e62c4b",
    bg: "#ffe6e9"
  },
  "Chờ xác nhận": {
    label: "Chờ xác nhận",
    color: "#faad15",
    bg: "#fff7df"
  },
};

function getStatusProps(status?: string) {
  if (!status || !STATUS_MAP[status]) return STATUS_MAP["Chờ xác nhận"];
  return STATUS_MAP[status];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  // Định dạng giá kiểu Việt Nam
  const formatPrice = (price: number | string) => {
    const n = Number(price);
    if (isNaN(n)) return "—";
    return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
  };

  // Lấy danh sách đơn hàng của user
  useEffect(() => {
    const fetchOrders = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(storedUser);

      try {
        const res = await fetch("http://localhost:3003/orders");
        const data: Order[] = await res.json();

        // Lọc đơn hàng của user hiện tại
        const userOrders = data.filter((o) => o.nguoi_dung_id === user.id);
        setOrders(userOrders);

        // Lấy chi tiết từng đơn hàng
        for (const order of userOrders) {
          const resDetail = await fetch(
            `http://localhost:3003/orders/${order.don_hang_id}/details`
          );
          const details: OrderItem[] = await resDetail.json();

          // Gộp sách trùng nhau — chỉ lấy 1 ảnh duy nhất
          const uniqueBooks = Object.values(
            details.reduce((acc: Record<number, OrderItem>, item: OrderItem) => {
              if (!acc[item.sach_id]) acc[item.sach_id] = item;
              return acc;
            }, {})
          ) as OrderItem[];

          setOrderDetails((prev: Record<number, OrderItem[]>) => ({
            ...prev,
            [order.don_hang_id]: uniqueBooks,
          }));
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Tự làm mới trạng thái mỗi 15s
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Hiển thị khi đang tải / chưa có đơn
  if (loading)
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 380 }}>
        <img src="/image/animate-loading-book.svg" alt="Đang tải" style={{width:70, marginBottom:18, opacity:.7}} />
        <p className="text-center text-warning mt-1 fs-5 fw-bold">Đang tải đơn hàng...</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 340 }}>
        <img src="/image/no-orders.svg" alt="Không có đơn hàng" style={{width:120}} />
        <p className="text-center text-muted mt-3 fs-5">Bạn chưa có đơn hàng nào.</p>
      </div>
    );

  // Giao diện danh sách đơn hàng đẹp hơn
  return (
    <div className="container mt-4 mb-5">
      <h2
        className="text-center fw-bold mb-5"
        style={{
          color: "#f5b100",
          letterSpacing: ".04em",
          textShadow: "0 2px 13px #ffd36067"
        }}
      >
        ĐƠN HÀNG ĐÃ ĐẶT
      </h2>

      <div className="row g-4">
        {orders.map((order) => {
          const status = getStatusProps(order.trang_thai);
          return (
            <div key={order.don_hang_id} className="col-12">
              <div
                className="shadow order-card border-0"
                style={{
                  background: "linear-gradient(105deg,#fff8ed 70%,#ffeccf 100%)",
                  borderRadius: "1.7rem",
                  padding: "2.1rem 2rem 1.6rem 2rem",
                  position: "relative",
                  minHeight: 220,
                  boxShadow: "0 4px 34px #ffd36c17",
                  overflow: "hidden"
                }}
              >
                {/* Dải trạng thái nổi bật */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    padding: "0.55rem 1.2rem 0.55rem 1.3rem",
                    borderTopRightRadius: "1.7rem",
                    borderBottomLeftRadius: "2.4rem",
                    fontWeight: 580,
                    color: status.color,
                    background: status.bg,
                    fontSize: "1.095rem",
                    boxShadow: "0 2px 9px #fac95019"
                  }}
                  className="d-inline-block"
                >
                  {status.label}
                </div>

                <div className="d-flex flex-row align-items-start justify-content-between mb-3" style={{gap: 6}}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-warning" style={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "#523313",
                        background: "#ffe57f"
                      }}>
                        Đơn #{order.don_hang_id}
                      </span>
                      {order.ngay_dat && (
                        <span className="text-muted ms-2" style={{fontSize: ".98rem"}}>
                          {/* Loại bỏ icon lịch */}
                          {new Date(order.ngay_dat).toLocaleString("vi-VN")}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-secondary" style={{fontSize: "1.05rem"}}>
                      {/* Loại bỏ icon vị trí */}
                      <strong>{order.DC_GH}</strong>
                    </div>
                    <div className="mb-1 text-secondary" style={{fontSize: "1.01rem"}}>
                      {/* Loại bỏ icon ví */}
                      Hình thức:{" "}
                      <strong>
                        {order.HT_Thanh_toan_id === 1
                          ? "Thanh toán khi nhận (COD)"
                          : order.HT_Thanh_toan_id === 2
                          ? "Chuyển khoản"
                          : "Khác"}
                      </strong>
                    </div>
                  </div>
                  <div style={{minWidth: 180}} className="text-end mt-sm-0 mt-3">
                    <div className="text-danger fw-bolder fs-4" style={{letterSpacing: ".01em"}}>
                      {order.tong_tien ? formatPrice(order.tong_tien) : "Đang tính"}
                    </div>
                    <div className="text-secondary fw-medium mt-1" style={{fontSize: ".97rem"}}>
                      Tổng tiền
                    </div>
                  </div>
                </div>

                {/* Sách trong đơn */}
                <div className="pt-2 mt-0">
                  <div className="row gx-2 gy-3">
                    {orderDetails[order.don_hang_id]?.map((item, idx) => (
                      <div key={item.sach_id + "-" + idx} className="col-12 col-sm-6 col-md-4 mb-1">
                        <div
                          className="d-flex align-items-center rounded-4 shadow-sm px-2 py-2"
                          style={{
                            background: "#fff6e3",
                            minHeight: 70,
                            border: "1.5px solid #ffeabf",
                            gap:12
                          }}
                        >
                          <img
                            src={item.image || "/image/default-book.jpg"}
                            alt={item.ten_sach}
                            style={{
                              width: "58px",
                              height: "74px",
                              objectFit: "cover",
                              borderRadius: "0.6rem",
                              boxShadow: "0 2px 13px #ffd88b27"
                            }}
                          />
                          <div className="flex-grow-1 ms-2">
                            <div className="fw-semibold text-dark mb-1" style={{fontSize:"1.01rem"}}>
                              {item.ten_sach}
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="badge bg-light border border-warning text-warning fw-bold" style={{
                                fontSize: ".99rem",
                                minWidth: 32
                              }}>SL: {item.So_luong}</span>
                              <span className="text-danger ms-1" style={{fontWeight:600,fontSize:"1rem"}}>
                                {formatPrice(item.gia_ban)}
                              </span>
                              <span className="ms-1 text-secondary" style={{ fontSize: ".97rem" }}>
                                Tổng: <b>{formatPrice(item.gia_ban * item.So_luong)}</b>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS nhỏ cho đẹp, nổi bật card */}
      <style>{`
        .order-card {
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .order-card:hover {
          box-shadow: 0 12px 44px #ffdb5e41;
          transform: translateY(-6px) scale(1.011);
          border-color: #fed359 !important;
        }
      `}</style>
    </div>
  );
}
