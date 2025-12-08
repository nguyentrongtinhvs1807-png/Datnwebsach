"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PaymentQr from "@/components/PaymentQr";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

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
  minOrderValue?: number;
};

const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_OPTIONS = [
  { label: "Nội thành TP.HCM/Hà Nội", fee: 30000 },
  { label: "Các tỉnh thành khác", fee: 50000 },
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const refreshKey = searchParams?.get("t") || "";

  const [cart, setCart] = useState<Product[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod" as "cod" | "bank" | "vnpay",
    email: "",
    note: "",
  });

  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(30000);

  // Thêm state để hiện lỗi
  const [phoneError, setPhoneError] = useState("");

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  // Hàm validate số điện thoại
  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, ""); // chỉ giữ số
    if (cleaned.length === 0) {
      setPhoneError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (cleaned.length !== 10) {
      setPhoneError("Số điện thoại phải có đúng 10 chữ số");
      return false;
    }
    if (!/^0[3|5|7|8|9]/.test(cleaned)) {
      setPhoneError("Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Hàm dọn dẹp giỏ hàng sau khi đặt thành công
  const clearCartAfterCheckout = () => {
    try {
      const checkoutItemsJson = localStorage.getItem("checkoutItems");
      if (!checkoutItemsJson) return;

      const checkoutItems: Product[] = JSON.parse(checkoutItemsJson);
      const checkoutIds = checkoutItems.map(item => String(item.id));

      const currentCartJson = localStorage.getItem("cart");
      let currentCart: any[] = [];
      if (currentCartJson) {
        try {
          currentCart = JSON.parse(currentCartJson);
        } catch {}
      }

      const updatedCart = currentCart.filter(
        (item: any) => !checkoutIds.includes(String(item.id || item.sach_id))
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("appliedDiscount");
      localStorage.removeItem("checkoutDiscounts");

      window.dispatchEvent(new Event("cart-update"));
      window.dispatchEvent(new Event("checkoutSuccess"));
    } catch (err) {
      console.error("Lỗi khi dọn giỏ hàng:", err);
    }
  };

  const generateNameFromEmail = (email: string) => {
    const namePart = email.split("@")[0].replace(/[\d.]/g, "");
    return namePart
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        const userEmail = user.email || "";
        const fullName = user.ho_ten || user.name || generateNameFromEmail(userEmail);

        setCustomer(prev => ({
          ...prev,
          name: fullName,
          email: userEmail,
          phone: user.phone || user.sdt || "",
          address: user.address || "",
        }));
      } catch (e) {
        console.error("Parse user lỗi:", e);
      }
    }

    const itemsJson = localStorage.getItem("checkoutItems");
    if (itemsJson && itemsJson !== "null") {
      try {
        const items = JSON.parse(itemsJson);
        if (Array.isArray(items) && items.length > 0) {
          const normalized = items.map((p: any) => ({
            id: String(p.id || p.sach_id || Date.now()),
            name: p.name || p.ten_sach || "Sản phẩm",
            price: Number(p.price || p.gia_ban || 0),
            image: p.image || p.hinh_anh || "/image/default-book.jpg",
            quantity: Number(p.quantity || 1),
          }));
          setCart(normalized);
        }
      } catch {
        localStorage.removeItem("checkoutItems");
      }
    }

    const savedFromCart = localStorage.getItem("appliedDiscount");
    if (savedFromCart) {
      try {
        const discount: Discount = JSON.parse(savedFromCart);
        setAppliedDiscounts([discount]);
      } catch {
        localStorage.removeItem("appliedDiscount");
      }
    }

    const savedInCheckout = localStorage.getItem("checkoutDiscounts");
    if (savedInCheckout) {
      try {
        const discounts: Discount[] = JSON.parse(savedInCheckout);
        setAppliedDiscounts(prev => {
          const merged = [...prev];
          discounts.forEach(d => {
            if (!merged.some(x => x.code === d.code)) merged.push(d);
          });
          return merged.slice(0, 2);
        });
      } catch {}
    }
  }, [refreshKey]);

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const discountAmount = useMemo(() => {
    let totalDiscount = 0;
    let remainingPrice = totalPrice;

    appliedDiscounts.forEach(d => {
      if (d.minOrderValue && totalPrice < d.minOrderValue) return;

      let amount = d.type === "percent"
        ? Math.floor(remainingPrice * d.value / 100)
        : d.value;

      if (d.maxDiscount) amount = Math.min(amount, d.maxDiscount);
      totalDiscount += amount;
      remainingPrice -= amount;
    });

    return totalDiscount;
  }, [appliedDiscounts, totalPrice]);

  const effectiveShippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : shippingFee;
  const finalPrice = totalPrice - discountAmount + effectiveShippingFee;

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return setDiscountMessage("Vui lòng nhập mã giảm giá!");
    if (appliedDiscounts.length >= 2) return setDiscountMessage("Tối đa chỉ được dùng 2 mã giảm giá!");
    if (appliedDiscounts.some(d => d.code === code)) return setDiscountMessage("Mã này đã được áp dụng!");

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

      if (discount.minOrderValue && totalPrice < discount.minOrderValue) {
        setDiscountMessage(`Mã cần đơn từ ${formatPrice(discount.minOrderValue)}`);
        return;
      }

      const newList = [...appliedDiscounts, discount];
      setAppliedDiscounts(newList);
      localStorage.setItem("checkoutDiscounts", JSON.stringify(newList));
      setDiscountCode("");
      setDiscountMessage(`Đã áp dụng mã ${code} thành công!`);
      toast.success(`Mã ${code} đã được thêm!`);
    } catch (err: any) {
      setDiscountMessage(err.message || "Mã không hợp lệ");
      toast.error(err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const removeDiscount = (code: string) => {
    const newList = appliedDiscounts.filter(d => d.code !== code);
    setAppliedDiscounts(newList);
    localStorage.setItem("checkoutDiscounts", JSON.stringify(newList));
    if (newList.length === 0) localStorage.removeItem("checkoutDiscounts");
    toast.success(`Đã xóa mã ${code}`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Giỏ hàng trống!");

    // Kiểm tra các trường bắt buộc
    if (!customer.name.trim()) return toast.error("Vui lòng nhập họ và tên!");
    if (!customer.address.trim()) return toast.error("Vui lòng nhập địa chỉ giao hàng!");

    // Kiểm tra số điện thoại
    if (!validatePhone(customer.phone)) {
      return toast.error("Số điện thoại không hợp lệ!");
    }

    setIsCheckingOut(true);

    try {
      // === VNPAY ===
      if (customer.payment === "vnpay") {
        const orderResponse = await fetch("http://localhost:3003/api/don-hang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: { name: customer.name, phone: customer.phone, address: customer.address, email: customer.email, note: customer.note || "" },
            items: cart,
            total: finalPrice,
            paymentMethod: "vnpay",
            discounts: appliedDiscounts.length > 0 ? appliedDiscounts : undefined,
            shippingFee: effectiveShippingFee,
          }),
        });

        const orderResult = await orderResponse.json();
        if (!orderResult.success) throw new Error(orderResult.message || "Lỗi tạo đơn");

        const vnpayResponse = await fetch("http://localhost:3003/api/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalPrice,
            orderId: orderResult.orderCode,
            orderInfo: `Thanh toan don hang ${orderResult.orderCode} - PIBOOK`,
          }),
        });

        const vnpayResult = await vnpayResponse.json();
        if (vnpayResult.vnpUrl) {
          clearCartAfterCheckout();
          window.location.href = vnpayResult.vnpUrl;
          return;
        }
      }

      // === COD / CHUYỂN KHOẢN ===
      const userRaw = localStorage.getItem("user");
      const userId = userRaw ? JSON.parse(userRaw)?.nguoi_dung_id || JSON.parse(userRaw)?.id || null : null;

      const orderData = {
        ho_ten: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        address: customer.address,
        note: customer.note || "",
        payment: customer.payment,
        products: cart,
        totalPrice: finalPrice,
        shippingFee: effectiveShippingFee,
        discounts: appliedDiscounts.length > 0 ? appliedDiscounts : undefined,
        userId,
      };

      const res = await fetch("http://localhost:3003/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Lỗi tạo đơn hàng");

      clearCartAfterCheckout();

      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại PIBOOK");

      setTimeout(() => {
        window.location.href = "/orders";
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-bold text-red-600 mb-6">Giỏ hàng trống!</h2>
          <Link href="/cart" className="btn btn-primary btn-lg rounded-pill px-5">
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gray-50 py-4">
      <div className="container-xl">
        <div className="mb-5">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-full shadow hover:shadow-md transition-all font-medium text-gray-700 hover:text-primary"
          >
            <FaArrowLeft className="text-lg" />
            Quay lại giỏ hàng
          </Link>
        </div>

        <div className="row g-4">
          {/* THÔNG TIN GIAO HÀNG */}
          <div className="col-lg-7">
            <div className="bg-white rounded-3 shadow-sm p-4 p-md-5">
              <h4 className="fw-bold text-primary mb-4">Thông tin giao hàng</h4>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium">Họ và tên <span className="text-danger">*</span></label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Nguyễn Văn A"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>

                {/* SỐ ĐIỆN THOẠI + LỖI */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${phoneError ? "is-invalid" : ""}`}
                    placeholder="0901234567"
                    value={customer.phone}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10); // chỉ cho nhập số, tối đa 10
                      setCustomer({ ...customer, phone: value });
                      validatePhone(value); // validate realtime
                    }}
                    maxLength={10}
                  />
                  {phoneError && <div className="invalid-feedback d-block mt-1">{phoneError}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="email@example.com"
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Địa chỉ giao hàng <span className="text-danger">*</span></label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Số nhà, đường, phường/xã..."
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Giao giờ hành chính..."
                    value={customer.note}
                    onChange={e => setCustomer({ ...customer, note: e.target.value })}
                  />
                </div>

                {/* PHÍ SHIP */}
                <div className="col-12 mt-4">
                  <label className="form-label fw-bold text-primary">Khu vực giao hàng</label>
                  <div className="row g-3">
                    {SHIPPING_OPTIONS.map((opt, idx) => (
                      <div key={idx} className="col-12">
                        <div
                          className={`p-3 rounded border cursor-pointer transition-all ${
                            shippingFee === opt.fee && totalPrice < FREE_SHIPPING_THRESHOLD
                              ? "border-primary bg-primary bg-opacity-10"
                              : "border-light"
                          }`}
                          onClick={() => totalPrice < FREE_SHIPPING_THRESHOLD && setShippingFee(opt.fee)}
                        >
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              checked={effectiveShippingFee === opt.fee}
                              readOnly
                            />
                            <label className="form-check-label fw-medium ms-2">
                              {opt.label} - <strong className="text-danger">{opt.fee.toLocaleString("vi-VN")}đ</strong>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPrice >= FREE_SHIPPING_THRESHOLD && (
                    <div className="alert alert-success mt-3 mb-0">
                      Chúc mừng! Đơn từ {formatPrice(FREE_SHIPPING_THRESHOLD)} được miễn phí vận chuyển
                    </div>
                  )}
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label fw-bold text-primary">Phương thức thanh toán</label>
                  <select
                    className="form-select form-select-lg"
                    value={customer.payment}
                    onChange={e => setCustomer({ ...customer, payment: e.target.value as any })}
                  >
                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="vnpay">Thanh toán qua VNPay</option>
                  </select>
                  {customer.payment === "bank" && (
                    <div className="mt-3 p-3 bg-light rounded border">
                      <PaymentQr
                        amount={finalPrice}
                        account="0857226757"
                        beneficiary="PIBOOK COMPANY"
                        bankName="Vietinbank"
                        note={customer.name || "PIBOOK"}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="col-lg-5">
            <div className="bg-white rounded-3 shadow-sm p-4 sticky-top" style={{ top: "20px" }}>
              <h5 className="fw-bold text-primary mb-3">Đơn hàng ({cart.length} sản phẩm)</h5>

              <div className="border-bottom pb-3 mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {cart.map(item => (
                  <div key={item.id} className="d-flex gap-3 py-3">
                    <Image
                      src={item.image}
                      width={60}
                      height={80}
                      alt={item.name}
                      className="rounded shadow-sm"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark small">{item.name}</div>
                      <div className="text-muted small">x{item.quantity}</div>
                      <div className="text-danger fw-bold">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MÃ GIẢM GIÁ */}
              <div className="bg-light rounded-3 p-3 mb-3">
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    className="form-control"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleApplyDiscount()}
                    disabled={isApplying || appliedDiscounts.length >= 2}
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplying || appliedDiscounts.length >= 2 || !discountCode.trim()}
                    className="btn btn-primary px-4"
                  >
                    {isApplying ? "..." : "Áp dụng"}
                  </button>
                </div>

                {appliedDiscounts.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {appliedDiscounts.map(d => (
                      <span
                        key={d.code}
                        className="badge bg-success fs-6 px-3 py-2 d-flex align-items-center gap-2"
                      >
                        {d.code}
                        <button
                          onClick={() => removeDiscount(d.code)}
                          className="btn-close btn-close-white"
                          style={{ fontSize: "0.7rem" }}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {discountMessage && (
                  <div className={`small mt-2 fw-medium ${discountMessage.includes("thành công") ? "text-success" : "text-danger"}`}>
                    {discountMessage}
                  </div>
                )}
              </div>

              {/* TỔNG TIỀN */}
              <div className="pt-2 border-top">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-bold mb-2">
                    <span>Giảm giá ({appliedDiscounts.length} mã)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển</span>
                  <strong className={effectiveShippingFee === 0 ? "text-success" : "text-danger"}>
                    {effectiveShippingFee === 0 ? "Miễn phí" : `+${formatPrice(effectiveShippingFee)}`}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mt-3 pt-3 border-top border-2">
                  <span className="fs-5 fw-bold">Tổng thanh toán</span>
                  <span className="fs-4 fw-bold text-danger">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="btn btn-primary w-100 mt-4 py-3 rounded-pill fw-bold fs-5 shadow-lg"
                style={{ background: "linear-gradient(90deg, #4369e3, #62bbff)" }}
              >
                {isCheckingOut ? "Đang xử lý..." : "XÁC NHẬN ĐẶT HÀNG"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}