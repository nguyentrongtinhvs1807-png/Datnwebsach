"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentQr from "@/components/PaymentQr";

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
  const [cart, setCart] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod",
    email: "",
  });
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const router = useRouter();

  // ✅ Ưu tiên lấy checkoutItem (sản phẩm Mua Ngay)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Vui lòng đăng nhập để tiếp tục mua hàng!");
      router.push("/auth/dangnhap");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user || (!user.id && !user.ten && !user.email)) {
        alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
        router.push("/auth/dangnhap");
        return;
      }

      setCustomer((prev) => ({
        ...prev,
        name: user.ten || user.name || "",
        email: user.email || "",
      }));

      // 🟢 Ưu tiên checkoutItem (sản phẩm “Mua Ngay”)
      const quickBuy = JSON.parse(localStorage.getItem("checkoutItem") || "null");
      if (quickBuy && Array.isArray(quickBuy) && quickBuy.length > 0) {
        setCart(quickBuy);
        const total = quickBuy.reduce(
          (sum: number, item: Product) => sum + item.price * item.quantity,
          0
        );
        setTotalPrice(total);
      } else {
        // 🛒 Nếu không có, fallback về giỏ hàng
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(storedCart);
        const total = storedCart.reduce(
          (sum: number, item: Product) => sum + item.price * item.quantity,
          0
        );
        setTotalPrice(total);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu checkout:", error);
      router.push("/auth/dangnhap");
    }
  }, [router]);

  // Tính tổng sau giảm giá
  const getFinalPrice = () => {
    if (!appliedDiscount) return totalPrice;
    let discountValue = 0;
    if (appliedDiscount.type === "percent") {
      discountValue = Math.floor((totalPrice * appliedDiscount.value) / 100);
      if (appliedDiscount.maxDiscount && discountValue > appliedDiscount.maxDiscount) {
        discountValue = appliedDiscount.maxDiscount;
      }
    } else {
      discountValue = appliedDiscount.value;
    }
    const price = totalPrice - discountValue;
    return price > 0 ? price : 0;
  };

  // Áp mã giảm giá
  const handleApplyDiscount = async () => {
    setDiscountError("");
    setIsApplying(true);
    try {
      if (!discountCode) {
        setDiscountError("Vui lòng nhập mã giảm giá!");
        setIsApplying(false);
        return;
      }

      const res = await fetch(
        `http://localhost:3003/discount-codes/${encodeURIComponent(
          discountCode.trim()
        )}`
      );
      if (!res.ok) {
        setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
        setIsApplying(false);
        return;
      }

      const data = await res.json();
      if (!data.code) {
        setDiscountError("Không tìm thấy mã hợp lệ!");
        setIsApplying(false);
        return;
      }

      setAppliedDiscount({
        code: data.code,
        value: Number(data.value),
        type: data.type === "percent" ? "percent" : "fixed",
        maxDiscount:
          data.type === "percent" ? Number(data.maxDiscount || 0) : undefined,
      });
    } catch (e) {
      setDiscountError("Có lỗi khi kiểm tra mã giảm giá.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    if (!customer.name || !customer.phone || !customer.address || !customer.email)
      return alert("Vui lòng nhập đầy đủ thông tin giao hàng!");

    const finalPrice = getFinalPrice();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const order = {
      ho_ten: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      payment: customer.payment,
      products: cart,
      totalPrice: finalPrice,
      userId: user?.id || null,
      discount: appliedDiscount
        ? {
            code: appliedDiscount.code,
            value: appliedDiscount.value,
            type: appliedDiscount.type,
          }
        : undefined,
    };

    try {
      const res = await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Lỗi khi tạo đơn hàng");

      // ✅ Xóa checkoutItem (hoặc giỏ hàng nếu có)
      localStorage.removeItem("checkoutItem");
      localStorage.removeItem("cart");

      alert("🎉 Đặt hàng thành công!");
      router.push("/orders");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="checkout-bg min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="checkout-wrapper rounded-4 shadow-lg p-4 p-md-5 bg-white w-100"
        style={{ maxWidth: 970 }}
      >
        <div className="mb-4">
          <button
            onClick={handleGoBack}
            className="btn btn-outline-secondary rounded-3 px-4 py-2 custom-back-btn"
          >
            Quay lại
          </button>
        </div>

        <div className="text-center mb-5">
          <h1 className="fw-bold text-gradient checkout-title mb-2">
            Xác nhận & Thanh toán
          </h1>
          <div className="checkout-divider mx-auto mb-3"></div>
          <p className="checkout-subtitle">
            Vui lòng kiểm tra và hoàn thiện các thông tin bên dưới để tiếp tục
            đặt hàng.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-5">Giỏ hàng của bạn hiện đang trống</p>
            <a
              href="/products"
              className="btn btn-primary px-5 py-2 rounded-3 fw-semibold mt-3"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <div className="row gy-4 gx-3">
            {/* Thông tin giao hàng */}
            <div className="col-lg-6">
              <div className="bg-light shadow-sm border-0 rounded-4 px-4 py-4 h-100">
                <h4 className="fw-semibold text-primary mb-4">
                  Thông tin giao hàng
                </h4>

                <div className="mb-3">
                  <label className="checkout-label">Họ và tên</label>
                  <input
                    name="name"
                    value={customer.name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="form-control checkout-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Email</label>
                  <input
                    name="email"
                    value={customer.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    className="form-control checkout-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Số điện thoại</label>
                  <input
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="form-control checkout-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Địa chỉ giao hàng</label>
                  <input
                    name="address"
                    value={customer.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    className="form-control checkout-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Phương thức thanh toán</label>
                  <select
                    name="payment"
                    value={customer.payment}
                    onChange={handleChange}
                    className="form-select checkout-input"
                  >
                    <option value="cod">Thanh toán khi nhận hàng</option>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="e-wallet">Ví điện tử</option>
                  </select>
                </div>

                {customer.payment === "bank" && (
                  <div
                    className="mt-4 p-3 border rounded"
                    style={{
                      background: "#fffbe8",
                      borderColor: "#ffe8b7",
                      borderRadius: "12px",
                    }}
                  >
                    <h5 className="fw-bold mb-3" style={{ color: "#d57200" }}>
                      Thông tin chuyển khoản
                    </h5>
                    <PaymentQr
                      amount={getFinalPrice()}
                      account="0857226757"
                      beneficiary="PIBOOK COMPANY"
                      bankName="Ngân hàng Vietinbank"
                      note={`Thanh toan PIBOOK - ${customer.name || "Khach hang"}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Đơn hàng */}
            <div className="col-lg-6">
              <div className="bg-light shadow-sm border-0 rounded-4 px-4 py-4 h-100">
                <h4 className="fw-semibold text-primary mb-4">
                  Đơn hàng của bạn
                </h4>

                <ul className="list-group mb-3">
                  {cart.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom bg-transparent px-0 py-2"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={p.image}
                          alt={p.name}
                          width={53}
                          height={68}
                          style={{
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                            marginRight: 14,
                          }}
                        />
                        <div>
                          <div className="fw-medium">{p.name}</div>
                          <div className="small text-muted">
                            Số lượng: {p.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="fw-bold text-primary">
                        {(p.price * p.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Tạm tính</span>
                    <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>

                  {appliedDiscount && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>
                        Giảm giá ({appliedDiscount.code})
                      </span>
                      <span>
                        -{" "}
                        {appliedDiscount.type === "percent"
                          ? `${Math.floor(
                              (totalPrice * appliedDiscount.value) / 100
                            ).toLocaleString("vi-VN")}đ`
                          : `${appliedDiscount.value.toLocaleString(
                              "vi-VN"
                            )}đ`}
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5">
                    <span>Tổng thanh toán</span>
                    <span>{getFinalPrice().toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <button
                  className="btn btn-success w-100 mt-4 py-3 fw-bold"
                  onClick={handleCheckout}
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .checkout-bg {
          background: linear-gradient(140deg,#f7faff 0%, #e8eefd 60%, #e4efff 100%);
        }
        .checkout-wrapper {
          min-width: 330px;
        }
        .checkout-title {
          letter-spacing: 0.5px;
          font-size: 2.1rem;
        }
        .checkout-divider {
          width: 54px;
          height: 5px;
          background: linear-gradient(90deg,#4369e3 0%,#62bbff 100%);
          border-radius: 8px;
        }
        .checkout-subtitle {
          color: #4c5b7a;
          font-size: 1.11rem;
        }
        .checkout-label {
          font-weight: 500;
          color: #21409a;
          margin-bottom: 5px;
          font-size: 1rem;
        }
        .checkout-input {
          border-radius: 8px !important;
          font-size: 16px;
        }
        .checkout-btn {
          background: linear-gradient(90deg, #62bbff 0%, #4369e3 100%);
          color: #fff;
          border: none;
        }
        .checkout-btn:hover {
          background: linear-gradient(80deg,#ffe066,#62bbff 80%);
          color: #203060 !important;
          box-shadow: 0 2px 12px 0 rgba(67,105,227,.1);
        }
        .custom-back-btn {
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          min-width: 110px;
        }
        .text-gradient {
          background: linear-gradient(90deg,#62bbff 0%,#4369e3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        /* Tooltip Hover Style for tạm tính */
        .info-tooltip-hover {
          position: relative;
          display: inline-block;
        }
        .info-tooltip-hover .custom-tooltip {
          display: none;
          position: absolute;
          top: 36px;
          left: 50%;
          transform: translateX(-50%);
          background: #e9f5ff;
          color: #204;
          border-radius: 8px;
          white-space: pre-line;
          padding: 9px 13px;
          font-size: 0.98rem;
          z-index: 99;
          min-width: 215px;
          box-shadow: 0 6px 24px 0 rgba(67,105,227,.14);
          font-weight: 450;
          border: 1px solid #bae3ff;
        }
        .info-tooltip-hover:focus .custom-tooltip,
        .info-tooltip-hover:hover .custom-tooltip {
          display: block;
        }
        .order-item-price {
          min-width: 116px;
          text-align: right;
          font-size: 1.11rem;
          letter-spacing: 0.3px;
        }
        .product-hover-detail {
          transition: background 0.18s;
          cursor: pointer;
        }
        .product-hover-detail:hover, .product-hover-detail:focus {
          background: #f4f8ff;
        }
        @media (max-width: 992px){
          .checkout-wrapper {
            padding: 17px !important;
            max-width: 100vw;
          }
          .bg-light {
            min-height: auto !important;
          }
        }
        @media (max-width: 575px){
          .checkout-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}
