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
};

// Định nghĩa kiểu dữ liệu cho mã giảm giá đã áp dụng (đồng nhất với CheckoutPage)
type Discount = {
  code: string;
  value: number; // Giá trị: phần trăm (10) hoặc tiền cố định (50000)
  type: "percent" | "fixed";
  maxDiscount?: number; // Tối đa (chỉ áp dụng cho percent)
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Discount States
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false); // Trạng thái loading

  // Load cart và mã giảm giá
  useEffect(() => {
    setMounted(true);

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");

    // Lọc item lỗi
    const cleaned = stored.filter(
      (item: any) =>
        item &&
        typeof item === "object" &&
        (item.id !== undefined || item.sach_id !== undefined)
    );
    

    // Chuẩn hóa: Ưu tiên dùng item.id, sau đó đến item.sach_id
    const normalized = cleaned.map((item: any) => ({
      id: String(item.id || item.sach_id), 
      name: item.name || item.ten_sach || "Sản phẩm không tên",
      price: Number(item.price) || 0,
      image: item.image || "/image/default-book.jpg",
      quantity: Number(item.quantity || 1),
    }));
    

    // Lưu lại localStorage nếu có item rác
    if (cleaned.length !== stored.length) {
      localStorage.setItem("cart", JSON.stringify(normalized));
    }

    setCart(normalized);
    setSelectedIds(normalized.map((item: Product) => item.id)); // 💡 Mặc định chọn tất cả
    

    // 🌟 TẢI MÃ GIẢM GIÁ ĐÃ LƯU TỪ LOCAL STORAGE
    const rawDiscount = localStorage.getItem("appliedDiscount");
    if (rawDiscount) {
        try {
            const loadedDiscount: Discount = JSON.parse(rawDiscount);
            setAppliedDiscount(loadedDiscount);
            setDiscountCode(loadedDiscount.code);
            setDiscountError(`Mã ${loadedDiscount.code} đã được áp dụng!`);
        } catch (e) {
            console.error("Lỗi khi tải mã giảm giá từ Local Storage:", e);
            localStorage.removeItem("appliedDiscount");
        }
    }
    
    // Xóa thông tin "Mua ngay"
    localStorage.removeItem("checkoutItem");
  }, []); // Chỉ chạy 1 lần khi mount

  // Update quantity
  const updateQuantity = (id: string, delta: number) => {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Remove product
  const removeFromCart = (id: string) => {
    // Thay thế alert/confirm bằng modal tùy chỉnh trong môi trường thực tế
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  // Select toggle
  const toggleSelect = (id: string) => {
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

  const formatPrice = (price: number) =>
    Number(price).toLocaleString("vi-VN") + "đ";

  const selectedProducts = cart.filter((item) =>
    selectedIds.includes(item.id)
  );

  const totalSelected = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ------------------------------------------------------------------
  // LOGIC MÃ GIẢM GIÁ (ĐÃ THÊM LOGIC LƯU VÀO LOCAL STORAGE)
  // ------------------------------------------------------------------
  const applyDiscount = async () => {
    setDiscountError("");
    setAppliedDiscount(null);
    if (isApplying) return;
    setIsApplying(true);

    const code = discountCode.trim().toUpperCase();

    if (!code) {
      setDiscountError("Vui lòng nhập mã giảm giá!");
      setIsApplying(false);
      return;
    }
    
    // 💡 Thêm check: Nếu chưa chọn sản phẩm nào, không áp dụng mã
    if (selectedIds.length === 0 || totalSelected === 0) {
        setDiscountError("Vui lòng chọn ít nhất một sản phẩm để áp dụng mã!");
        setIsApplying(false);
        return;
    }
    
    try {
        // Kiểm tra mã giảm giá
        const apiUrl = `http://localhost:3003/discount-codes/${encodeURIComponent(code)}`;
        console.log("Đang gọi API kiểm tra mã:", apiUrl);

        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Lỗi API (Status != 200):", res.status, errorText);
            setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
            // 🗑️ Xóa mã nếu có lỗi để đảm bảo checkout không bị lỗi
            localStorage.removeItem("appliedDiscount"); 
            return;
        }

        const data = await res.json();
        
        if (!data || !data.code) { 
            console.error("Lỗi API (Dữ liệu rỗng hoặc thiếu code):", data); 
            setDiscountError("Không tìm thấy mã hợp lệ!");
            localStorage.removeItem("appliedDiscount");
            return;
        }

        // Chuẩn hóa loại giảm giá và giá trị từ API
        const discountTypeApi = data.type?.toLowerCase();
        const discountTypeLegacy = data.loai_giam?.toLowerCase();

        let type: Discount['type'];
        if (discountTypeApi === 'percent' || discountTypeLegacy === 'phan_tram') {
            type = "percent";
        } else {
            type = "fixed";
        }
        
        const value = Number(data.gia_tri_giam || data.value) || 0;
        const maxDiscount = Number(data.toi_da || data.maxDiscount) || undefined;
        
        const newDiscount: Discount = {
            code: data.code, 
            value: value,
            type: type,
            maxDiscount: maxDiscount
        };

        setAppliedDiscount(newDiscount);
        setDiscountError(`Áp dụng mã ${data.code} thành công!`); 
        
        // 🚀 LƯU MÃ GIẢM GIÁ VÀO LOCAL STORAGE CHO TRANG CHECKOUT
        if (typeof window !== 'undefined') {
            localStorage.setItem("appliedDiscount", JSON.stringify(newDiscount));
        }
        
    } catch (e: any) {
        console.error("Lỗi mạng/Kết nối API:", e.message);
        setDiscountError("Có lỗi xảy ra khi kiểm tra mã giảm giá (Lỗi Mạng/Kết nối).");
        setAppliedDiscount(null);
        localStorage.removeItem("appliedDiscount");
    } finally {
        setIsApplying(false);
    }
  };
  
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError("");
    setDiscountCode("");
    
    // 🗑️ XÓA MÃ GIẢM GIÁ KHỎI LOCAL STORAGE
    if (typeof window !== 'undefined') {
        localStorage.removeItem("appliedDiscount");
    }
  };

  // Tính toán giá trị giảm giá (Dùng useMemo để tối ưu)
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    
    let discountValue = 0;
    
    if (appliedDiscount.type === "percent") {
      discountValue = Math.floor((totalSelected * appliedDiscount.value) / 100);
      
      // Áp dụng giới hạn giảm giá tối đa
      if (appliedDiscount.maxDiscount && discountValue > appliedDiscount.maxDiscount) {
        discountValue = appliedDiscount.maxDiscount;
      }
    } else { // fixed
      discountValue = appliedDiscount.value;
    }
    
    // Đảm bảo giảm giá không vượt quá tổng tiền
    return Math.min(discountValue, totalSelected);
    
  }, [totalSelected, appliedDiscount]);
  // ------------------------------------------------------------------
  // END LOGIC MÃ GIẢM GIÁ
  // ------------------------------------------------------------------


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
        <Link href="/home">
          <button className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold">
            ← Tiếp tục mua hàng
          </button>
        </Link>

        <h2 className="fw-bold text-primary m-0 text-center flex-grow-1">
          🛒 Giỏ hàng của bạn{" "}
          <span className="badge bg-secondary ms-2">{cart.length}</span>
        </h2>

        <div style={{ width: 150 }}></div>
      </div>

      {/* MAIN */}
      {cart.length === 0 ? (
        <div className="text-center p-5">
          <img
            src="https://cdn-icons-png.flaticon.com/256/2038/2038854.png"
            alt="empty"
            style={{ width: 90, opacity: 0.5 }}
          />
          <p className="mt-4 text-secondary">
            Giỏ hàng trống.{" "}
            <Link href="/products" className="fw-bold text-primary">
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
                    <th>Hình</th>
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

              {/* DISCOUNT */}
              <label className="fw-semibold">Mã giảm giá:</label>
              <div className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã giảm giá..."
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={!!appliedDiscount || isApplying}
                />
                {!appliedDiscount ? (
                    <button 
                        className="btn btn-primary" 
                        onClick={applyDiscount}
                        disabled={isApplying || !discountCode.trim() || selectedIds.length === 0}
                    >
                        {isApplying ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Áp dụng
                            </>
                        ) : "Áp dụng"}
                    </button>
                ) : (
                    <button 
                        className="btn btn-outline-danger" 
                        onClick={removeDiscount}
                    >
                        Xóa mã
                    </button>
                )}
              </div>

              {discountError && (
                <p className={`small ${appliedDiscount ? 'text-success' : 'text-danger'}`}>{discountError}</p>
              )}

              {discountAmount > 0 && appliedDiscount && (
                <p className="text-success small fw-bold">
                  ✅ Mã {appliedDiscount.code}: -{formatPrice(discountAmount)}
                </p>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span className="fw-semibold">
                  {formatPrice(totalSelected)}
                </span>
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
                <h4 className="fw-bold text-danger">
                  {formatPrice(finalTotal)}
                </h4>
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