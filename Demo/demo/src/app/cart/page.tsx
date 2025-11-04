"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 👉 Thêm icon đẹp hơn
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";

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
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const validCart = storedCart.filter(
        (item: Product) =>
          item &&
          typeof item.price === "number" &&
          !isNaN(item.price) &&
          item.quantity > 0
      );

      setCart(validCart);
      localStorage.setItem("cart", JSON.stringify(validCart));
      setSelectedIds(validCart.map((item: Product) => item.id)); // mặc định tick hết

      const totalQty = validCart.reduce(
        (sum: number, item: Product) => sum + item.quantity,
        0
      );
      setTotalQuantity(totalQty);
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
    }
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    const totalQty = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalQty);
  };

  const removeFromCart = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"))
      return;
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setSelectedIds((arr) => arr.filter((sid) => sid !== id));
    const totalQty = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalQty);
  };

  const selectedProducts = cart.filter((item) => selectedIds.includes(item.id));
  const selectedTotalPrice = selectedProducts.reduce(
    (sum, item) =>
      sum + (typeof item.price === "number" ? item.price * item.quantity : 0),
    0
  );

  const handleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => item.id));
    }
  };

  if (!mounted) {
    return <p className="text-center mt-4">Đang tải giỏ hàng...</p>;
  }

  return (
    <div className="container mt-5 py-4" style={{ maxWidth: "900px" }}>
      <div className="rounded-4 bg-white p-4 shadow-sm">
        <h2 className="fw-bold mb-4 text-primary d-flex align-items-center">
          <span style={{ fontSize: "2rem" }}>🛒</span>
          <span className="ms-2">Giỏ hàng</span>
          <span className="badge bg-secondary ms-2">{totalQuantity}</span>
        </h2>

        {cart.length === 0 ? (
          <div className="d-flex flex-column align-items-center p-5">
            <img
              src="https://cdn-icons-png.flaticon.com/256/2038/2038854.png"
              alt="empty cart"
              style={{ width: 90, opacity: 0.5 }}
            />
            <p className="mt-4 lead text-secondary text-center">
              Giỏ hàng trống!{" "}
              <Link href="/products" className="text-primary fw-bold">
                Tiếp tục mua sắm →
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive rounded-3 shadow-sm">
              <table className="table table-bordered align-middle text-center mb-0">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: 60 }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length === cart.length && cart.length > 0}
                        onChange={handleSelectAll}
                        aria-label="Chọn tất cả"
                        style={{ width: 18, height: 18 }}
                      />
                    </th>
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
                    <tr
                      key={product.id}
                      className={
                        selectedIds.includes(product.id)
                          ? "table-info"
                          : "bg-light-subtle"
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          aria-label="Chọn sản phẩm"
                          style={{ width: 18, height: 18 }}
                        />
                      </td>
                      <td>
                        <img
                          src={product.image}
                          alt={product.name}
                          width={60}
                          height={60}
                          style={{
                            objectFit: "cover",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px #eeeeee",
                          }}
                        />
                      </td>
                      <td>
                        <span className="fw-medium">{product.name}</span>
                      </td>
                      <td className="text-danger fw-bold">
                        {typeof product.price === "number"
                          ? product.price.toLocaleString() + "đ"
                          : "0đ"}
                      </td>
                      {/* Sửa số lượng: bọc nhóm nút và số vào 1 div để đổ màu nền "tô hết", căn giữa tốt hơn */}
                      <td>
                        <div
                          className="quantity-box d-inline-flex align-items-center"
                          style={{
                            background:
                              "linear-gradient(90deg,#e3f9ef 10%,#e0f7fa 100%)",
                            borderRadius: "30px",
                            minWidth: 114,
                            padding: "4px 10px",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                            style={{ minWidth: 32 }}
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <FaMinus />
                          </button>
                          <span className="fw-medium ms-2 me-2">{product.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                            style={{ minWidth: 32 }}
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                      <td className="text-danger fw-bold">
                        {typeof product.price === "number"
                          ? (product.price * product.quantity).toLocaleString() + "đ"
                          : "0đ"}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm px-2"
                          onClick={() => removeFromCart(product.id)}
                          title="Xóa sản phẩm"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row mt-4 align-items-center">
              <div className="col-lg-6 mb-3 mb-lg-0 text-start">
                <p className="text-secondary mb-1">
                  <span>Đã chọn&nbsp;</span>
                  <b className="text-primary">{selectedProducts.length}</b>
                  <span>&nbsp;sản phẩm</span>
                </p>
              </div>
              <div className="col-lg-6 text-end">
                <h4 className="mb-1">
                  Tổng tiền đã chọn:{" "}
                  <span className="text-danger fw-bold" style={{ fontSize: "1.5rem" }}>
                    {selectedTotalPrice.toLocaleString()}đ
                  </span>
                </h4>
                <Link
                  href={{
                    pathname: "/checkout",
                    query: {
                      ids: selectedIds.join(","),
                    },
                  }}
                  passHref
                  legacyBehavior
                >
                  <button
                    className="btn btn-success btn-lg mt-3 px-5 py-2 fw-bold rounded-pill shadow"
                    disabled={selectedIds.length === 0}
                    style={{
                      background:
                        "linear-gradient(90deg, #00b894 0%, #00cec9 100%)",
                      border: "none",
                      fontSize: "1.08rem",
                    }}
                  >
                    Thanh toán sản phẩm đã chọn
                  </button>
                </Link>
                <Link href="/products" className="d-inline-block ms-3">
                  <button className="btn btn-outline-primary btn-lg mt-3 px-4 py-2 rounded-pill">
                    ← Tiếp tục mua sắm
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx global>{`
        body {
          background: linear-gradient(90deg, #e0eafc, #cfdef3 70%);
        }
        .table th,
        .table td {
          vertical-align: middle !important;
        }
        .table input[type="checkbox"]:focus {
          outline: 1.5px solid #00b894;
        }
        .quantity-box {
          box-shadow: 0 1px 8px #d0f8e0;
        }
      `}</style>
    </div>
  );
}
