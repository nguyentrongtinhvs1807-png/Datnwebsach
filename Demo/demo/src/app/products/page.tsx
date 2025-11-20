"use client";

import { useEffect, useState } from "react";
// Đã thay thế Link của Next.js bằng thẻ <a> HTML tiêu chuẩn
// Đã thay thế useRouter bằng window.location.href (để mô phỏng định tuyến)
// Đã thay thế FaSearch bằng SVG nội tuyến

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
  image?: string | null;
}

// Dữ liệu chuẩn cho cart/checkout
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ProductList() {
  // Loại bỏ useRouter do không khả dụng trong môi trường này
  // const router = useRouter(); 

  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  // Bộ lọc
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedBookTypes, setSelectedBookTypes] = useState<string[]>([]);

  // Gọi API
  useEffect(() => {
    fetch("http://localhost:3003/books")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const uniqueBooks = Array.from(
            new Map(data.map((b: any) => [b.sach_id, b])).values()
          ) as Book[];
          setBooks(uniqueBooks);
        } else {
          console.error("❌ API /books không trả về mảng hợp lệ:", data);
          setBooks([]);
        }
      })
      .catch((err) => console.error("❌ Lỗi khi gọi API:", err));
  }, []);

  const uniqueAuthors = Array.from(new Set(books.map((b) => b.ten_tac_gia).filter(Boolean))).sort();
  const uniquePublishers = Array.from(new Set(books.map((b) => b.ten_NXB).filter(Boolean))).sort();
  const uniqueBookTypes = Array.from(new Set(books.map((b) => b.loai_bia).filter(Boolean))).sort();
  const suppliers = ["Pibbok"];

  const toggleFilter = (setter: Function, current: string[], value: string) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const filteredBooks = books
    .filter((b) => {
      const matchesSearch =
        b.ten_sach.toLowerCase().includes(search.toLowerCase()) ||
        b.ten_tac_gia.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedAuthors.length > 0 && !selectedAuthors.includes(b.ten_tac_gia)) return false;
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(b.ten_NXB)) return false;
      if (selectedBookTypes.length > 0 && !selectedBookTypes.includes(b.loai_bia)) return false;
      if (selectedSuppliers.length > 0 && !selectedSuppliers.includes("Pibbok")) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.gia_sach - b.gia_sach;
      if (sortOrder === "desc") return b.gia_sach - a.gia_sach;
      return 0;
    });

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  const formatPrice = (price: number) => Math.round(price).toLocaleString("vi-VN") + "₫";

  // 🔧 Chuẩn hóa dữ liệu sản phẩm để lưu vào cart/checkout
  const normalizeBook = (b: Book): CartItem => {
    const gia = Number(b.gia_sach) || 0;
    const giam = Number(b.gg_sach) || 0;
    const price = Math.max(gia - giam, 0);
    return {
      id: b.sach_id.toString(),
      name: b.ten_sach,
      price,
      image: b.image || "/image/default-book.jpg",
      quantity: 1,
    };
  };

  // 🛒 Thêm vào giỏ hàng (ĐÃ CHỈNH SỬA)
  const handleAddToCart = (b: Book) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === b.sach_id.toString());
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(normalizeBook(b));
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // **QUAN TRỌNG:** Xóa thông tin mua ngay (checkoutItem)
    // để đảm bảo trang checkout sẽ lấy dữ liệu từ giỏ hàng (cart)
    localStorage.removeItem("checkoutItem"); 
    
    // Thay alert bằng thông báo không chặn (Non-blocking notification)
    const notification = document.createElement('div');
    notification.textContent = `✅ Đã thêm "${b.ten_sach}" vào giỏ hàng!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        font-weight: bold;
        transition: opacity 0.5s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
    
    // Gửi sự kiện cập nhật giỏ hàng để Header cập nhật huy hiệu
    window.dispatchEvent(new Event('cart-update'));
  };

  // ⚡ Mua ngay
  const handleBuyNow = (b: Book) => {
    const checkoutItem = [normalizeBook(b)];
    localStorage.setItem("checkoutItem", JSON.stringify(checkoutItem));
    // Thay thế router.push bằng cách gán URL
    window.location.href = "/checkout";
  };

  return (
    <div className="container py-5" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" }}>
      {/* HEADER */}
      <div className="mb-5 text-center">
        <h1 className="fw-bold mb-2" style={{ letterSpacing: 2, fontSize: "2.8rem", color: "#d35400", textShadow: "2px 4px 10px rgba(241,196,15,0.09)" }}>
          Khám Phá Kho Sách
        </h1>
        <p className="lead" style={{ color: "#616161", maxWidth: 600, margin: "0 auto" }}>
          Nơi hội tụ những cuốn sách, tri thức và cảm hứng bất tận dành cho bạn!
        </p>
      </div>

      {/* Thanh tìm kiếm + sắp xếp */}
      <div className="card p-4 mb-4 shadow-lg border-0" style={{ borderRadius: "28px", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(2px)" }}>
        <div className="row g-3 justify-content-center align-items-center">
          <div className="col-md-6">
            <div className="input-group shadow-sm" style={{ borderRadius: "30px" }}>
              {/* Thay thế FaSearch bằng SVG nội tuyến */}
              <span className="input-group-text bg-white border-0" style={{ borderRadius: "30px 0 0 30px", fontSize: "1.4rem", color: "#f39c12" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.1-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
              </span>
              <input
                type="text"
                placeholder="Tìm sách hoặc tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control border-0"
                style={{ borderRadius: "0 30px 30px 0", fontSize: "1.1rem", background: "#fafafa" }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select shadow-sm"
              style={{ borderRadius: "30px", border: "1.7px solid #f9bf3b" }}
            >
              <option value="">-- Sắp xếp theo giá --</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row gx-4 gy-5">
        {/* Cột lọc */}
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="card border-0 shadow-lg" style={{ borderRadius: "20px", background: "rgba(255,255,255,0.98)", position: "sticky", top: "20px" }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-center" style={{ color: "#d35400" }}>Bộ Lọc</h5>

              {/* Tác giả */}
              <div className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold mb-2">Tác giả</h6>
                {uniqueAuthors.slice(0, 5).map((a) => (
                  <div key={a} className="form-check mb-1">
                    <input className="form-check-input" type="checkbox" checked={selectedAuthors.includes(a)} onChange={() => toggleFilter(setSelectedAuthors, selectedAuthors, a)} />
                    <label className="form-check-label">{a}</label>
                  </div>
                ))}
              </div>

              {/* Nhà xuất bản */}
              <div className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold mb-2">Nhà xuất bản</h6>
                {uniquePublishers.slice(0, 5).map((p) => (
                  <div key={p} className="form-check mb-1">
                    <input className="form-check-input" type="checkbox" checked={selectedPublishers.includes(p)} onChange={() => toggleFilter(setSelectedPublishers, selectedPublishers, p)} />
                    <label className="form-check-label">{p}</label>
                  </div>
                ))}
              </div>

              {/* Loại bìa */}
              <div className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold mb-2">Loại bìa</h6>
                {uniqueBookTypes.map((t) => (
                  <div key={t} className="form-check mb-1">
                    <input className="form-check-input" type="checkbox" checked={selectedBookTypes.includes(t)} onChange={() => toggleFilter(setSelectedBookTypes, selectedBookTypes, t)} />
                    <label className="form-check-label">{t}</label>
                  </div>
                ))}
              </div>

              {/* Nhà cung cấp */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Nhà cung cấp</h6>
                {suppliers.map((s) => (
                  <div key={s} className="form-check mb-1">
                    <input className="form-check-input" type="checkbox" checked={selectedSuppliers.includes(s)} onChange={() => toggleFilter(setSelectedSuppliers, selectedSuppliers, s)} />
                    <label className="form-check-label">{s}</label>
                  </div>
                ))}
              </div>

              {(selectedAuthors.length || selectedPublishers.length || selectedBookTypes.length || selectedSuppliers.length) > 0 && (
                <button className="btn btn-warning w-100 fw-bold" onClick={() => {
                  setSelectedAuthors([]);
                  setSelectedPublishers([]);
                  setSelectedBookTypes([]);
                  setSelectedSuppliers([]);
                }} style={{ borderRadius: "30px" }}>Xóa bộ lọc</button>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách sách */}
        <div className="col-lg-9 col-md-8">
          <div className="row gx-4 gy-5">
            {visibleBooks.map((b) => (
              <div className="col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch" key={b.sach_id}>
                <div className="card border-0 shadow-lg position-relative product-card d-flex flex-column w-100" style={{ borderRadius: "22px", minHeight: "520px", background: "linear-gradient(120deg,#fffbe8 80%,#fff6e9 100%)", overflow: "visible", transition: "transform 0.24s cubic-bezier(.2,.68,.37,.98), box-shadow 0.22s" }}>
                  
                  {/* Ưu đãi */}
                  {b.gg_sach > 0 && (
                    <div style={{ position: "absolute", top: "16px", left: "-25px", background: "linear-gradient(90deg, #f79c43, #f1c40f)", color: "white", fontWeight: 700, fontSize: "0.85rem", padding: "4px 40px", transform: "rotate(-23deg)", boxShadow: "0 4px 18px #f1c40f70", zIndex: 2 }}>ƯU ĐÃI</div>
                  )}

                  {/* Hình ảnh (ĐÃ BIẾN THÀNH THẺ <a> HTML) */}
                  <a href={`/products/${b.sach_id}`} style={{ 
                      width: "100%", 
                      height: "240px", 
                      background: "linear-gradient(135deg, #f5f6fa 65%, #e5ecfa 100%)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      borderTopLeftRadius: "22px", 
                      borderTopRightRadius: "22px",
                      cursor: "pointer", // Thêm cursor pointer để người dùng nhận biết được là link
                      textDecoration: "none"
                  }}>
                    <img src={b.image || "/image/default-book.jpg"} alt={b.ten_sach} style={{ maxHeight: "96%", maxWidth: "70%", objectFit: "contain" }} />
                  </a>
                  {/* END Hình ảnh */}

                  {/* Nội dung */}
                  <div className="card-body text-center px-3 py-3 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <h6 className="fw-bold mb-1 text-truncate">{b.ten_sach}</h6>
                      <p className="fw-medium mb-1 text-secondary text-truncate">{b.ten_tac_gia}</p>
                    </div>

                    {/* Giá */}
                    <div>
                      {b.gg_sach > 0 ? (
                        <div className="mb-1">
                          <span className="text-decoration-line-through text-muted small me-1">{formatPrice(b.gia_sach)}</span>
                          <span className="fw-bold fs-5 text-danger">{formatPrice(b.gia_sach - b.gg_sach)}</span>
                        </div>
                      ) : (
                        <div className="mb-1"><span className="fw-bold fs-5 text-danger">{formatPrice(b.gia_sach)}</span></div>
                      )}
                    </div>

                    {/* Nút */}
                    <div className="d-flex flex-column gap-2 mt-2">
                      {/* Thay thế Link bằng <a> */}
                      <a href={`/products/${b.sach_id}`} className="btn fw-bold shadow-sm" style={{ borderRadius: "30px", background: "linear-gradient(90deg,#f7ca57 20%,#efb14e 100%)", border: "none", color: "white" }}>Xem chi tiết</a>

                      <button
                        onClick={() => handleAddToCart(b)}
                        className="btn fw-bold shadow-sm"
                        style={{ borderRadius: "30px", background: "linear-gradient(90deg,#58d68d,#28b463)", border: "none", color: "white" }}
                      >
                        Thêm vào giỏ hàng
                      </button>

                      <button
                        onClick={() => handleBuyNow(b)}
                        className="btn fw-bold shadow-sm"
                        style={{ borderRadius: "30px", background: "linear-gradient(90deg,#f06292,#e84393)", border: "none", color: "white" }}
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {visibleBooks.length === 0 && (
              <div className="col-12 text-center mt-5 py-5">
                <p className="text-muted fs-5">Không có sách nào phù hợp với tìm kiếm hoặc bộ lọc của bạn.</p>
              </div>
            )}
          </div>

          {visibleCount < filteredBooks.length && (
            <div className="text-center mt-4">
              <button
                className="btn btn-lg py-2 px-5 fw-bold shadow-lg"
                style={{ borderRadius: "40px", background: "linear-gradient(90deg, #f7ca57, #efb14e)", border: "none", color: "white" }}
                onClick={() => setVisibleCount((prev) => prev + 8)}
              >
                Xem thêm sách
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-9px) scale(1.024);
          box-shadow: 0 12px 38px #f7ca5749;
        }
      `}</style>
    </div>
  );
}