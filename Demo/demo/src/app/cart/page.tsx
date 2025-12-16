"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  stock: number;
};

type Discount = {
  code: string;
  value: number;
  type: "percent" | "fixed";
  maxDiscount?: number;
  minOrderValue?: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const router = useRouter();

  const selectedProducts = cart.filter((item) => selectedIds.includes(item.id));
  const totalSelected = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("vi-VN") + " ₫";

  useEffect(() => {
    const loadCart = async () => {
      setMounted(true);
      let stored: any[] = [];
      try {
        const raw = localStorage.getItem("cart");
        stored = raw ? JSON.parse(raw) : [];
      } catch {
        stored = [];
      }
      const normalized: Product[] = [];
      for (const item of stored) {
        if (!item || (!item.id && !item.sach_id)) continue;
        let bookData: any = {};
        let realStock = Number(item.stock || item.ton_kho_sach) || 0;
        try {
          const res = await fetch(`http://localhost:3003/books/${item.id || item.sach_id}`);
          if (res.ok) {
            bookData = await res.json();
            realStock = Number(bookData.ton_kho_sach) || 0;
          }
        } catch (err) {
          console.warn("Lỗi lấy tồn kho sách ID:", item.id || item.sach_id);
        }
        const discountedPrice = bookData.gia_khuyen_mai || bookData.discounted_price;
        const finalPrice = discountedPrice || Number(item.price || item.gia_ban || item.gia_sach || 0);
        const originalPrice = discountedPrice ? Number(item.price || item.gia_ban || item.gia_sach) : undefined;
        normalized.push({
          id: String(item.id || item.sach_id),
          name: item.name || item.ten_sach || bookData.ten_sach || "Sản phẩm",
          price: finalPrice,
          originalPrice: originalPrice,
          image: item.image || bookData.hinh_anh || "/image/default-book.jpg",
          quantity: Math.max(1, Math.min(realStock || 999, Number(item.quantity) || 1)),
          stock: realStock,
        });
      }
      setCart(normalized);
      setSelectedIds(normalized.map((i) => i.id));
      const saved = localStorage.getItem("appliedDiscount");
      if (saved) {
        try {
          const discount: Discount = JSON.parse(saved);
          setAppliedDiscount(discount);
          setDiscountMessage(`Đã áp dụng mã ${discount.code}`);
        } catch {
          localStorage.removeItem("appliedDiscount");
        }
      }
    };
    loadCart();
  }, []);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.minOrderValue && totalSelected < appliedDiscount.minOrderValue) return 0;
    let amount = appliedDiscount.type === "percent"
      ? Math.floor(totalSelected * appliedDiscount.value / 100)
      : appliedDiscount.value;
    if (appliedDiscount.maxDiscount) amount = Math.min(amount, appliedDiscount.maxDiscount);
    return amount;
  }, [appliedDiscount, totalSelected]);

  const finalTotal = totalSelected - discountAmount;

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return setDiscountMessage("Vui lòng nhập mã giảm giá!");
    if (appliedDiscount) return setDiscountMessage("Bạn chỉ được dùng 1 mã giảm giá!");
    setIsApplying(true);
    try {
      const res = await fetch(`http://localhost:3003/discount-codes/${code}`);
      if (!res.ok) throw new Error((await res.json()).error || "Mã không hợp lệ");
      const voucher = await res.json();
      const discount: Discount = {
        code: voucher.code,
        value: voucher.value,
        type: voucher.type,
        maxDiscount: voucher.maxDiscount || undefined,
        minOrderValue: voucher.minOrder || undefined,
      };
      if (discount.minOrderValue && totalSelected < discount.minOrderValue) {
        setDiscountMessage(`Mã cần đơn từ ${formatPrice(discount.minOrderValue)}`);
        return;
      }
      setAppliedDiscount(discount);
      localStorage.setItem("appliedDiscount", JSON.stringify(discount));
      setDiscountCode("");
      setDiscountMessage(`Đã áp dụng mã ${code} thành công!`);
    } catch (err: any) {
      setDiscountMessage(err.message || "Mã không hợp lệ");
    } finally {
      setIsApplying(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    localStorage.removeItem("appliedDiscount");
    setDiscountMessage("Đã xóa mã giảm giá");
    setTimeout(() => setDiscountMessage(""), 3000);
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) }
        : item
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (id: string) => {
    if (!confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
    const newCart = cart.filter((i) => i.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === cart.length ? [] : cart.map((i) => i.id));
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push("/auth/dangnhap");
      return;
    }
    localStorage.setItem("checkoutItems", JSON.stringify(selectedProducts));
    if (appliedDiscount) {
      localStorage.setItem("appliedDiscount", JSON.stringify(appliedDiscount));
    } else {
      localStorage.removeItem("appliedDiscount");
    }
    router.push("/checkout?t=" + Date.now());
  };

  useEffect(() => {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    if (redirectPath === "/cart" && localStorage.getItem("user")) {
      sessionStorage.removeItem("redirectAfterLogin");
    }
  }, []);

  if (!mounted) return <div className="text-center py-5 fs-4">Đang tải giỏ hàng...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 1180 }}>
      <div className="bg-white rounded-4 shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link href="/">
            <button className="btn btn-outline-primary rounded-pill px-4 fw-bold">
              Tiếp tục mua sắm
            </button>
          </Link>
          <h2 className="fw-bold text-primary">
            Giỏ hàng của bạn{" "}
            <span className="badge bg-danger fs-5">{cart.length}</span>
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-3 text-secondary">Giỏ hàng trống</p>
            <Link href="/products" className="btn btn-primary px-5 py-3 rounded-pill">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === cart.length && cart.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Hình</th>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th className="text-center">Tồn kho</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      const stockColor =
                        item.stock === 0 ? "text-danger" : item.stock <= 5 ? "text-warning" : "text-success";
                      return (
                        <tr key={item.id} style={{ background: isSelected ? "#fffde7" : "" }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                            />
                          </td>
                          <td>
                            <Image
                              src={item.image}
                              width={60}
                              height={80}
                              className="rounded"
                              style={{ objectFit: "cover" }}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.src = "/image/default-book.jpg";
                              }}
                            />
                          </td>
                          <td className="fw-semibold">{item.name}</td>
                          <td>
                            {item.originalPrice ? (
                              <div>
                                <span className="text-muted text-decoration-line-through small">
                                  {formatPrice(item.originalPrice)}
                                </span>
                                <div className="text-danger fw-bold">{formatPrice(item.price)}</div>
                              </div>
                            ) : (
                              <div className="text-danger fw-bold">{formatPrice(item.price)}</div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus />
                              </button>
                              <span className="fw-bold" style={{ minWidth: 40 }}>
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </td>
                          <td className={`text-center fw-bold ${stockColor}`}>
                            Còn {item.stock}
                          </td>
                          <td className="text-danger fw-bold">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TÓM TẮT ĐƠN HÀNG */}
            <div className="col-lg-4">
              <div className="bg-light rounded-4 p-4 shadow sticky-top" style={{ top: "20px" }}>
                <h5 className="fw-bold text-primary mb-3">Tóm tắt đơn hàng</h5>
                <hr />

                {/* Mã giảm giá */}
                {!appliedDiscount ? (
                  <div className="mb-4">
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập mã giảm giá..."
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                        disabled={isApplying}
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={isApplying || !discountCode.trim()}
                        className="btn btn-primary px-4"
                      >
                        {isApplying ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {discountMessage && (
                      <div className={`small mt-2 fw-medium ${discountMessage.includes("thành công") || discountMessage.includes("0 ₫") ? "text-success" : "text-danger"}`}>
                        {discountMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-success bg-opacity-10 rounded-3 border border-success">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong className="text-success">Mã giảm giá:</strong>
                        <span className="badge bg-success fs-6 ms-2">{appliedDiscount.code}</span>
                      </div>
                      <button onClick={removeDiscount} className="btn btn-sm btn-outline-danger rounded-pill">
                        Xóa mã
                      </button>
                    </div>
                  </div>
                )}

                {/* Tạm tính */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính ({selectedIds.length} sp):</span>
                  <strong>{formatPrice(totalSelected)}</strong>
                </div>

                {/* Giảm giá - luôn hiện, dù 0đ */}
                <div className={`d-flex justify-content-between mb-2 fw-bold ${discountAmount > 0 ? "text-success" : "text-muted"}`}>
                  <span>Giảm giá:</span>
                  <span>{discountAmount > 0 ? `-${formatPrice(discountAmount)}` : "0 ₫"}</span>
                </div>

                <hr className="border-2" />

                {/* Tổng thanh toán */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-primary m-0">Tổng thanh toán:</h5>
                  <h4 className="text-danger fw-bold m-0">{formatPrice(finalTotal)}</h4>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedIds.length === 0}
                  className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-lg fs-5"
                >
                  Thanh toán ngay ({selectedIds.length} sản phẩm)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}