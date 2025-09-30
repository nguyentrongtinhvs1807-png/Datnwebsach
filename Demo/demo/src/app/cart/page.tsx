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

  useEffect(() => {
    setMounted(true); 
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // ✅ validate dữ liệu: chỉ giữ sản phẩm có price là số hợp lệ
      const validCart = storedCart.filter(
        (item: Product) =>
          item &&
          typeof item.price === "number" &&
          !isNaN(item.price) &&
          item.quantity > 0
      );

      setCart(validCart);
      localStorage.setItem("cart", JSON.stringify(validCart));
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
    }
  }, []);

  if (!mounted) {
    return <p className="text-center mt-4">Đang tải giỏ hàng...</p>;
  }

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + (typeof item.price === "number" ? item.price * item.quantity : 0),
    0
  );

  return (
    <div className="container mt-4">
      <h2>🛒 Giỏ hàng</h2>
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
                    <img src={product.image} alt={product.name} width={60} />
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
          <h4 className="text-end">
            Tổng tiền:{" "}
            <span className="text-danger">{totalPrice.toLocaleString()}đ</span>
          </h4>
          <Link href="/checkout">
            <button className="btn btn-success float-end mt-3">Thanh toán</button>
          </Link>
        </div>
      )}
    </div>
  );
}
