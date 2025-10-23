"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Voucher = {
  giam_gia_id: number;
  ma_gg: string;
  loai_giam: "fixed" | "percent";
  gia_tri_giam: number;
  giam_toi_da: number;
  don_toi_thieu: number;
  ngay_bd: string;
  ngay_kt: string;
  gioi_han_sd: number;
  trang_thai: number;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [voucher, setVoucher] = useState("");
  const [voucherInfo, setVoucherInfo] = useState<Voucher | null>(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod",
    email: "",
  });

  const router = useRouter();

  // 🛒 Lấy giỏ hàng từ localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    const total = storedCart.reduce(
      (sum: number, item: Product) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCustomer((prev) => ({
        ...prev,
        name: user.ten || user.name || "",
        email: user.email || "",
      }));
    }
  }, []);

  // 🎟️ Kiểm tra voucher từ backend Node.js
  const handleCheckVoucher = async () => {
    if (!voucher.trim()) {
      setAlertMsg("⚠️ Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3003/voucher?code=${voucher}`);
      const data = await res.json();

      if (data.error) {
        setAlertMsg("❌ " + data.error);
        setDiscount(0);
        setVoucherInfo(null);
        return;
      }

      const v: Voucher = data;
      const now = new Date();

      if (now < new Date(v.ngay_bd) || now > new Date(v.ngay_kt)) {
        setAlertMsg("❌ Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!");
        setDiscount(0);
        return;
      }

      if (totalPrice < v.don_toi_thieu) {
        setAlertMsg(`❌ Đơn hàng phải từ ${v.don_toi_thieu.toLocaleString()}đ mới được dùng!`);
        setDiscount(0);
        return;
      }

      // ✅ Tính số tiền giảm
      let discountValue = 0;
      if (v.loai_giam === "percent") {
        discountValue = (totalPrice * v.gia_tri_giam) / 100;
        if (discountValue > v.giam_toi_da) discountValue = v.giam_toi_da;
      } else if (v.loai_giam === "fixed") {
        discountValue = v.gia_tri_giam;
      }

      setDiscount(discountValue);
      setVoucherInfo(v);
      setAlertMsg(`✅ Áp dụng mã ${v.ma_gg} thành công! Giảm ${discountValue.toLocaleString()}đ`);
    } catch (err) {
      console.error("Lỗi:", err);
      setAlertMsg("⚠️ Không thể kiểm tra mã giảm giá, vui lòng thử lại!");
    }
  };

  // ✅ Xử lý đặt hàng
  const handleCheckout = async () => {
    if (cart.length === 0) return window.alert("🛒 Giỏ hàng trống!");
    if (!customer.name || !customer.phone || !customer.address || !customer.email)
      return window.alert("⚠️ Vui lòng nhập đầy đủ thông tin giao hàng!");

    const finalPrice = totalPrice - discount;
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const order = {
      ho_ten: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      payment: customer.payment,
      products: cart,
      totalPrice: finalPrice,
      discount,
      voucher: voucherInfo?.ma_gg || null,
      nguoi_dung_id: user?.id || null,
    };

    try {
      const res = await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo đơn hàng");

      localStorage.removeItem("cart");
      alert("🎉 Đặt hàng thành công!");
      router.push("/orders");
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      alert("❌ Có lỗi xảy ra khi đặt hàng!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // JSX giao diện
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">🛍️ Thanh Toán</h1>
        <p className="text-muted">Kiểm tra thông tin trước khi xác nhận thanh toán</p>
      </div>

      {alertMsg && (
        <div
          className={`alert ${
            alertMsg.startsWith("✅") ? "alert-success" : "alert-danger"
          } text-center`}
          role="alert"
        >
          {alertMsg}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5">🛒 Giỏ hàng trống</p>
          <a href="/products" className="btn btn-outline-primary mt-3">
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="row g-4">
          {/* 🧾 Thông tin giao hàng */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold text-primary mb-3">📦 Thông tin giao hàng</h4>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Họ và tên"
                className="form-control mb-3"
              />
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                placeholder="Email"
                className="form-control mb-3"
              />
              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className="form-control mb-3"
              />
              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Địa chỉ giao hàng"
                className="form-control mb-3"
              />

              <label className="fw-semibold mb-2">Hình thức thanh toán:</label>
              <select
                name="payment"
                value={customer.payment}
                onChange={handleChange}
                className="form-select"
              >
                <option value="cod">💵 Thanh toán khi nhận hàng</option>
                <option value="bank">🏦 Chuyển khoản</option>
                <option value="e-wallet">💳 Ví điện tử</option>
              </select>
            </div>
          </div>

          {/* 💰 Thông tin đơn hàng */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold text-primary mb-3">🧾 Đơn hàng của bạn</h4>

              <ul className="list-group mb-3">
                {cart.map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom"
                  >
                    <div>
                      <img
                        src={p.image}
                        alt={p.name}
                        width={45}
                        height={60}
                        style={{ objectFit: "cover" }}
                        className="me-2 rounded"
                      />
                      {p.name} × {p.quantity}
                    </div>
                    <span className="fw-semibold">
                      {(p.price * p.quantity).toLocaleString()}đ
                    </span>
                  </li>
                ))}
              </ul>

              {/* 🎟️ Nhập voucher */}
              <div className="input-group mb-3">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  className="form-control"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                />
                <button className="btn btn-outline-primary" onClick={handleCheckVoucher}>
                  Áp dụng
                </button>
              </div>

              <div className="border-top pt-3">
                <p>
                  <strong>Tạm tính:</strong> {totalPrice.toLocaleString()}đ
                </p>
                {discount > 0 && (
                  <p className="text-success">
                    <strong>Giảm giá:</strong> -{discount.toLocaleString()}đ
                  </p>
                )}
                <h5 className="text-primary mt-2">
                  <strong>Tổng thanh toán: {(totalPrice - discount).toLocaleString()}đ</strong>
                </h5>
              </div>

              <button
                className="btn btn-success w-100 mt-4 py-2 fw-bold fs-5"
                onClick={handleCheckout}
              >
                ✅ Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
