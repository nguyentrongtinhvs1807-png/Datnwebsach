"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PaymentQr from "@/components/PaymentQr"; 

// --- TYPES (Giữ nguyên) ---
type Product = {
  id: string; 
  name: string;
  price: number;
  image: string;
  quantity: number;
  sach_id?: string; 
};

type Discount = {
  code: string;
  value: number;
  type: "percent" | "fixed";
  maxDiscount?: number;
};

//  DANH SÁCH MÃ GIẢM GIÁ CỐ ĐỊNH (Giữ nguyên)
const DISCOUNT_CODES: Record<
  string,
  Omit<Discount, 'code'> & { maxDiscount?: number }
> = {
  SALE10: { type: "percent", value: 10, maxDiscount: 100000 }, // Giảm 10%, tối đa 100k
  SALE20: { type: "percent", value: 20, maxDiscount: 200000 }, // Giảm 20%, tối đa 200k
  GIAM50K: { type: "fixed", value: 50000 },                  // Giảm cố định 50k
  FREESHIP: { type: "fixed", value: 30000 },                 // 💡 ĐÃ SỬA: Giảm cố định 30k (Để khớp với ảnh 30.000đ)
};


export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  // Khởi tạo các trường customer là rỗng, nhưng sẽ được cập nhật
  // trong useEffect nếu user đã đăng nhập.
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod",
    email: "",
    note: "", 
  });
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const router = useRouter();

// ------------------------------------------------------------------
// --- LOGIC LẤY DỮ LIỆU CART/CHECKOUT (ĐÃ TỐI ƯU HÓA TẢI MÃ GIẢM GIÁ) ---
// ------------------------------------------------------------------
  useEffect(() => {
    try {
      // 🟢 1. KIỂM TRA VÀ TỰ ĐỘNG ĐIỀN THÔNG TIN USER NẾU ĐÃ ĐĂNG NHẬP
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        // Tự động điền email và tên nếu có
        setCustomer(prev => ({
            ...prev,
            email: user.email || "", // Lấy email
            name: user.ho_ten || "", // Lấy họ tên
            phone: user.phone || "", // Lấy sđt (nếu có)
            address: user.address || "", // Lấy địa chỉ (nếu có)
        }));
      }

      // 2. Lấy IDS trong URL
      const searchParams = new URLSearchParams(window.location.search);
      const idsParam = searchParams.get("ids");
      let selectedIds: string[] = [];

      if (idsParam) {
        selectedIds = idsParam.split(",").map((id) => id.trim());
      }

      // 3. Lấy CART GỐC từ Local Storage và Chuẩn hóa ID
      const rawCart = localStorage.getItem("cart") || "[]";
      const allCart: Product[] = JSON.parse(rawCart).map((p: any) => ({
        // Đảm bảo ID luôn là chuỗi và ưu tiên sach_id nếu có
        id: String(p.id || p.sach_id), 
        name: p.name || p.ten_sach || "Sản phẩm không tên",
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 1,
        image: p.image || "/image/default-book.jpg",
      }));

      let finalCart: Product[] = [];

      // 4. Lọc sản phẩm theo logic
      if (selectedIds.length > 0) {
        // Lọc các sản phẩm có ID trùng khớp với ID trong URL (từ CartPage)
        finalCart = allCart.filter((item: Product) =>
          selectedIds.includes(item.id)
        );
      }
      else {
        // Kiểm tra MUA NGAY
        const quickBuyRaw = localStorage.getItem("checkoutItem");
        if (quickBuyRaw) {
          const parsed = JSON.parse(quickBuyRaw);
          finalCart = Array.isArray(parsed) ? parsed : [parsed];
          // Chuẩn hóa ID cho sản phẩm MUA NGAY
          finalCart = finalCart.map(p => ({
            ...p,
            id: String(p.id || p.sach_id),
            price: Number(p.price) || 0,
            quantity: Number(p.quantity) || 1,
          }));
        }
        // Lấy TOÀN BỘ CART (trường hợp không có ids và không có checkoutItem)
        else {
          finalCart = allCart;
        }
      }

      setCart(finalCart);
      
      // 🌟 5. TẢI MÃ GIẢM GIÁ ĐÃ ÁP DỤNG TỪ LOCAL STORAGE
      const rawDiscount = localStorage.getItem("appliedDiscount");
      if (rawDiscount) {
          const loadedDiscount: Discount = JSON.parse(rawDiscount);
          // 💡 Đảm bảo mã giảm giá hợp lệ trước khi áp dụng lại
          if (DISCOUNT_CODES[loadedDiscount.code]) {
              setAppliedDiscount(loadedDiscount);
              setDiscountCode(loadedDiscount.code);
              // Thông báo thành công để user biết mã đã được áp dụng
              setDiscountError(`Mã ${loadedDiscount.code} đã được áp dụng từ Giỏ hàng!`); 
          } else {
             // Nếu mã trong localStorage không hợp lệ (đã hết hạn/xóa), ta xóa nó đi.
             localStorage.removeItem("appliedDiscount");
          }
      }
      
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu checkout:", error);
    }
  }, [router]);
// ------------------------------------------------------------------
// --- END LOGIC LẤY DỮ LIỆU ---
// ------------------------------------------------------------------


  // --- LOGIC TÍNH TOÁN GIÁ (ĐÃ SỬA LỖI TÍNH GIÁ CUỐI CÙNG) ---
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getDiscountValue = useMemo(() => {
    if (!appliedDiscount) return 0;
    let discountValue = 0;
    
    // Tính toán giá trị giảm giá dựa trên loại mã
    if (appliedDiscount.type === "percent") {
      discountValue = Math.floor(
        (totalPrice * appliedDiscount.value) / 100
      );
      // Giới hạn giảm giá tối đa
      if (
        appliedDiscount.maxDiscount &&
        discountValue > appliedDiscount.maxDiscount
      ) {
        discountValue = appliedDiscount.maxDiscount;
      }
    } else { // fixed
      discountValue = appliedDiscount.value;
    }
    
    // Đảm bảo giá trị giảm không vượt quá tổng giá trị đơn hàng
    return Math.min(discountValue, totalPrice); 
  }, [totalPrice, appliedDiscount]);

  const finalPrice = useMemo(() => {
    // Sửa lỗi: Chỉ tính toán dựa trên Tạm tính và Giảm giá
    // Nếu bạn muốn thêm Phí vận chuyển (ví dụ: 270.000đ như trong ảnh cũ), 
    // bạn cần định nghĩa nó và cộng vào đây.
    const price = totalPrice - getDiscountValue;
    return price > 0 ? price : 0;
  }, [totalPrice, getDiscountValue]);
  

// ------------------------------------------------------------------
// --- LOGIC MÃ GIẢM GIÁ (Giữ nguyên) ---
// ------------------------------------------------------------------
  const handleApplyDiscount = () => {
    setDiscountError("");
    setAppliedDiscount(null);
    if (isApplying) return;
    
    const code = discountCode.trim().toUpperCase();

    if (!code) {
        setDiscountError("Vui lòng nhập mã giảm giá!");
        return;
    }
    
    // 🔍 Tìm mã giảm giá trong danh sách cố định
    const discountInfo = DISCOUNT_CODES[code];

    if (!discountInfo) {
        setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
        return;
    }
    
    // 🎯 Áp dụng mã thành công
    const newDiscount: Discount = {
        code: code,
        value: discountInfo.value,
        type: discountInfo.type,
        maxDiscount: discountInfo.maxDiscount,
    };
    
    setAppliedDiscount(newDiscount);
    setDiscountError(`Áp dụng mã ${code} thành công!`); 
    
    // 🚀 LƯU LẠI MÃ GIẢM GIÁ VÀO LOCAL STORAGE để trang checkout tải lại
    if (typeof window !== 'undefined') {
        localStorage.setItem("appliedDiscount", JSON.stringify(newDiscount));
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
    
    // 🗑️ XÓA MÃ GIẢM GIÁ KHỎI LOCAL STORAGE
    if (typeof window !== 'undefined') {
        localStorage.removeItem("appliedDiscount");
    }
  };
// ------------------------------------------------------------------
// --- END LOGIC MÃ GIẢM GIÁ ---
// ------------------------------------------------------------------


  // --- LOGIC ĐẶT HÀNG (ĐÃ SỬA LỖI XÓA LOCAL STORAGE) ---
  const handleCheckout = async () => {
    if (cart.length === 0) {
        alert("Giỏ hàng trống!"); 
        return;
    }
    // Kiểm tra các trường bắt buộc
    if (!customer.name || !customer.phone || !customer.address || !customer.email) {
        alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
        return;
    }
      
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    const rawUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    const userId = rawUser ? JSON.parse(rawUser).id : null; // Lấy userId nếu có

    // Object chứa thông tin đơn hàng
    const order = {
      ho_ten: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      payment: customer.payment,
      note: customer.note, 
      products: cart,
      totalPrice: finalPrice,
      userId: userId, // Đặt userId (có thể là null)
      discount: appliedDiscount
        ? {
            code: appliedDiscount.code,
            value: appliedDiscount.value,
            type: appliedDiscount.type,
            maxDiscount: appliedDiscount.maxDiscount,
          }
        : undefined,
    };


    // =================================================================
    // 🚀 XỬ LÝ THANH TOÁN VNPay (Giữ nguyên)
    // =================================================================
    if (customer.payment === "vnpay") {
        try {
            // 1. Gửi request đến server để tạo URL thanh toán VNPay
            const BACKEND_API_URL = "http://localhost:3003/api/create-qr";
            const orderId = 'ORDER-' + Date.now() + Math.floor(Math.random() * 1000000);

            const vnpayRes = await fetch(BACKEND_API_URL, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: finalPrice, 
                    orderId: orderId, // Mã giao dịch duy nhất
                    orderInfo: `Thanh toan don hang #${orderId}`,
                    returnUrl: 'http://localhost:3003/api/check-payment-vnpay', 
                }),
            });
            
            if (!vnpayRes.ok) {
                 const errorText = await vnpayRes.text();
                 console.error("Lỗi API VNPay:", errorText);
                 throw new Error(`Tạo liên kết VNPay thất bại. Lỗi: ${errorText.substring(0, 100)}...`);
            }

            const vnpayData = await vnpayRes.json();

            // 2. Chuyển hướng người dùng đến cổng thanh toán VNPay
            if (vnpayData.vnpUrl) {
                console.log("Chuyển hướng đến VNPay:", vnpayData.vnpUrl);
                window.location.href = vnpayData.vnpUrl;
                return; // Quan trọng: Dừng hàm tại đây
            } else {
                throw new Error("API không trả về vnpUrl hợp lệ.");
            }
            
        } catch (error: any) {
            console.error("Lỗi khi thực hiện thanh toán VNPay:", error.message);
            alert(`Có lỗi xảy ra khi tạo liên kết VNPay. Chi tiết: ${error.message}. Vui lòng thử lại!`);
        } finally {
            setIsCheckingOut(false); 
        }
        return; 
    }

    // =================================================================
    // 📦 XỬ LÝ THANH TOÁN THÔNG THƯỜNG (COD/Bank)
    // =================================================================
    try {
      // 🚀 Giả lập POST order lên server
      const res = await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo đơn hàng");

      // Xóa sản phẩm khỏi local storage sau khi đặt hàng thành công
      if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const idsParam = searchParams.get("ids");
          
          if (idsParam) {
              // Nếu mua nhiều sản phẩm từ giỏ hàng (có ids) -> Xóa các item đó khỏi cart
              const selectedIds = idsParam.split(",").map((id) => id.trim());
              const rawCart = localStorage.getItem("cart") || "[]";
              const allCart = JSON.parse(rawCart).filter((p: Product) => !selectedIds.includes(String(p.id || p.sach_id)));
              localStorage.setItem("cart", JSON.stringify(allCart));
          } else {
              // Nếu không có ids (mua ngay hoặc toàn bộ cart) -> Xóa checkoutItem và toàn bộ cart
              localStorage.removeItem("checkoutItem");
              localStorage.removeItem("cart");
          }
          
          // 🗑️ Xóa mã giảm giá và cartFinalTotal (nếu có) sau khi đặt hàng
          localStorage.removeItem("appliedDiscount");
          localStorage.removeItem("cartFinalTotal"); 
      }


      alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
      router.push("/orders");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
        setIsCheckingOut(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleGoBack = () => {
    router.back();
  };

  // --- RENDER (Giữ nguyên) ---
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
            <p className="fs-5 text-danger fw-medium">
              🛒 Đơn hàng của bạn hiện đang trống!
            </p>
            <a
              href="/products"
              className="btn btn-primary px-5 py-2 rounded-3 fw-semibold mt-3"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <div className="row gy-4 gx-3">
            {/* Cột 1: Thông tin giao hàng & Thanh toán */}
            <div className="col-lg-6">
              <div className="bg-light shadow-sm border-0 rounded-4 px-4 py-4 h-100">
                <h4 className="fw-semibold text-primary mb-4">
                  <i className="bi bi-person-lines-fill me-2"></i>Thông tin
                  giao hàng
                </h4>

                <div className="mb-3">
                  <label className="checkout-label">Họ và tên <span className="text-danger">*</span></label>
                  <input
                    name="name"
                    value={customer.name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="form-control checkout-input"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Email <span className="text-danger">*</span></label>
                  <input
                    name="email"
                    type="email"
                    value={customer.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    className="form-control checkout-input"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Số điện thoại <span className="text-danger">*</span></label>
                  <input
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="form-control checkout-input"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Địa chỉ giao hàng <span className="text-danger">*</span></label>
                  <input
                    name="address"
                    value={customer.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ chi tiết (số nhà, đường, xã/phường...)"
                    className="form-control checkout-input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="checkout-label">Ghi chú/Yêu cầu</label>
                  <textarea
                    name="note"
                    value={customer.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi giao..."
                    className="form-control checkout-input"
                    rows={3}
                  />
                </div>

                <h5 className="fw-semibold text-primary mb-3 mt-4 pt-2 border-top">
                  <i className="bi bi-wallet2 me-2"></i>Phương thức thanh toán
                </h5>
                <select
                  name="payment"
                  value={customer.payment}
                  onChange={handleChange}
                  className="form-select checkout-input"
                >
                  <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                  <option value="bank">Chuyển khoản ngân hàng (Thủ công)</option>
                  <option value="vnpay">Thanh toán qua VNPay (Online)</option>
                </select>

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
                      Quét mã để chuyển khoản
                    </h5>
                    {/* Giả sử PaymentQr là component bạn tự định nghĩa để tạo mã QR */}
                    <PaymentQr
                      amount={finalPrice}
                      account="0857226757" // Thay bằng tài khoản thật
                      beneficiary="PIBOOK COMPANY" // Thay bằng tên thụ hưởng thật
                      bankName="Ngân hàng Vietinbank" // Thay bằng ngân hàng thật
                      note={`Thanh toan PIBOOK - ${customer.name || "Khach hang"}`}
                    />
                    <p className="small text-muted mt-2">
                        **Lưu ý:** Vui lòng nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận nhanh nhất.
                    </p>
                  </div>
                )}
                {/* Optional: Hiển thị hướng dẫn khi chọn VNPay */}
                {customer.payment === "vnpay" && (
                   <div
                    className="mt-4 p-3 border rounded"
                    style={{
                      background: "#e8fff6",
                      borderColor: "#b7ffdb",
                      borderRadius: "12px",
                      color: "#008055"
                    }}
                  >
                    <h5 className="fw-bold mb-2">Thanh toán qua VNPay</h5>
                    <p className="small mb-0">
                        Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất giao dịch bằng thẻ ngân hàng, quét mã QR hoặc ví điện tử.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cột 2: Chi tiết Đơn hàng & Thanh toán */}
            <div className="col-lg-6">
              <div className="bg-light shadow-sm border-0 rounded-4 px-4 py-4 h-100">
                <h4 className="fw-semibold text-primary mb-4">
                  <i className="bi bi-basket3-fill me-2"></i>Chi tiết đơn hàng
                </h4>

                {/* Danh sách sản phẩm */}
                <ul className="list-group mb-3 list-group-flush" style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {cart.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 py-2 border-bottom"
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
                          <div className="fw-medium text-truncate" style={{maxWidth: '180px'}}>{p.name}</div>
                          <div className="small text-muted">
                            SL: {p.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="fw-bold text-primary text-end">
                        {(p.price * p.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Form nhập mã giảm giá */}
                <div className="mb-4 border-top pt-3">
                    <label className="checkout-label mb-2">Mã giảm giá</label>
                    <div className="d-flex">
                        <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => {
                                setDiscountCode(e.target.value);
                                setDiscountError("");
                            }}
                            placeholder="Nhập mã (nếu có)"
                            className="form-control checkout-input me-2"
                            disabled={!!appliedDiscount || isApplying}
                        />
                        {!appliedDiscount ? (
                            <button
                                className="btn btn-primary flex-shrink-0"
                                onClick={handleApplyDiscount}
                                disabled={isApplying || !discountCode.trim()}
                            >
                                {isApplying ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Áp dụng
                                    </>
                                ) : (
                                    "Áp dụng"
                                )}
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-danger flex-shrink-0"
                                onClick={handleRemoveDiscount}
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                    {discountError && (
                        <p className={`small mt-2 ${appliedDiscount ? 'text-success' : 'text-danger'}`}>
                            {discountError}
                        </p>
                    )}
                </div>


                {/* Tổng kết tiền */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Tạm tính</span>
                    <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>

                  {appliedDiscount && (
                    <div className="d-flex justify-content-between mb-2 text-success fw-medium">
                      <span>
                        Giảm giá ({appliedDiscount.code})
                      </span>
                      <span>
                        - {getDiscountValue.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  
                  {/* Nếu bạn có phí ship, thêm vào đây */}
                  {/* <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Phí vận chuyển</span>
                    <span>{SHIPPING_FEE.toLocaleString("vi-VN")}đ</span>
                  </div> */}


                  <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5 text-gradient-dark">
                    <span>Tổng thanh toán</span>
                    <span>{finalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <button
                  className="btn checkout-btn w-100 mt-4 py-3 fw-bold shadow-sm"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isCheckingOut}
                >
                    {isCheckingOut ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang xử lý...
                        </>
                    ) : (
                        customer.payment === "vnpay" ? "THANH TOÁN QUA VNPAY" : "Xác nhận đặt hàng"
                    )}
                </button>
                <p className="small text-center text-muted mt-2">
                    Bằng cách đặt hàng, bạn đồng ý với các Điều khoản & Điều kiện của chúng tôi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .checkout-bg {
          background: linear-gradient(
            140deg,
            #f7faff 0%,
            #e8eefd 60%,
            #e4efff 100%
          );
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
          background: linear-gradient(90deg, #4369e3 0%, #62bbff 100%);
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
        .checkout-btn:hover:not(:disabled) {
          background: linear-gradient(80deg, #ffc107 20%, #4369e3 100%);
          color: #fff !important;
          box-shadow: 0 4px 15px 0 rgba(67, 105, 227, 0.4);
        }
        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .custom-back-btn {
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          min-width: 110px;
        }
        .text-gradient {
          background: linear-gradient(90deg, #62bbff 0%, #4369e3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .text-gradient-dark {
            background: linear-gradient(90deg, #4369e3 0%, #21409a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
        }
        .bg-light {
            background-color: #f7f9fd !important; /* Màu nền nhẹ hơn */
        }
        @media (max-width: 992px) {
          .checkout-wrapper {
            padding: 17px !important;
            max-width: 100vw;
          }
          .bg-light {
            min-height: auto !important;
          }
        }
        @media (max-width: 575px) {
          .checkout-title {
            font-size: 1.7rem;
          }
          .checkout-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}