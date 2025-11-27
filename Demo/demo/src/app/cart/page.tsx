"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type Discount = {
  code: string;
  value: number;
  type: "percent" | "fixed";
  maxDiscount?: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false); // để hiện loading

  useEffect(() => {
    const initializeCart = async () => {
      setMounted(true);

      // 1. Load + Dọn rác + Chuẩn hóa giỏ hàng
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      const cleaned = stored.filter(
        (item: any) =>
          item &&
          typeof item === "object" &&
          (item.id !== undefined || item.sach_id !== undefined)
      );

      const normalized: Product[] = [];
      for (const item of cleaned) {
        let stock = Number(item.stock || item.ton_kho_sach || 0);
        if (!stock || stock >= 999) {
          try {
            const res = await fetch(`http://localhost:3003/books/${item.id || item.sach_id}`);
            if (res.ok) {
              const book = await res.json();
              stock = Number(book.ton_kho_sach) || 50;
            }
          } catch {
            stock = 50;
          }
        }

        normalized.push({
          id: String(item.id || item.sach_id),
          name: item.name || item.ten_sach || "Sản phẩm không tên",
          price: Number(item.price) || 0,
          image: item.image || "/image/default-book.jpg",
          quantity: Math.max(1, Number(item.quantity) || 1),
          stock,
        });
      }

      if (cleaned.length !== stored.length) {
        localStorage.setItem("cart", JSON.stringify(normalized));
      }

      setCart(normalized);
      setSelectedIds(normalized.map((i) => i.id));

      // 2. Tải mã giảm giá đã lưu (nếu có)
      const saved = localStorage.getItem("appliedDiscount");
      if (saved) {
        try {
          const d = JSON.parse(saved);
          setAppliedDiscount(d);
          setDiscountCode(d.code);
          setDiscountError(`Mã ${d.code} đã được áp dụng!`);
        } catch {
          localStorage.removeItem("appliedDiscount");
        }
      }

      localStorage.removeItem("checkoutItem");
    };

    initializeCart();
  }, []);

  // HÀM ÁP DỤNG MÃ GIẢM GIÁ – CHẠY KHI BẤM NÚT "ÁP DỤNG"
  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountError("Vui lòng nhập mã giảm giá!");
      return;
    }

    setIsApplying(true);
    setDiscountError("");

    try {
      const res = await fetch(`http://localhost:3003/discount-codes/${code}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      const discount: Discount = {
        code: data.code || code,
        value: Number(data.gia_tri_giam || data.value || 0),
        type: (data.type || data.loai_giam || "").toLowerCase().includes("percent") ? "percent" : "fixed",
        maxDiscount: data.toi_da ? Number(data.toi_da) : undefined,
      };

      setAppliedDiscount(discount);
      setDiscountCode(discount.code);
      setDiscountError(`Mã ${discount.code} đã được áp dụng thành công!`);
      localStorage.setItem("appliedDiscount", JSON.stringify(discount));
    } catch {
      setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
    } finally {
      setIsApplying(false);
    }
  };

  // XÓA MÃ
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
    localStorage.removeItem("appliedDiscount");
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) return alert("Số lượng tối thiểu là 1");
    if (newQty > item.stock) return alert(`Chỉ còn ${item.stock} sản phẩm!`);

    const updated = cart.map((i) => (i.id === id ? { ...i, quantity: newQty } : i));
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = (id: string) => {
    if (!confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
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

  const formatPrice = (p: number) => Number(p).toLocaleString("vi-VN") + "đ";

  const selectedProducts = cart.filter((i) => selectedIds.includes(i.id));
  const totalSelected = selectedProducts.reduce((s, i) => s + i.price * i.quantity, 0);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    let amount = appliedDiscount.type === "percent"
      ? Math.floor(totalSelected * appliedDiscount.value / 100)
      : appliedDiscount.value;
    if (appliedDiscount.maxDiscount) amount = Math.min(amount, appliedDiscount.maxDiscount);
    return Math.min(amount, totalSelected);
  }, [totalSelected, appliedDiscount]);

  const finalTotal = Math.max(totalSelected - discountAmount, 0);

  const handleCheckout = () => {
    if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm!");
    localStorage.setItem("checkoutItems", JSON.stringify(selectedProducts));
    if (appliedDiscount) localStorage.setItem("appliedDiscount", JSON.stringify(appliedDiscount));
    window.location.href = "/checkout";
  };

  if (!mounted) return <div className="text-center py-5 fs-3">Đang tải giỏ hàng...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 1180 }}>
      <div className="bg-white rounded-4 shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link href="/home">
            <button className="btn btn-outline-primary rounded-pill px-4 fw-bold">
              Back to Shopping
            </button>
          </Link>
          <h2 className="fw-bold text-primary">
            Giỏ hàng của bạn <span className="badge bg-danger fs-5">{cart.length}</span>
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
                      <th><input type="checkbox" checked={selectedIds.length === cart.length && cart.length > 0} onChange={handleSelectAll} /></th>
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
                      const canAdd = item.quantity < item.stock;
                      const stockColor = item.stock >= 20 ? "text-success" : item.stock >= 5 ? "text-warning" : "text-danger";

                      return (
                        <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? "#fffde7" : "" }}>
                          <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                          <td><img src={item.image} width={60} height={80} className="rounded" style={{ objectFit: "cover" }} alt={item.name} /></td>
                          <td className="fw-semibold">{item.name}</td>
                          <td className="text-danger fw-bold">{formatPrice(item.price)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}><FaMinus /></button>
                              <span className="fw-bold w-px-40 text-center">{item.quantity}</span>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, 1)} disabled={!canAdd}><FaPlus /></button>
                            </div>
                          </td>
                          <td className={`text-center fw-bold ${stockColor}`}>Còn {item.stock}</td>
                          <td className="text-danger fw-bold">{formatPrice(item.price * item.quantity)}</td>
                          <td><button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}><FaTrashAlt /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="bg-light rounded-4 p-4 shadow">
                <h5 className="fw-bold text-primary mb-3">Tóm tắt đơn hàng</h5>
                <hr />

                <div className="mb-3">
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !appliedDiscount && handleApplyDiscount()}
                      disabled={!!appliedDiscount || isApplying}
                    />
                    {appliedDiscount ? (
                      <button className="btn btn-outline-danger px-4 fw-bold" onClick={removeDiscount}>
                        Xóa mã
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary px-4 fw-bold"
                        onClick={handleApplyDiscount}
                        disabled={isApplying || !discountCode.trim()}
                      >
                        {isApplying ? "..." : "Áp dụng"}
                      </button>
                    )}
                  </div>
                  {discountError && (
                    <small className={appliedDiscount ? "text-success fw-bold" : "text-danger"}>
                      {discountError}
                    </small>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính ({selectedIds.length} sp):</span>
                  <span className="fw-semibold">{formatPrice(totalSelected)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-bold mb-2">
                    <span>Giảm giá ({appliedDiscount?.code}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-primary m-0">Tổng thanh toán:</h5>
                  <h4 className="text-danger fw-bold m-0">{formatPrice(finalTotal)}</h4>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedIds.length === 0}
                  className="btn btn-success w-100 mt-4 rounded-pill py-3 fw-bold text-white shadow-lg"
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