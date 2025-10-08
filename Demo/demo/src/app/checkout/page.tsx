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
  id: number;
  code: string;
  discount: number;
  min_order: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  description: string;
  active: boolean;
  type: string;
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
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // 🎟️ Kiểm tra voucher
  const handleCheckVoucher = async () => {
    if (!voucher.trim()) {
      setAlertMsg("⚠️ Vui lòng nhập mã voucher!");
      return;
    }

    try {
      const res = await fetch(`/api/voucher?code=${voucher}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setAlertMsg("❌ Mã voucher không hợp lệ!");
        return;
      }

      const v: Voucher = data[0];
      const now = new Date();
      const start = new Date(v.start_date);
      const end = new Date(v.end_date);

      if (!v.active || now < start || now > end) {
        setAlertMsg("❌ Voucher đã hết hạn hoặc chưa hoạt động!");
        return;
      }

      if (totalPrice < v.min_order) {
        setAlertMsg(`❌ Đơn hàng phải từ ${v.min_order.toLocaleString()}đ mới dùng được!`);
        return;
      }

      let discountValue = 0;
      if (v.type === "Giảm phần trăm") {
        discountValue = Math.min((totalPrice * v.discount) / 100, v.max_discount);
      } else if (v.type === "Giảm trực tiếp") {
        discountValue = v.discount;
      }

      setDiscount(discountValue);
      setVoucherInfo(v);
      setAlertMsg(`✅ Áp dụng thành công! Giảm ${discountValue.toLocaleString()}đ`);
    } catch (error) {
      console.error("Lỗi kiểm tra voucher:", error);
      setAlertMsg("⚠️ Lỗi khi kiểm tra voucher!");
    }
  };

  // ✅ Đặt hàng
  const handleCheckout = async () => {
    if (cart.length === 0) return window.alert("Giỏ hàng đang trống!");
    if (!customer.name || !customer.phone || !customer.address || !customer.email)
      return window.alert("Vui lòng nhập đầy đủ thông tin!");

    const finalPrice = totalPrice - discount;

    const order = {
      ho_ten: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      payment: customer.payment,
      products: cart,
      totalPrice: finalPrice,
      discount,
      voucher: voucherInfo?.code || null,
      status: "Chờ xác nhận",
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      localStorage.removeItem("cart");
      window.alert("🎉 Đặt hàng thành công!");
      router.push("/orders");
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      window.alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary fw-bold mb-4">
        🛍️ Xác Nhận Thanh Toán
      </h2>

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
        <p className="text-center fs-5">
          Giỏ hàng trống!{" "}
          <a href="/products" className="text-primary fw-semibold">
            Tiếp tục mua sắm →
          </a>
        </p>
      ) : (
        <div className="row g-4">
          {/* Cột thông tin giao hàng */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h4 className="text-primary mb-3">📦 Thông Tin Giao Hàng</h4>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Họ và tên"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Số điện thoại"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Địa chỉ nhận hàng"
                  name="address"
                  value={customer.address}
                  onChange={handleChange}
                />
                <select
                  className="form-select mb-3"
                  name="payment"
                  value={customer.payment}
                  onChange={handleChange}
                >
                  <option value="cod">💵 Thanh toán khi nhận hàng (COD)</option>
                  <option value="bank">🏦 Chuyển khoản ngân hàng</option>
                  <option value="e-wallet">💳 Ví điện tử</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cột đơn hàng */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h4 className="text-primary mb-3">🧾 Đơn Hàng Của Bạn</h4>
                <ul className="list-group mb-3">
                  {cart.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {p.name} × {p.quantity}
                      </span>
                      <span className="fw-semibold">
                        {(p.price * p.quantity).toLocaleString()}đ
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Nhập mã voucher */}
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã voucher..."
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-primary fw-semibold"
                    onClick={handleCheckVoucher}
                  >
                    Áp Dụng
                  </button>
                </div>

                <div className="border-top pt-3">
                  <p className="mb-1">
                    <strong>Tạm tính:</strong>{" "}
                    {totalPrice.toLocaleString()}đ
                  </p>
                  {discount > 0 && (
                    <p className="text-success mb-1">
                      <strong>Giảm giá:</strong> -{discount.toLocaleString()}đ
                    </p>
                  )}
                  <h5 className="text-primary mt-2">
                    <strong>
                      Tổng thanh toán: {(totalPrice - discount).toLocaleString()}đ
                    </strong>
                  </h5>
                </div>

                <button
                  className="btn btn-success w-100 mt-4 py-2 fw-bold"
                  onClick={handleCheckout}
                >
                  ✅ Xác Nhận Đặt Hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
