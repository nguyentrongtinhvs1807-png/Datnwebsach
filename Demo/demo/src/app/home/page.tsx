"use client";

import AboutBookbuy from "@/components/AboutBookbuy";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
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
import React from "react";

// ====== Interface ======
interface Book {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number; // Đảm bảo đúng là gia_sach
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
  hinh_anh?: string;
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

// ========= GENERIC NOTIFICATION COMPONENT =========
const Notification = ({ message, show, variant, onClose }: { 
    message: string; 
    show: boolean; 
    variant: 'success' | 'danger' | 'warning'; 
    onClose: () => void 
}) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Ẩn sau 4 giây
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    const titleMap = {
        success: { text: "Thành công!", icon: "bi-check-circle-fill", bg: "#029e74", border: "#007d57" },
        danger: { text: "Lỗi!", icon: "bi-x-octagon-fill", bg: "#dc3545", border: "#b02a37" },
        warning: { text: "Cảnh báo!", icon: "bi-exclamation-triangle-fill", bg: "#ffc107", border: "#d9a400" },
    };
    const { text, icon, bg, border } = titleMap[variant];

    if (!show) return null;

    return (
        <div 
            style={{ 
                position: 'fixed', 
                top: '20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 1050, 
                transition: 'opacity 0.3s ease-in-out',
                maxWidth: '350px'
            }}
        >
            <Alert 
                variant={variant} 
                onClose={onClose} 
                dismissible 
                className="shadow-lg border-0"
                style={{ 
                    borderRadius: '0.75rem', 
                    background: bg, 
                    color: (variant === 'warning' ? '#333' : 'white'), 
                    border: `3px solid ${border}` 
                }}
            >
                <Alert.Heading style={{ fontSize: '1.1rem' }}>
                    <i className={`bi ${icon} me-2`}></i> {text}
                </Alert.Heading>
                <p className="mb-0 fw-semibold">{message}</p>
            </Alert>
        </div>
    );
};
// ===============================================


// ====== HOME PAGE ======
export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [keyword, setKeyword] = useState("");
  const [showCopiedCode, setShowCopiedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Trạng thái cho Notification
  const [notification, setNotification] = useState<{
    message: string;
    show: boolean;
    variant: 'success' | 'danger' | 'warning';
  }>({ message: '', show: false, variant: 'success' });

  const showNotification = (
    message: string,
    variant: 'success' | 'danger' | 'warning'
  ) => {
    setNotification({ message, show: true, variant });
  };
  
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);


  // Thay thế useRouter bằng hàm chuyển hướng fallback
  const router = {
    push: (path: string) => {
      // Sử dụng window.location.href để chuyển hướng trong môi trường sandboxed
      window.location.href = path;
    },
  };
  

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

  // handleAddToCart
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
      
      // Hiển thị thông báo Notification
      showNotification(
        `Sách "${book.ten_sach}" đã được thêm vào giỏ hàng.`,
        'success'
      );

    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      showNotification("Không thể thêm vào giỏ hàng. Thử lại sau!", 'danger');
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

  // handleBuyNow
  // handleBuyNow – PHIÊN BẢN HOÀN HẢO NHẤT, DÙNG CHUNG VỚI TRANG CHI TIẾT
const handleBuyNow = (book: Book) => {
  // 1. Kiểm tra đăng nhập
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    showNotification("Vui lòng đăng nhập để mua hàng!", 'warning');
    router.push("/auth/dangnhap");
    return;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!user?.id) {
      showNotification("Phiên đăng nhập không hợp lệ!", 'warning');
      router.push("/auth/dangnhap");
      return;
    }

    // 2. Tạo item mua ngay – giống hệt trang chi tiết
    const selectedItem = {
      id: book.sach_id,
      name: book.ten_sach,
      price: book.gia_sach - (book.gg_sach || 0),
      image: book.image || "/image/default-book.jpg",
      quantity: 1,
      stock: book.ton_kho_sach, // thêm stock để checkout kiểm tra
    };

    // 3. LƯU DƯỚI DẠNG MẢNG – DÙNG CHUNG VỚI GIỎ HÀNG
    localStorage.setItem("checkoutItems", JSON.stringify([selectedItem]));

    // 4. XÓA KEY CŨ ĐỂ TRÁNH NHẦM LẪN
    localStorage.removeItem("checkoutItem");
    localStorage.removeItem("cartItem");

    // 5. CHUYỂN HƯỚNG MƯỢT MÀ
    router.push("/checkout");

    // 6. THÔNG BÁO THÀNH CÔNG
    showNotification(`Đã chọn "${book.ten_sach}" để mua ngay!`, 'success');

  } catch (error) {
    console.error("Lỗi mua ngay:", error);
    showNotification("Có lỗi xảy ra, vui lòng thử lại!", 'danger');
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

   // Custom: hiển thị lại mã giảm giá vừa sao chép cho user – ĐÃ SỬA ĐẸP + TỰ TẮT 4S
    const handleCopyDiscount = async (ma_gg: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ma_gg);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = ma_gg;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedCode(ma_gg);
      setTimeout(() => setCopiedCode(null), 3000); // TỰ TẮT SAU 4 GIÂY

    } catch (err) {
      showNotification("Không thể sao chép mã!", "danger");
    }
  };

  // Hàm định dạng giá kiểu Việt Nam (chuẩn, bỏ .00)
  const formatVietnamesePrice = (price: number | string) => {
    const num =
      typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return "0đ";
    return (
      num.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ"
    );
  };

  // ========== UI ==========

  return (
    <>
      <Notification 
        message={notification.message} 
        show={notification.show} 
        variant={notification.variant}
        onClose={closeNotification} 
      />
      {copiedCode && (
  <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
    <div className="d-flex align-items-center shadow-lg rounded-4 px-4 py-3 text-white" style={{
      background: "linear-gradient(135deg, #10b981, #059669)",
      border: "4px solid #047857",
      minWidth: "360px"
    }}>
      <i className="bi bi-check-circle-fill fs-1 me-3"></i>
      <div>
        <div className="fw-bold">Đã sao chép!</div>
        <div className="fs-3 fw-black" style={{ letterSpacing: "3px" }}>{copiedCode}</div>
      </div>
    </div>
  </div>
)}
{/* ======== HEADER HIỆN ĐẠI ======== */}
<Container
  className="py-4 px-4 hero-bg" 
  style={{
    // Màu nền Container ngoài: Trắng Kem  Xanh Mint Nhạt
    background: "#ffd79e",
    borderRadius: "32px",
    marginTop: "32px",
    boxShadow: "0 12px 45px rgba(38,166,154,0.15)" 
  }}
>
  <Row className="align-items-center position-relative overflow-hidden">
  <div
    className="position-absolute top-0 start-0 w-100 h-100"
    style={{
      // Màu nền Hero bên trong: Xanh Mint Rất Nhạt Trắng Sáng
      background: "linear-gradient(120deg, #e6ffee 0%, #ffffff 50%, #f0fff4 100%)",
      zIndex: -1,
      borderRadius: "2.4rem",
      boxShadow: "inset 0 0 60px rgba(178, 255, 237, 0.4)",
    }}
  />

  {/* padding */}
  <Col xs={12} md={6} className="mb-4 mb-md-0 ps-4 pe-4">
    <h1
      className="fw-black mb-3"
      style={{
        fontSize: "2.5rem",
        lineHeight: "1.2",
        color: "#1f2937", 
      }}
    >
      Chào mừng đến<br />
      với <span style={{ color: "#FF0000", fontSize: "1.05em" }}>Pibbok</span> 
    </h1>

    <p
      className="lead"
      style={{
        color: "#475569", 
        fontSize: "1.1rem", 
        maxWidth: "480px",
        lineHeight: "1.6",
        fontWeight: "400", 
      }}
    >
      Nơi bạn có thể khám phá những cuốn sách hay nhất
      và tạo nên hành trình đọc thú vị mỗi ngày.
    </p>

  </Col>

  <Col xs={12} md={6} className="text-center text-md-end ps-4 pe-4">
    <div
      className="d-inline-block position-relative hero-banner overflow-hidden"
      style={{
        
        maxWidth: "380px", 
        borderRadius: "2.4rem", 
        
        border: "3px solid #34d399", 
        boxShadow: "0 15px 40px rgba(52, 211, 153, 0.3)", 
        transition: "all 0.4s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.01)"; 
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      <img
        
        src="/image/images (11).jpeg"
        alt="Pibbok - Nhà sách của bạn"
        style={{
          width: "100%",
          height: "300px", 
          objectFit: "cover",
          borderRadius: "2.2rem",
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
                    "08cca0755fa6c45fda26187053cf1f4d.jpg",
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
{/* ========= DANH MỤC SÁCH */}
<Container className="my-5">
  <div className="text-center mb-5">
    <h2
      className="fw-bold d-inline-block position-relative"
      style={{
        color: "#d97706",
        fontSize: "2.4rem",
        letterSpacing: "1px",
        textTransform: "uppercase",
      }}
    >
      Danh mục sách
    </h2>
    <div
      className="mx-auto mt-3"
      style={{
        width: 100,
        height: 5,
        background: "linear-gradient(90deg, #ff9800, #f97316)",
        borderRadius: 10,
      }}
    />
  </div>

  {categories.length > 0 ? (
    <Row className="justify-content-center g-4 g-lg-5">
      {categories.map((cat) => {
        // Ảnh mặc định đẹp cho từng loại (nếu backend chưa có ảnh riêng)
        const defaultImages: Record<string, string> = {
          "Văn học Việt Nam": "https://minhkhai.com.vn/hinhlon/134598.jpg",
          "Văn học nước ngoài": "https://vietbooks.info/attachments/upload_2021-10-21_23-11-1-png.2973",
          "Kỹ năng sống": "https://www.nxbtre.com.vn/Images/Book/nxbtre_full_12252023_032502.jpg",
          "Thiếu nhi": "https://www.nxbtre.com.vn/Images/Book/nxbtre_full_08032023_110309.jpg",
          "Truyện tranh": "https://product.hstatic.net/200000017360/product/my_chau_trong_thuy_bia_1_64fa291e8fc147f5869895d139169040_master.png",

        };

        // Ưu tiên ảnh từ backend  nếu hem có thì lấy ảnh mặc định theo tên loại
        const categoryImage =
          cat.hinh_anh && cat.hinh_anh !== ""
            ? cat.hinh_anh
            : defaultImages[cat.ten_loai] ||
              "https://images.unsplash.com/photo-1491841573335-63f8c3e453ce?w=800&q=80&fit=crop"; 

        return (
          <Col key={cat.loai_sach_id} xs={6} sm={4} md={3} lg={2}>
            <div
              role="button"
              onClick={() => router.push(`/category/${cat.loai_sach_id}`)}
              className="h-100 d-flex flex-column overflow-hidden rounded-4 shadow-sm bg-white position-relative"
              style={{
                cursor: "pointer",
                border: "3px solid transparent",
                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #ffd700, #ff8c00) border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-12px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 152, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
              }}
            >
              {/* Ảnh danh mục */}
              <div className="position-relative overflow-hidden" style={{ height: 140 }}>
                <img
                  src={categoryImage}
                  alt={cat.ten_loai}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                {/* Overlay khi hover */}
                <div
                  className="position-absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(transparent, rgba(0,0,0,0.15))",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                />
              </div>

              {/* Tên danh mục */}
              <div className="p-3 text-center flex-grow-1 d-flex align-items-center justify-content-center">
                <span
                  className="fw-bold text-dark"
                  style={{
                    fontSize: "1.05rem",
                    lineHeight: "1.4",
                    letterSpacing: "0.5px",
                  }}
                >
                  {cat.ten_loai}
                </span>
              </div>

              {/* Hiệu ứng viền vàng khi hover */}
              <div
                className="position-absolute inset-0 rounded-4 pointer-events-none"
                style={{
                  border: "3px solid #ffd700",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              />
            </div>
          </Col>
        );
      })}
    </Row>
  ) : (
    <div className="text-center py-5">
      <p className="text-muted fs-5">Đang tải danh mục sách...</p>
    </div>
  )}
</Container>

  {/* ========= MÃ GIẢM GIÁ nổi bật - HIỂN THỊ RÕ RÀNG ========= */}
  <Container className="my-5" style={{ 
        background: "linear-gradient(135deg, #f0fff4 0%, #e6ffee 100%)",
        borderRadius: "24px",
        padding: "32px 24px",
        border: "3px solid #ffd700",
        boxShadow: "0 8px 32px rgba(255, 215, 0, 0.25)"
      }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2" style={{
            color: "#FF0000",
            fontSize: "2rem",
            letterSpacing: ".05em",
            textShadow: "2px 2px 4px rgba(255, 215, 0, 0.3)"
          }}>
            MÃ GIẢM GIÁ 
          </h2>
          <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
            Sao chép mã và sử dụng ngay khi thanh toán để được giảm giá
          </p>
        </div>

        {/* Thông báo khi đã sao chép mã */}
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
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-8px) scale(1.03)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(255, 215, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
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

{/* SÁCH MỚI  */}
<Container className="mt-5 mb-5">
  <h2
    className="section-title mb-4 text-center fw-bold"
    style={{
      color: "#6b7280", 
      letterSpacing: ".04em",
    }}
  >
    Ưu đãi & Sách mới nổi bật
  </h2>

  <Row className="gy-4 align-items-stretch">
    
    {/* SÁCH GIẢM GIÁ */}
    <Col xs={12}>
      <h4
        className="fw-bold text-center mb-3"
        style={{ 
          letterSpacing: "0.02em",
          color: "#6b7280", 
        }}
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

            return (
              <Col
                key={`book-discount-${book.sach_id}-${index}`}
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
                    background: "#fcfcf0", 
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(-7px) scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
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
                  className="badge position-absolute top-0 end-0 m-2 text-white fw-bold"
                  style={{
                  fontSize: "0.9rem",
                  borderRadius: "12px",
                  padding: "8px 14px",
                  background: "linear-gradient(135deg, #ef4444, #f97316)", 
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.5)",
                  zIndex: 10,
                  letterSpacing: "0.5px",
              }}
              >
            {(() => {
             const discount = book.gg_sach || 0;
             const price = book.gia_sach || 0;
            if (price > 0) {
             const percent = Math.round((discount / price) * 100);
            if (percent >= 1 && percent < 100) {
             return `-${percent}%`;
            }
            }
            return `-${formatVietnamesePrice(Math.round(discount))}`;
          })()}
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
                      className="mb-2 fw-medium"
                      style={{ fontSize: ".98rem" }}
                    >
                      <p className="mb-3 fw-semibold" style={{ color: "#059669", fontSize: "1rem" }}>
                      {book.ten_tac_gia}
                  </p>
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

                    <div className="d-flex justify-content-center gap-2 mt-auto">
                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#93c5fd", 
                            borderColor: "#60a5fa",
                            color: "#1e40af", 
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Xem Chi Tiết"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${book.sach_id}`);
                        }}
                      >
                        <i className="bi bi-search fs-5"></i>
                      </Button>

                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#fcd34d", 
                            borderColor: "#fbbf24",
                            color: "#92400e", 
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Mua Ngay"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(book);
                        }}
                      >
                        <i className="bi bi-lightning-fill fs-5"></i>
                      </Button>

                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#6ee7b7", 
                            borderColor: "#34d399",
                            color: "#047857", 
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Thêm Vào Giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                      >
                        <i className="bi bi-cart-plus-fill fs-5"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p className="text-center text-muted">
            Không có sách giảm giá nào để hiển thị
          </p>
        )}
      </Row>
    </Col>

  <hr className="my-5" />

    {/* SÁCH MỚI NỔI BẬT */}
    <Col xs={12}>
      <h4
        className="fw-bold text-center mb-3"
        style={{ 
          letterSpacing: "0.02em",
          color: "#6b7280", 
        }}
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

            return (
              <Col
                key={`book-new-${book.sach_id}-${index}`}
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
                    background: "#fcfcf0", 
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(-7px) scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
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
                    className="badge position-absolute top-0 end-0 m-2 text-white fw-bold"
                    style={{
                    fontSize: "0.9rem",
                    borderRadius: "12px",
                    padding: "8px 14px",
                    background: "linear-gradient(135deg, #ef4444, #f97316)", 
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.5)",
                    zIndex: 10,
                    letterSpacing: "0.5px",
                }}
                >
                {(() => {
                   const discount = book.gg_sach || 0;
                   const price = book.gia_sach || 0; 
                if (price > 0 && discount > 0) {
                    const discountPercentage = Math.round((discount / price) * 100);
                    if (discountPercentage >= 1 && discountPercentage < 100) {
                      return `-${discountPercentage}%`;
                    }
                }
                if (discount > 0) {
                    return `-${formatVietnamesePrice(Math.round(discount))}`;
                }
                return ""; 
                })()}
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
                    <p className="mb-3 fw-semibold" style={{ color: "#059669", fontSize: "1rem" }}>
                     {book.ten_tac_gia}
                    </p>
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

                    <div className="d-flex justify-content-center gap-2 mt-auto">
                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#93c5fd", 
                            borderColor: "#60a5fa",
                            color: "#1e40af", 
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Xem Chi Tiết"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${book.sach_id}`);
                        }}
                      >
                        <i className="bi bi-search fs-5"></i>
                      </Button>

                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#fcd34d", 
                            borderColor: "#fbbf24",
                            color: "#92400e",
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Mua Ngay"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(book);
                        }}
                      >
                        <i className="bi bi-lightning-fill fs-5"></i>
                      </Button>

                      <Button
                        style={{ 
                            borderRadius: "10px", 
                            flexGrow: 1, 
                            background: "#6ee7b7", 
                            borderColor: "#34d399",
                            color: "#047857", 
                        }}
                        className="fw-bold p-2 hover-shadow-sm border-0"
                        title="Thêm Vào Giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book);
                        }}
                      >
                        <i className="bi bi-cart-plus-fill fs-5"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p className="text-center text-muted">
            Không có sách mới nào để hiển thị
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
    {/* Bổ sung CDN cho Bootstrap CSS và JS  loại bỏ integrity và crossOrigin */}
    <link 
      rel="stylesheet" 
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
    />
    <script 
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
    ></script>
    {/* Import Bootstrap Icons CSS cho các icon */}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
    </>
  );
}