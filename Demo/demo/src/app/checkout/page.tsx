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

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [voucher, setVoucher] = useState("");
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

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");
    if (!customer.name || !customer.phone || !customer.address || !customer.email)
      return alert("Vui lòng nhập đầy đủ thông tin!");

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
      alert("Đặt hàng thành công!");
      router.push("/orders");
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>🛒 Xác nhận thanh toán</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống! <a href="/products">Tiếp tục mua sắm →</a></p>
      ) : (
        <div className="row">
          {/* Form */}
          <div className="col-md-6">
            <h4>Thông Tin Giao Hàng</h4>
            <input type="text" className="form-control mb-2" placeholder="Họ và tên" name="name" value={customer.name} onChange={handleChange} />
            <input type="text" className="form-control mb-2" placeholder="Email" name="email" value={customer.email} onChange={handleChange} />
            <input type="text" className="form-control mb-2" placeholder="Số điện thoại" name="phone" value={customer.phone} onChange={handleChange} />
            <input type="text" className="form-control mb-2" placeholder="Địa chỉ" name="address" value={customer.address} onChange={handleChange} />
            <select className="form-select mb-3" name="payment" value={customer.payment} onChange={handleChange}>
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank">Chuyển khoản ngân hàng</option>
              <option value="e-wallet">Ví điện tử</option>
            </select>
          </div>

          {/* Tóm tắt */}
          <div className="col-md-6">
            <h4>Đơn Hàng Của Bạn</h4>
            <ul>
              {cart.map((p) => (
                <li key={p.id}>
                  {p.name} × {p.quantity} — {(p.price * p.quantity).toLocaleString()}đ
                </li>
              ))}
            </ul>
            <p>Tạm tính: {totalPrice.toLocaleString()}đ</p>
            {discount > 0 && <p>Giảm giá: -{discount.toLocaleString()}đ</p>}
            <h5>Tổng tiền: {(totalPrice - discount).toLocaleString()}đ</h5>
          </div>

          <button className="btn btn-success mt-3" onClick={handleCheckout}>
            ✅ Xác nhận đặt hàng
          </button>
        </div>
      )}
    </div>
  );
}
