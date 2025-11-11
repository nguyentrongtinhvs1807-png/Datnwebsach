"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

// ✅ danh sách mã giảm giá
const discountCodes: Record<
  string,
  { type: "percent" | "minus"; value: number }
> = {
  SALE10: { type: "percent", value: 10 },
  SALE20: { type: "percent", value: 20 },
  GIAM50K: { type: "minus", value: 50000 },
  FREESHIP: { type: "minus", value: 20000 },
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // ✅ discount states
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");

  useEffect(() => {
    setMounted(true);

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");

    const normalized = stored.map((item: any, index: number) => ({
      id: item.id?.toString() || item.sach_id?.toString() || `book_${index}`,
      name: item.name || item.ten_sach || "Sách chưa có tên",
      price: Number(item.price || item.gia_sach || 0),
      image: item.image || "/no-image.png",
      quantity: Number(item.quantity || 1),
    }));

    setCart(normalized);
    setSelectedIds([]);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) setSelectedIds([]);
    else setSelectedIds(cart.map((item) => item.id));
  };

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("vi-VN") + "đ";

  const selectedProducts = cart.filter((item) =>
    selectedIds.includes(item.id)
  );

  const totalSelected = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ APPLY DISCOUNT
  const applyDiscount = () => {
    setDiscountError("");
    setDiscountAmount(0);

    const code = discountCode.trim().toUpperCase();

    if (!code) {
      setDiscountError("Vui lòng nhập mã giảm giá!");
      return;
    }

    const discount = discountCodes[code];

    if (!discount) {
      setDiscountError("Mã giảm giá không hợp lệ!");
      return;
    }

    let amount = 0;

    if (discount.type === "percent") {
      amount = (totalSelected * discount.value) / 100;
    } else {
      amount = discount.value;
    }

    if (amount > totalSelected) amount = totalSelected;

    setDiscountAmount(amount);
  };

  const finalTotal = Math.max(totalSelected - discountAmount, 0);

  if (!mounted)
    return <p className="text-center mt-4">Đang tải giỏ hàng...</p>;

  return (
    <div
      className="container mt-5 py-4"
      style={{
        maxWidth: "1100px",
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 4px 14px #e4e7eb",
      }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link href="/">
          <button className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold">
            ← Tiếp tục mua hàng
          </button>
        </Link>
        <div className="flex-grow-1 text-center">
          <h2 className="fw-bold text-primary m-0">
            🛒 Giỏ hàng của bạn{" "}
            <span className="badge bg-secondary ms-2">{cart.length}</span>
          </h2>
        </div>
        <div style={{ width: 150 }}></div>
      </div>

      {/* MAIN CONTENT */}
      {cart.length === 0 ? (
        <div className="text-center p-5">
          <img
            src="https://cdn-icons-png.flaticon.com/256/2038/2038854.png"
            alt="empty"
            style={{ width: 90, opacity: 0.5 }}
          />
          <p className="mt-4 text-secondary">
            Giỏ hàng trống.{" "}
            <Link href="/home" className="fw-bold text-primary">
              Tiếp tục mua sắm →
            </Link>
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === cart.length &&
                          cart.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: selectedIds.includes(item.id)
                          ? "#e6f9ff"
                          : "transparent",
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td>
                        <img
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={80}
                          style={{
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </td>
                      <td className="text-start fw-semibold">{item.name}</td>
                      <td className="text-danger fw-bold">
                        {formatPrice(item.price)}
                      </td>
                      <td>
                        <div className="d-inline-flex align-items-center gap-2 bg-light rounded-pill px-3 py-1">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <FaMinus />
                          </button>
                          <span className="fw-bold">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                      <td className="text-danger fw-bold">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-4">
            <div
              className="p-4 rounded-4 shadow-sm border"
              style={{ background: "#f9fbff" }}
            >
              <h5 className="fw-bold mb-3 text-primary">Tóm tắt đơn hàng</h5>
              <hr />

              {/* ✅ MÃ GIẢM GIÁ */}
              <label className="fw-semibold">Mã giảm giá:</label>
              <div className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã giảm giá..."
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={applyDiscount}
                >
                  Áp dụng
                </button>
              </div>

              {discountError && (
                <p className="text-danger small">{discountError}</p>
              )}

              {discountAmount > 0 && (
                <p className="text-success small fw-bold">
                  ✅ Đã áp dụng: -{formatPrice(discountAmount)}
                </p>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span className="fw-semibold">{formatPrice(totalSelected)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Giảm giá:</span>
                <span className="fw-semibold text-success">
                  -{formatPrice(discountAmount)}
                </span>
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-primary">Tổng thanh toán:</h5>
                <h4 className="fw-bold text-danger">{formatPrice(finalTotal)}</h4>
              </div>

              <Link
                href={{
                  pathname: "/checkout",
                  query: { ids: selectedIds.join(",") },
                }}
              >
                <button
                  className="btn btn-success w-100 mt-4 rounded-pill py-2 fw-bold"
                  disabled={selectedIds.length === 0}
                >
                  Tiến hành thanh toán
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
