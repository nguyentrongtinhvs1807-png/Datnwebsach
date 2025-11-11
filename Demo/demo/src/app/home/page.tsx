"use client";

import AboutBookbuy from "@/components/AboutBookbuy";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  FormControl,
  Badge,
  Alert
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import React from "react";

// ====== Interface ======
interface Book {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number;
  loai_bia: string;
  Loai_sach_id: number;
  image?: string;
}
interface Category {
  loai_sach_id: number;
  ten_loai: string;
}
interface Discount {
  ma_gg: string;
  loai_giam: string;
  gia_tri_giam: number;
  giam_toi_da: number;
  don_toi_thieu: number;
  ngay_bd: string;
  ngay_kt: string;
  trang_thai?: number;
}

// ====== HOME PAGE ======
export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [keyword, setKeyword] = useState("");
  const [showCopiedCode, setShowCopiedCode] = useState<string | null>(null); // NEW: hiển thị mã vừa sao chép
  const router = useRouter();

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    fetch("http://localhost:3003/books")
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3003/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3003/api/ma-giam-gia")
      .then((res) => res.json())
      .then((data) => {
        console.log("📋 Mã giảm giá từ API:", data);
        setDiscounts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ Lỗi lấy mã giảm giá:", err);
        setDiscounts([]);
      });
  }, []);

  // Thêm vào giỏ hàng - lưu localStorage và chuyển đến /cart
  const handleAddToCart = (book: Book) => {
    try {
      // Lấy cart hiện tại
      const cartStr = localStorage.getItem("cart");
      let cart = cartStr ? JSON.parse(cartStr) : [];
      if (!Array.isArray(cart)) cart = [];
      // Kiểm tra đã có sách chưa, nếu có tăng số lượng, chưa có thì thêm mới
      const existedIndex = cart.findIndex(
        (item: any) => item.sach_id === book.sach_id
      );
      if (existedIndex >= 0) {
        cart[existedIndex].quantity += 1;
      } else {
        cart.push({
          sach_id: book.sach_id,
          ten_sach: book.ten_sach,
          price: book.gia_sach,
          image: book.image,
          quantity: 1,
          ten_tac_gia: book.ten_tac_gia,
          gg_sach: book.gg_sach
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      router.push("/cart");
    } catch (err) {
      alert("Không thể thêm vào giỏ hàng. Thử lại sau!");
    }
  };

  const uniqueBooks = Array.from(
    new Map(books.map((book) => [book.sach_id, book])).values()
  );
  const filteredBooks = uniqueBooks.filter((b) =>
    b.ten_sach?.toLowerCase().includes(keyword.toLowerCase())
  );

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN") + "đ";
  };

  const handleBuyNow = (book: Book) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("⚠️ Vui lòng đăng nhập để tiếp tục mua hàng!");
      router.push("/auth/dangnhap");
      return;
    }
  
    try {
      const user = JSON.parse(storedUser);
      if (!user || (!user.id && !user.ten && !user.email)) {
        alert("⚠️ Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
        router.push("/auth/dangnhap");
        return;
      }
  
      //  Lưu sản phẩm được mua ngay vào localStorage riêng
      const quickBuy = [
        {
          sach_id: book.sach_id,
          ten_sach: book.ten_sach,
          price: book.gia_sach - (book.gg_sach || 0),
          image: book.image,
          quantity: 1,
          ten_tac_gia: book.ten_tac_gia,
        },
      ];
      localStorage.setItem("checkoutItem", JSON.stringify(quickBuy));
  
      //  Chuyển sang trang thanh toán
      router.push("/checkout");
    } catch (error) {
      console.error("❌ Lỗi khi xử lý mua ngay:", error);
      alert("⚠️ Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };
  

  // Helper: format discount for UI - format số nguyên không có .00
  const formatDiscount = (discount: Discount) => {
    // Hỗ trợ cả "phan_tram"/"gia_tien" và "percent"/"fixed"
    const loaiGiam = discount.loai_giam?.toLowerCase();
    
    // Hàm format số nguyên (loại bỏ .00)
    const formatInteger = (num: number) => {
      return Math.round(num).toLocaleString("vi-VN");
    };
    
    if (loaiGiam === "phan_tram" || loaiGiam === "percent") {
      const percentValue = Math.round(discount.gia_tri_giam);
      const maxDiscount = formatInteger(discount.giam_toi_da);
      const minOrder = formatInteger(discount.don_toi_thieu);
      return `Giảm ${percentValue}% tối đa ${maxDiscount}đ. Đơn tối thiểu ${minOrder}đ`;
    }
    if (loaiGiam === "gia_tien" || loaiGiam === "fixed") {
      const discountValue = formatInteger(discount.gia_tri_giam);
      const minOrder = formatInteger(discount.don_toi_thieu);
      return `Giảm ${discountValue}đ. Đơn tối thiểu ${minOrder}đ`;
    }
    return "Mã ưu đãi";
  };

  // Custom: hiển thị lại mã giảm giá vừa sao chép cho user ("sao mã giảm giả mình mất rồi hiện lại cho mình")
  const handleCopyDiscount = (ma_gg: string) => {
    navigator.clipboard.writeText(ma_gg)
      .then(() => {
        setShowCopiedCode(ma_gg);
        setTimeout(() => setShowCopiedCode(null), 4500); // ẩn thông báo sau 4.5s, giúp user dễ nhìn lại mã vừa copy
      })
      .catch(() => {
        alert("Không thể sao chép mã giảm giá. Hãy thử lại!");
      });
  };

  // ========== UI ==========

  return (
    <>
      {/* ======== HEADER & SEARCH ======== */}
      <Container
  fluid
  className="py-2 px-lg-5 px-md-3 hero-bg"
  style={{
    background: "linear-gradient(90deg, #ffd976 0%, #ffeacb 100%)",
    borderRadius: "24px",
    marginTop: "24px",
    boxShadow: "0 8px 36px rgba(255,193,7,0.18)"
  }}
>
  <Row className="align-items-center">
    {/* Cột bên trái */}
    <Col xs={12} md={6} className="mb-4 mb-md-0">
      <h1
        className="display-4 fw-bold mb-3"
        style={{ color: "#222" }}
      >
        Chào mừng bạn đến với{" "}
        <span style={{ color: "#d97706" }}>Pibbok</span>
      </h1>
      <p className="lead" style={{ color: "#565656" }}>
        Nền tảng mua sách trực tuyến thông minh. Tìm kiếm, chọn lựa
        và tận hưởng sách mỗi ngày!
      </p>

      <InputGroup className="my-4 w-75" style={{ maxWidth: 400 }}>
        <FormControl
          placeholder="Tìm tên sách, tác giả, ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            borderTopLeftRadius: "24px",
            borderBottomLeftRadius: "24px",
            borderRight: "none",
            fontSize: 16,
            boxShadow: "0 2px 8px 0 rgba(255,193,7,0.07)"
          }}
        />
        <Button
          variant="warning"
          style={{
            borderTopRightRadius: "24px",
            borderBottomRightRadius: "24px",
            fontWeight: 600
          }}
        >
          Tìm kiếm
        </Button>
      </InputGroup>

      {/* Danh sách thể loại */}
      <div className="d-flex flex-wrap gap-2 mt-2">
        {categories.slice(0, 8).map((c) => (
          <Badge
            key={c.loai_sach_id}
            bg="light"
            text="dark"
            style={{
              border: "1px solid #ffd346",
              borderRadius: 20,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 500,
              background: "linear-gradient(90deg, #fffde4, #fff6ba)"
            }}
            onClick={() => router.push(`/category/${c.loai_sach_id}`)}
          >
            {c.ten_loai}
          </Badge>
        ))}
      </div>
    </Col>

    {/* Cột bên phải (ảnh banner) */}
    <Col xs={12} md={6}>
      <div
        className="position-relative hero-banner mx-auto overflow-hidden shadow-sm"
        style={{
          maxWidth: "440px",
          borderRadius: "2rem",
          border: "2px solid #ffe8b3",
          transition: "transform 0.4s ease, box-shadow 0.4s ease"
        }}
      >
        <img
          src="/image/images (11).jpeg" 
          alt="Pibook Banner"
          style={{
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "2rem"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </Col>
  </Row>
</Container>
      {/* ======= DANH MỤC & BANNER ======= */}
      <Container className="my-5">
        <Row className="gx-4">
        <Col xs={12} md={3} className="d-flex flex-column gap-3">
    {[
      { img: "abc.jpg", link: "https://nigioikhatsi.net/kinhsach-pdf/Duong%20Xua%20May%20Trang.pdf" },
      { img: "114.jpg", link: "https://vnexpress.net/giai-tri/sach/diem-sach" },
    ].map((item, i) => (
      <a
        key={i}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-decoration-none"
      >
        <div
          className="rounded-4 shadow-sm bg-light overflow-hidden"
          style={{
            minHeight: 180,
            border: "2px solid #fff0b7",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 10px 25px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <img
            src={`/image/${item.img}`}
            alt={`Banner nhỏ ${i + 1}`}
            className="w-100 h-100"
            style={{
              objectFit: "cover",
              height: "190px",
              borderRadius: "2rem",
              transition: "transform 0.5s cubic-bezier(.19,1,.22,1)",
            }}
          />
        </div>
      </a>
    ))}
  </Col>
          <Col xs={12} md={9}>
            <div className="banner-lg-container rounded-4 shadow-lg position-relative overflow-hidden" style={{
              height: "410px",
              border: "5px solid #ffecb3",
              background: "radial-gradient(circle 600px at 40% 70%, #fffbe7 60%, #fff3c0 100%)"
            }}>
              <div
                id="mainBanner"
                className="carousel slide h-100"
                data-bs-ride="carousel"
                data-bs-interval="4200"
              >
                <div className="carousel-inner h-100">
                  {[
                    "b9690ac7ec4b7c94d44d9e519b6c30e7.jpg",
                    "59e5b2f50d98a56a32b62a749b0703a5.jpg",
                    "0f342e41bb8009c013ee9435f249b3d7.jpg",
                  ].map((img, i) => (
                    <div
                      key={i}
                      className={`carousel-item ${i === 0 ? "active" : ""} h-100`}
                      data-bs-interval="4200"
                    >
                      <img
                        src={`/image/${img}`}
                        className="d-block w-100 h-100"
                        alt={`Banner ${i + 1}`}
                        style={{ objectFit: "cover", borderRadius: "2rem" }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#mainBanner"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#mainBanner"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
              <div className="banner-glow" style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "90px",
                background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fffbe7 95%)",
                zIndex: 2
              }}></div>
            </div>
          </Col>
        </Row>
        
      </Container>

      {/* ========= DANH MỤC SÁCH ĐẸP ========= */}
      <Container className="mb-5">
        <h2 className="section-title mb-4 fw-bold text-center" style={{ color: "#ff9800" }}>
          Danh mục sách
        </h2>
        {categories.length > 0 ? (
          <Row className="justify-content-center g-4">
            {categories.map((cat, idx) => {
              return (
                <Col
                  key={cat.loai_sach_id}
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2}
                  className="d-flex align-items-stretch"
                >
                  <div
                    onClick={() => router.push(`/category/${cat.loai_sach_id}`)}
                    className="category-card bg-white p-4 pb-3 ps-3 pe-3 d-flex flex-column align-items-center text-center justify-content-center shadow rounded-4 w-100"
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.25s cubic-bezier(.19,1,.22,1), box-shadow 0.25s",
                      border: "2px solid #fff0b7",
                      height: "180px",
                      gap: 10
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.09)";
                      e.currentTarget.style.boxShadow = "0 16px 32px rgba(255,193,7,0.22)";
                      e.currentTarget.style.borderColor = "#ffc107";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
                      e.currentTarget.style.borderColor = "#fff0b7";
                    }}
                  >
                    <span className="fw-semibold" style={{ fontSize: "1.08rem" }}>{cat.ten_loai}</span>
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className="text-center text-muted">Không có danh mục nào để hiển thị.</p>
        )}
      </Container>

      {/* ========= MÃ GIẢM GIÁ nổi bật - HIỂN THỊ RÕ RÀNG ========= */}
      <Container className="my-5" style={{ 
        background: "linear-gradient(135deg, #fff9e6 0%, #ffe8b3 100%)",
        borderRadius: "24px",
        padding: "32px 24px",
        border: "3px solid #ffd700",
        boxShadow: "0 8px 32px rgba(255, 215, 0, 0.25)"
      }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2" style={{
            color: "#d97706",
            fontSize: "2rem",
            letterSpacing: ".05em",
            textShadow: "2px 2px 4px rgba(255, 215, 0, 0.3)"
          }}>
            MÃ GIẢM GIÁ ĐỘC QUYỀN
          </h2>
          <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
            Sao chép mã và sử dụng ngay khi thanh toán để được giảm giá
          </p>
        </div>

        {/* Thông báo khi đã sao chép mã */}
        {showCopiedCode && (
          <div style={{
            background: "linear-gradient(90deg, #10b981, #059669)",
            border: "3px solid #047857",
            borderRadius: "20px",
            padding: "18px 32px",
            margin: "0 auto 24px auto",
            maxWidth: 450,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
            gap: 14,
            fontWeight: 700,
            color: "#fff",
            fontSize: "1.1rem",
            letterSpacing: "1px",
            justifyContent: "center",
            animation: "fadeIn 0.3s ease-in"
          }}>
            <span>
              Đã sao chép mã: <span style={{ 
                color: "#fef3c7", 
                fontWeight: 900,
                fontSize: "1.2rem",
                letterSpacing: "2px"
              }}>{showCopiedCode}</span>
            </span>
            <Button
              size="sm"
              style={{
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "6px 14px",
                background: "#fff",
                border: "2px solid #059669",
                color: "#059669"
              }}
              onClick={() => setShowCopiedCode(null)}
              variant="light"
            >
              Đóng
            </Button>
          </div>
        )}

        {/* Debug: Hiển thị số lượng mã */}
        <div className="text-center mb-3 small text-muted">
          Tìm thấy {discounts.length} mã giảm giá trong hệ thống
        </div>

        {discounts.length > 0 ? (
          <Row className="justify-content-center g-4">
            {discounts
              .filter(
                (discount) => {
                  // Kiểm tra loại giảm giá hợp lệ
                  const loaiGiam = discount.loai_giam?.toLowerCase();
                  const isValidType = loaiGiam === "phan_tram" || 
                                     loaiGiam === "percent" || 
                                     loaiGiam === "gia_tien" || 
                                     loaiGiam === "fixed";
                  
                  if (!isValidType) return false;

                  // Kiểm tra trạng thái (chỉ hiển thị mã có trang_thai = 1)
                  if (discount.trang_thai !== undefined && discount.trang_thai !== 1) {
                    return false;
                  }

                  // Kiểm tra ngày (nới lỏng hơn - chỉ ẩn nếu đã quá hạn rõ ràng)
                  try {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày
                    const startDate = new Date(discount.ngay_bd);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(discount.ngay_kt);
                    endDate.setHours(23, 59, 59, 999); // Đến cuối ngày kết thúc

                    // Chỉ hiển thị mã chưa hết hạn (hoặc đang trong thời gian hiệu lực)
                    return today <= endDate && formatDiscount(discount) !== "Mã ưu đãi";
                  } catch (e) {
                    // Nếu lỗi parse ngày, vẫn hiển thị
                    console.warn("Lỗi parse ngày mã giảm giá:", discount.ma_gg, e);
                    return formatDiscount(discount) !== "Mã ưu đãi";
                  }
                }
              )
              .slice(0, 8)
              .map((discount, idx) => (
                <Col key={discount.ma_gg} xs={12} sm={6} md={4} lg={3} className="mb-3">
                  <div
                    className="shadow-lg"
                    style={{
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, #ffffff 0%, #fff9e6 100%)",
                      border: "3px solid #ffd700",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 215, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <div className="p-4">
                      {/* Header mã giảm giá */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div
                          className="px-4 py-2 rounded-pill fw-bold text-white"
                          style={{
                            background: "linear-gradient(90deg, #f59e0b, #d97706)",
                            fontSize: "1.1rem",
                            letterSpacing: "2px",
                            boxShadow: "0 4px 12px rgba(217, 119, 6, 0.4)",
                            border: "2px dashed #fff"
                          }}
                        >
                          {discount.ma_gg}
                        </div>
                        <Button
                          size="sm"
                          variant="success"
                          className="rounded-pill px-3 py-2"
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)"
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyDiscount(discount.ma_gg);
                          }}
                        >
                          Copy
                        </Button>
                      </div>

                      {/* Nội dung mã giảm giá */}
                      <div style={{ 
                        lineHeight: 1.6,
                        color: "#374151",
                        fontSize: "0.95rem"
                      }}>
                        <div className="fw-semibold mb-2" style={{ color: "#d97706", fontSize: "1rem" }}>
                          {formatDiscount(discount)}
                        </div>
                        <div className="small text-muted">
                          Từ {new Date(discount.ngay_bd).toLocaleDateString("vi-VN")} đến {new Date(discount.ngay_kt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <div className="text-muted" style={{ fontSize: "1.1rem" }}>
              Hiện chưa có mã giảm giá nào
            </div>
          </div>
        )}
      </Container>

{/* ========= SÁCH MỚI & SÁCH GIẢM GIÁ ======== */}
  <Container className="mt-5 mb-5">
  <h2
    className="section-title mb-4 text-center fw-bold"
    style={{
      color: "#029e74",
      letterSpacing: ".04em",
    }}
  >
    Ưu đãi & Sách mới nổi bật
  </h2>

  <Row className="gy-4 align-items-stretch">
    {/* SÁCH MỚI NỔI BẬT */}
    <Col xs={12}>
      <h4
        className="fw-bold text-success text-center mb-3"
        style={{ letterSpacing: "0.02em" }}
      >
        Sách mới nổi bật
      </h4>

      <Row>
        {filteredBooks.length > 0 ? (
          filteredBooks.slice(12, 20).map((book, index) => {
            const hasDiscount = book.gg_sach > 0;
            const finalPrice = hasDiscount
              ? Math.max(book.gia_sach - book.gg_sach, 0)
              : book.gia_sach;

            //  Hàm định dạng giá kiểu Việt Nam (chuẩn, bỏ .00)
            const formatVietnamesePrice = (price: number | string) => {
              const num =
                typeof price === "string" ? parseFloat(price) : price;
              if (isNaN(num)) return "0đ";
              return (
                num.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ"
              );
            };

            return (
              <Col
                key={`book-${book.sach_id}-${index}`}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4 d-flex"
              >
                <Card
                  className="product-card shadow border-0 flex-fill"
                  style={{
                    borderRadius: "1.5rem",
                    transition: "all 0.22s cubic-bezier(.19,1,.22,1)",
                    background: "#fff7e2",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform =
                      "translateY(-7px) scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => router.push(`/products/${book.sach_id}`)}
                >
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={book.image || "/image/default-book.jpg"}
                      alt={book.ten_sach}
                      className="p-3"
                      style={{
                        height: "200px",
                        objectFit: "contain",
                        borderRadius: "1rem",
                        background: "#fff",
                        boxShadow: "0 2px 12px #ffd07e40",
                      }}
                    />
                    {hasDiscount && (
                      <span
                        className="badge bg-danger position-absolute top-0 end-0 m-2"
                        style={{
                          fontSize: "0.85rem",
                          borderRadius: "0.8rem",
                          padding: "7px 15px",
                          background:
                            "linear-gradient(90deg, #fb5a36 70%, #ffb95a 100%)",
                        }}
                      >
                        -{formatVietnamesePrice(Math.round(book.gg_sach))}
                      </span>
                    )}
                  </div>

                  <Card.Body className="pt-2 pb-3 text-center d-flex flex-column">
                    <Card.Title
                      className="fw-bold mb-1 text-dark"
                      style={{ fontSize: "1.1rem", minHeight: 38 }}
                    >
                      {book.ten_sach}
                    </Card.Title>

                    <Card.Text
                      className="text-muted mb-2"
                      style={{ fontSize: ".98rem" }}
                    >
                      {book.ten_tac_gia}
                    </Card.Text>

                    {hasDiscount ? (
                      <>
                        <h5 className="text-danger fw-bold mb-0">
                          {formatVietnamesePrice(finalPrice)}
                        </h5>
                        <div
                          className="text-decoration-line-through text-secondary mb-2"
                          style={{ fontSize: ".96rem" }}
                        >
                          {formatVietnamesePrice(book.gia_sach)}
                        </div>
                      </>
                    ) : (
                      <h5 className="text-primary mb-2">
                        {formatVietnamesePrice(book.gia_sach)}
                      </h5>
                    )}

                    <div className="d-flex gap-2 justify-content-center mt-auto flex-wrap">
                      <Button
                        variant="warning"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${book.sach_id}`);
                        }}
                      >
                        Xem Chi Tiết
                      </Button>
                      <Button
                        variant="danger"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(book);
                        }}
                      >
                        Mua Ngay !
                      </Button>
                      <Button
                        variant="success"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                      >
                        Thêm Vào Giỏ hàng
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p className="text-center text-muted">
            Không có sách nào để hiển thị
          </p>
        )}
      </Row>
    </Col>
  </Row>
</Container>
      {/* Sách giảm giá riêng, đẹp */}
      <Container className="mt-5 mb-5">
  <h2
    className="section-title mb-4 text-center fw-bold"
    style={{
      color: "#029e74",
      letterSpacing: ".04em",
    }}
  >
    Ưu đãi & Sách mới nổi bật
  </h2>

  <Row className="gy-4 align-items-stretch">
    {/* SÁCH MỚI NỔI BẬT */}
    <Col xs={12}>
      <h4
        className="fw-bold text-success text-center mb-3"
        style={{ letterSpacing: "0.02em" }}
      >
        Sách giảm giá
      </h4>

      <Row>
        {filteredBooks.length > 0 ? (
          filteredBooks.slice(0, 8).map((book, index) => {
            const hasDiscount = book.gg_sach > 0;
            const finalPrice = hasDiscount
              ? Math.max(book.gia_sach - book.gg_sach, 0)
              : book.gia_sach;

            //  Hàm định dạng giá kiểu Việt Nam (chuẩn, bỏ .00)
            const formatVietnamesePrice = (price: number | string) => {
              const num =
                typeof price === "string" ? parseFloat(price) : price;
              if (isNaN(num)) return "0đ";
              return (
                num.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ"
              );
            };

            return (
              <Col
                key={`book-${book.sach_id}-${index}`}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4 d-flex"
              >
                <Card
                  className="product-card shadow border-0 flex-fill"
                  style={{
                    borderRadius: "1.5rem",
                    transition: "all 0.22s cubic-bezier(.19,1,.22,1)",
                    background: "#fff7e2",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform =
                      "translateY(-7px) scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => router.push(`/products/${book.sach_id}`)}
                >
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={book.image || "/image/default-book.jpg"}
                      alt={book.ten_sach}
                      className="p-3"
                      style={{
                        height: "200px",
                        objectFit: "contain",
                        borderRadius: "1rem",
                        background: "#fff",
                        boxShadow: "0 2px 12px #ffd07e40",
                      }}
                    />
                    {hasDiscount && (
                      <span
                        className="badge bg-danger position-absolute top-0 end-0 m-2"
                        style={{
                          fontSize: "0.85rem",
                          borderRadius: "0.8rem",
                          padding: "7px 15px",
                          background:
                            "linear-gradient(90deg, #fb5a36 70%, #ffb95a 100%)",
                        }}
                      >
                        -{formatVietnamesePrice(Math.round(book.gg_sach))}
                      </span>
                    )}
                  </div>

                  <Card.Body className="pt-2 pb-3 text-center d-flex flex-column">
                    <Card.Title
                      className="fw-bold mb-1 text-dark"
                      style={{ fontSize: "1.1rem", minHeight: 38 }}
                    >
                      {book.ten_sach}
                    </Card.Title>

                    <Card.Text
                      className="text-muted mb-2"
                      style={{ fontSize: ".98rem" }}
                    >
                      {book.ten_tac_gia}
                    </Card.Text>

                    {hasDiscount ? (
                      <>
                        <h5 className="text-danger fw-bold mb-0">
                          {formatVietnamesePrice(finalPrice)}
                        </h5>
                        <div
                          className="text-decoration-line-through text-secondary mb-2"
                          style={{ fontSize: ".96rem" }}
                        >
                          {formatVietnamesePrice(book.gia_sach)}
                        </div>
                      </>
                    ) : (
                      <h5 className="text-primary mb-2">
                        {formatVietnamesePrice(book.gia_sach)}
                      </h5>
                    )}

                    <div className="d-flex gap-2 justify-content-center mt-auto flex-wrap">
                      <Button
                        variant="warning"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${book.sach_id}`);
                        }}
                      >
                        Xem Chi Tiết
                      </Button>
                      <Button
                        variant="danger"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(book);
                        }}
                      >
                        Mua Ngay !
                      </Button>
                      <Button
                        variant="success"
                        style={{
                          borderRadius: "20px",
                          minWidth: "90px",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                      >
                        Thêm vào Giỏ hàng
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p className="text-center text-muted">
            Không có sách nào để hiển thị
          </p>
        )}
      </Row>
    </Col>
  </Row>
</Container>

{/* ========== ABOUT & NEWS ========== */}
      <AboutBookbuy />
{/* ================ News Section ================ */}
<Container className="my-5">
      <h2
        className="section-title fw-bold text-center"
        style={{
          color: "#01977d",
          fontSize: "1.8rem",
          letterSpacing: ".03em",
        }}
      >
        Tin Tức & Blog
      </h2>

      <Row>
        {[
          {
            id: 1,
            title: "Top 5 cuốn sách nên đọc năm 2024",
            image: "/image/kheo-an-noi-mck5-996.jpg",
            desc: "Danh sách những cuốn sách hay, dành cho mọi lứa tuổi, giúp bạn phát triển bản thân.",
            link: "https://vietnamnet.vn/10-cuon-sach-best-seller-nen-doc-nam-2024-2253321.html",
          },
          {
            id: 2,
            title: "Những chủ đề sách hot đang được yêu thích",
            image:
              "/image/ket-qua-chung-ket-the-gioi-2_b474288dc1154ec0834cc89aa1f966eb_1024x1024.jpg",
            desc: "Khám phá các chủ đề và thể loại sách đang được các bạn trẻ bình chọn nhiều.",
            link: "https://www.t1.gg/",
          },
          {
            id: 3,
            title: "Khuyến khích sinh viên đọc sách mỗi ngày",
            image: "/image/images.jpeg",
            desc: "Khuyến khích sinh viên đọc sách mỗi ngày để nâng cao kiến thức, phát triển kỹ năng.",
            link: "https://zalopay.vn/nhung-cuon-sach-hay-cho-hoc-sinh-sinh-vien-1557",
          },
        ].map((news) => (
          <Col key={news.id} xs={12} md={4} className="mb-4 d-flex">
            <Card
              className="h-100 shadow rounded-4 border-0 flex-fill"
              style={{
                background: "linear-gradient(120deg, #fffbe8 75%, #fff1c1 100%)",
              }}
            >
              <Card.Img
                variant="top"
                src={news.image}
                alt={news.title}
                style={{
                  height: "210px",
                  objectFit: "cover",
                  borderTopLeftRadius: "1.5rem",
                  borderTopRightRadius: "1.5rem",
                }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title
                  className="text-secondary-emphasis fw-bold"
                  style={{ fontSize: "1.05rem" }}
                >
                  {news.title}
                </Card.Title>
                <Card.Text style={{ flex: 1 }}>{news.desc}</Card.Text>

                {/* Nút "Đọc tiếp" có link riêng */}
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-warning fw-bold"
                  style={{
                    borderRadius: "1.2rem",
                    width: "120px",
                    marginTop: "auto",
                    textAlign: "center",
                  }}
                >
                  Đọc tiếp →
                </a>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    </>
  );
}
