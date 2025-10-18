"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0); // 🔹 tổng số lượng sản phẩm

  // --- Lấy dữ liệu giỏ hàng từ localStorage ---
  useEffect(() => {
    setMounted(true);
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // ✅ Giữ lại sản phẩm hợp lệ
      const validCart = storedCart.filter(
        (item: Product) =>
          item &&
          typeof item.price === "number" &&
          !isNaN(item.price) &&
          item.quantity > 0
      );

      setCart(validCart);
      localStorage.setItem("cart", JSON.stringify(validCart));

      // 🔹 Tính tổng số lượng
      const totalQty = validCart.reduce(
        (sum: number, item: Product) => sum + item.quantity,
        0
      );
      setTotalQuantity(totalQty);
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
    }
  }, []);

  // --- Hàm cập nhật số lượng ---
  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // 🔹 Cập nhật tổng số lượng
    const totalQty = updatedCart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setTotalQuantity(totalQty);
  };

  // --- Hàm xóa sản phẩm ---
  const removeFromCart = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"))
      return;

    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // 🔹 Cập nhật tổng số lượng
    const totalQty = updatedCart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setTotalQuantity(totalQty);
  };

  // --- Tổng tiền ---
  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + (typeof item.price === "number" ? item.price * item.quantity : 0),
    0
  );

  if (!mounted) {
    return <p className="text-center mt-4">Đang tải giỏ hàng...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>
        🛒 Giỏ hàng{" "}
        <span className="badge bg-secondary ms-2">{totalQuantity}</span>
      </h2>

      {cart.length === 0 ? (
        <p>
          Giỏ hàng trống! <Link href="/products">Tiếp tục mua sắm →</Link>
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td className="text-danger">
                    {typeof product.price === "number"
                      ? product.price.toLocaleString() + "đ"
                      : "0đ"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateQuantity(product.id, -1)}
                    >
                      -
                    </button>
                    <span className="mx-2">{product.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      +
                    </button>
                  </td>
                  <td className="text-danger">
                    {typeof product.price === "number"
                      ? (product.price * product.quantity).toLocaleString() + "đ"
                      : "0đ"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFromCart(product.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end mt-3">
            <h4>
              Tổng tiền:{" "}
              <span className="text-danger fw-bold">
                {totalPrice.toLocaleString()}đ
              </span>
            </h4>
            <Link href="/checkout">
              <button className="btn btn-success mt-3 px-4 py-2 fw-bold">
                Thanh toán
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
