// app/order-detail/[id]/page.tsx

import Link from "next/link";
import Image from "next/image";

interface Order {
  don_hang_id: number;
  DC_GH: string;
  tong_tien: number;
  trang_thai?: string;
  HT_Thanh_toan_id: number;
  ngay_dat: string;
}

interface OrderItem {
  sach_id: number;
  ten_sach: string;
  So_luong: number;
  gia_ban: number;
  image?: string;
}

const FREE_SHIPPING_THRESHOLD = 500000;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: Order | null = null;
  let items: OrderItem[] = [];

  try {
    const res = await fetch(`http://localhost:3003/orders/${id}`, { cache: "no-store" });
    if (res.ok) order = await res.json();

    if (order) {
      const resDetail = await fetch(`http://localhost:3003/orders/${id}/details`, { cache: "no-store" });
      if (resDetail.ok) items = await resDetail.json();
    }
  } catch (error) {
    console.error("Lỗi fetch:", error);
  }

  const formatPrice = (price: number) => price?.toLocaleString("vi-VN") + " ₫" || "0 ₫";

  // Tính tổng tiền sản phẩm
  const productTotal = items.reduce((sum, item) => sum + item.gia_ban * item.So_luong, 0);

  // ƯU TIÊN LẤY PHÍ SHIP TỪ BACKEND (tong_tien - productTotal) → ĐÚNG VỚI KHÁCH CHỌN Ở CHECKOUT
  const shippingFeeFromDB = order ? order.tong_tien - productTotal : 0;

  // Chỉ fallback tính theo địa chỉ nếu phí ship từ DB <= 0 hoặc sai (miễn phí hoặc lỗi)
  const calculateShippingFeeFallback = () => {
    if (productTotal >= FREE_SHIPPING_THRESHOLD) return 0;
    const address = order?.DC_GH || "";
    const isInnerCity = /tp\.?hcm|thành phố hồ chí minh|hồ chí minh|sài gòn/i.test(address.toLowerCase());
    return isInnerCity ? 30000 : 50000;
  };

  const shippingFee = shippingFeeFromDB > 0 ? shippingFeeFromDB : calculateShippingFeeFallback();
  const correctTotal = productTotal + shippingFee;

  const statusColor =
    order?.trang_thai === "Hoàn thành" ? "success" :
    order?.trang_thai === "Đang giao" ? "info" :
    order?.trang_thai === "Đã hủy" ? "danger" :
    order?.trang_thai === "Đang xử lý" ? "primary" : "warning";

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <Link href="/orders" className="btn btn-outline-secondary rounded-pill mb-4 d-inline-flex align-items-center gap-2">
        ← Quay lại đơn hàng
      </Link>

      <div className="bg-white rounded shadow p-4 p-md-5">
        {order ? (
          <>
            {/* Tiêu đề + trạng thái */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <h2 className="fw-bold" style={{ color: "#e67e22" }}>
                Đơn hàng #{order.don_hang_id}
              </h2>
              <span className={`badge bg-${statusColor} fs-6 px-4 py-2`}>
                {order.trang_thai || "Chờ xác nhận"}
              </span>
            </div>

            {/* Thông tin cơ bản */}
            <div className="row mb-4">
              <div className="col-md-8">
                <p className="mb-2"><strong>Địa chỉ giao hàng:</strong> {order.DC_GH}</p>
                <p className="mb-2"><strong>Ngày đặt:</strong> {new Date(order.ngay_dat).toLocaleString("vi-VN")}</p>
                <p className="mb-0">
                  <strong>Thanh toán:</strong> {order.HT_Thanh_toan_id === 1 ? "COD" : "Chuyển khoản / VNPAY"}
                </p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <h3 className="text-danger fw-bold">{formatPrice(order.tong_tien)}</h3>
                <small className="text-muted">Tổng thanh toán (theo hệ thống)</small>
              </div>
            </div>

            <hr />

            {/* Danh sách sản phẩm */}
            <h5 className="fw-bold mb-3">Sản phẩm</h5>
            {items.length === 0 ? (
              <p className="text-muted text-center py-4">Chưa có sản phẩm</p>
            ) : (
              <div className="row g-4">
                {items.map((item) => (
                  <div key={item.sach_id} className="col-12">
                    <Link href={`/products/${item.sach_id}`} className="text-decoration-none">
                      <div
                        className="d-flex align-items-center bg-light rounded p-3"
                        style={{ cursor: "pointer", transition: "background-color 0.3s ease" }}
                      >
                        <Image
                          src={item.image || "/image/default-book.jpg"}
                          alt={item.ten_sach}
                          width={70}
                          height={90}
                          className="rounded me-3"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1 text-dark">{item.ten_sach}</h6>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">x{item.So_luong}</span>
                            <span className="text-danger fw-bold">{formatPrice(item.gia_ban * item.So_luong)}</span>
                          </div>
                        </div>
                        <svg className="text-muted ms-2 flex-shrink-0" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-4" />

            {/* Tóm tắt thanh toán - HIỂN THỊ ĐÚNG THEO CHECKOUT */}
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between mb-3">
                </div>
                <div className="d-flex justify-content-between fs-4 fw-bold pt-3 border-top border-2">
                  <span>Tổng thanh toán</span>
                  <span className="text-danger">{formatPrice(correctTotal)}</span>
                </div>

                {/* Note debug nếu tổng DB khác */}
                {order.tong_tien !== correctTotal && (
                  <div className="text-end mt-2">
                    <small className="text-muted">
                      (Hệ thống ghi nhận: {formatPrice(order.tong_tien)})
                    </small>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted fs-4">Không tìm thấy đơn hàng #{id}</p>
          </div>
        )}
      </div>
    </div>
  );
}