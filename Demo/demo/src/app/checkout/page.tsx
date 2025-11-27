"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PaymentQr from "@/components/PaymentQr";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Discount = {
  code: string;
  value: number;
  type: "percent" | "fixed";
  maxDiscount?: number;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  if (!searchParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Đang tải...</div>
      </div>
    );
  }

  const refreshKey = searchParams.get("t");

  const [cart, setCart] = useState<Product[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod" as "cod" | "bank" | "vnpay",
    email: "",
    note: "",
  });
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    console.log("CHECKOUT – TẢI LẠI DỮ LIỆU!", new Date().toLocaleTimeString());

    // Load user info
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        setCustomer((prev) => ({
          ...prev,
          name: user.ho_ten || user.name || "",
          email: user.email || "",
          phone: user.phone || user.sdt || "",
          address: user.address || "",
        }));
      } catch (e) {
        console.error("Parse user lỗi:", e);
      }
    }

    // Load checkout items
    const itemsJson = localStorage.getItem("checkoutItems");
    if (itemsJson && itemsJson !== "null" && itemsJson !== "undefined") {
      try {
        const items = JSON.parse(itemsJson);
        if (Array.isArray(items) && items.length > 0) {
          const normalized = items.map((p: any) => ({
            id: String(p.id || p.sach_id || Date.now()),
            name: p.name || p.ten_sach || "Sản phẩm",
            price: Number(p.price || p.gia_ban || (p.gia_sach - (p.gg_sach || 0)) || 0),
            image: p.image || p.hinh_anh || "/image/default-book.jpg",
            quantity: Number(p.quantity || 1),
          }));
          setCart(normalized);
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Lỗi parse checkoutItems:", e);
        localStorage.removeItem("checkoutItems");
        setCart([]);
      }
    } else {
      setCart([]);
    }

    // Load discount
    const saved = localStorage.getItem("appliedDiscount");
    if (saved && saved !== "null") {
      try {
        setAppliedDiscount(JSON.parse(saved));
      } catch {
        localStorage.removeItem("appliedDiscount");
      }
    }
  }, [refreshKey]);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    let amount =
      appliedDiscount.type === "percent"
        ? Math.floor(totalPrice * appliedDiscount.value / 100)
        : appliedDiscount.value;
    if (appliedDiscount.maxDiscount) amount = Math.min(amount, appliedDiscount.maxDiscount);
    return Math.min(amount, totalPrice);
  }, [totalPrice, appliedDiscount]);

  const finalPrice = totalPrice - discountAmount;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    if (!customer.name || !customer.phone || !customer.address || !customer.email) {
      return alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    setIsCheckingOut(true);

    try {
      // ==================== THANH TOÁN VNPAY ====================
      if (customer.payment === "vnpay") {
        // BƯỚC 1: TẠO ĐƠN HÀNG PENDING TRƯỚC
        const orderResponse = await fetch("http://localhost:3003/api/don-hang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              email: customer.email,
              note: customer.note,
            },
            items: cart,
            total: finalPrice,
            paymentMethod: "vnpay",
          }),
        });

        const orderResult = await orderResponse.json();

        if (!orderResult.success) {
          alert("Lỗi tạo đơn hàng: " + (orderResult.message || "Vui lòng thử lại"));
          setIsCheckingOut(false);
          return;
        }

        const orderCode = orderResult.orderCode; // PIBOOK-123456789

        // BƯỚC 2: TẠO URL VNPAY VỚI ORDERCODE
        const vnpayResponse = await fetch("http://localhost:3003/api/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalPrice,
            orderId: orderCode,
            orderInfo: `Thanh toan don hang ${orderCode} PIBOOK`,
          }),
        });

        const vnpayResult = await vnpayResponse.json();

        if (vnpayResult.vnpUrl) {
          // Chuyển hướng sang VNPay
          window.location.href = vnpayResult.vnpUrl;
          return;
        } else {
          alert("Lỗi tạo link thanh toán VNPay!");
        }

        setIsCheckingOut(false);
        return;
      }

      // ==================== COD & BANK (giữ nguyên như cũ) ====================
      const userId = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)?.id || null
        : null;

      const orderData = {
        ho_ten: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        note: customer.note,
        payment: customer.payment,
        products: cart,
        totalPrice: finalPrice,
        discount: appliedDiscount || undefined,
        userId,
      };

      const res = await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Lỗi server");

      // Xóa giỏ hàng + checkoutItems
      const boughtIds = cart.map((p) => p.id);
      const currentCart = localStorage.getItem("cart");
      if (currentCart) {
        try {
          const cartData = JSON.parse(currentCart);
          const newCart = cartData.filter(
            (item: any) => !boughtIds.includes(String(item.id || item.sach_id))
          );
          localStorage.setItem("cart", JSON.stringify(newCart));
        } catch {}
      }

      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("appliedDiscount");
      window.dispatchEvent(new Event("checkoutSuccess"));
      window.dispatchEvent(new Event("cart-update"));

      alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại PIBOOK");
      window.location.href = "/orders";
    } catch (err) {
      console.error("Lỗi checkout:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center">
          <h2 className="text-4xl font-bold text-red-600 mb-6">Đơn hàng trống!</h2>
          <a href="/products" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl transition">
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ background: "#f5f7fa" }}>
      <div className="container-fluid px-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            <div className="bg-white rounded-4 shadow-xl overflow-hidden">
              <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                <button onClick={() => window.history.back()} className="btn btn-outline-secondary rounded-pill px-4 fw-medium">
                  Quay lại
                </button>
                <h1 className="fw-bold m-0" style={{ fontSize: "1.8rem", background: "linear-gradient(90deg, #4369e3, #62bbff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Xác nhận & Thanh toán
                </h1>
              </div>

              <div className="p-4 p-md-5">
                <div className="row g-4 g-lg-6">
                  <div className="col-lg-7">
                    <div className="rounded-4 p-4 p-md-5 border border-secondary border-opacity-10">
                      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">Thông tin giao hàng</h4>

                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium">Họ và tên <span className="text-danger">*</span></label>
                          <input name="name" value={customer.name} onChange={handleChange} className="form-control form-control-lg rounded-3 shadow-sm" required placeholder="Nhập họ và tên" />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium">Email <span className="text-danger">*</span></label>
                          <input name="email" type="email" value={customer.email} onChange={handleChange} className="form-control form-control-lg rounded-3 shadow-sm" required placeholder="Nhập email" />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium">Số điện thoại <span className="text-danger">*</span></label>
                          <input name="phone" type="tel" value={customer.phone} onChange={handleChange} className="form-control form-control-lg rounded-3 shadow-sm" required placeholder="Nhập số điện thoại" />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium">Địa chỉ <span className="text-danger">*</span></label>
                          <input name="address" value={customer.address} onChange={handleChange} className="form-control form-control-lg rounded-3 shadow-sm" required placeholder="Số nhà, đường, tỉnh/thành phố" />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-medium">Ghi chú (Tùy chọn)</label>
                          <textarea name="note" value={customer.note} onChange={handleChange} className="form-control rounded-3 shadow-sm" rows={3} placeholder="Ví dụ: Giao ngoài giờ hành chính..." />
                        </div>

                        <div className="col-12 mt-4 pt-3 border-top">
                          <label className="form-label fw-bold text-primary fs-5">Phương thức thanh toán</label>
                          <select name="payment" value={customer.payment} onChange={handleChange} className="form-select form-select-lg rounded-3 shadow-sm">
                            <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                            <option value="bank">Chuyển khoản ngân hàng</option>
                            <option value="vnpay">Thanh toán VNPay (QR / Thẻ)</option>
                          </select>
                        </div>

                        {customer.payment === "bank" && (
                          <div className="col-12 mt-4 p-4 border border-info rounded-4" style={{ backgroundColor: "#f0f8ff" }}>
                            <h5 className="fw-bold text-info mb-3">Thông tin chuyển khoản</h5>
                            <PaymentQr amount={finalPrice} account="0857226757" beneficiary="PIBOOK COMPANY" bankName="Vietinbank" note={customer.name ? `PIBOOK - ${customer.name}` : "PIBOOK"} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="bg-white rounded-4 p-4 p-md-5 shadow-lg sticky-top border border-secondary border-opacity-10" style={{ top: "20px" }}>
                      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">Đơn hàng của bạn ({cart.length} sản phẩm)</h4>

                      <div className="overflow-y-auto mb-4 border-bottom" style={{ maxHeight: "400px" }}>
                        {cart.map((item) => (
                          <div key={item.id} className="d-flex gap-3 py-3 border-bottom border-dashed">
                            <div style={{ flexShrink: 0 }}>
                              <Image src={item.image} alt={item.name} width={80} height={90} className="rounded shadow-sm object-cover" onError={(e) => { e.currentTarget.src = "/image/default-book.jpg"; }} />
                            </div>
                            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                              <h6 className="fw-bold mb-1 text-truncate">{item.name}</h6>
                              <div className="text-muted small mb-1">Số lượng: x{item.quantity}</div>
                              <div className="text-danger fw-bold fs-6">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Tạm tính</span>
                          <strong className="text-dark">{totalPrice.toLocaleString("vi-VN")}đ</strong>
                        </div>
                        {appliedDiscount && (
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-success">Giảm giá ({appliedDiscount.code})</span>
                            <span className="text-success fw-bold">-{discountAmount.toLocaleString("vi-VN")}đ</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between mt-3 border-top pt-3 fw-bold fs-4">
                          <span className="text-primary">Tổng thanh toán</span>
                          <span className="text-danger">{finalPrice.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="btn w-100 mt-4 py-3 rounded-pill fw-bold text-white shadow-lg hover:shadow-2xl transition-all"
                        style={{ background: "linear-gradient(90deg, #4369e3, #62bbff)", fontSize: "1.1rem" }}
                      >
                        {isCheckingOut ? "Đang xử lý..." : customer.payment === "vnpay" ? "TIẾN HÀNH THANH TOÁN VNPAY" : "XÁC NHẬN ĐẶT HÀNG"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}