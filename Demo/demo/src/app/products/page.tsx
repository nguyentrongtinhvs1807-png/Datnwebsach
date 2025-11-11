"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ICONS (FontAwesome)
import { FaSearch } from "react-icons/fa";

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

export default function ProductList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  // Filter states
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedBookTypes, setSelectedBookTypes] = useState<string[]>([]);

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

  // Get unique values for filters
  const uniqueAuthors = Array.from(new Set(books.map(b => b.ten_tac_gia).filter(Boolean))).sort();
  const uniquePublishers = Array.from(new Set(books.map(b => b.ten_NXB).filter(Boolean))).sort();
  const uniqueBookTypes = Array.from(new Set(books.map(b => b.loai_bia).filter(Boolean))).sort();
  // Supplier is fixed as "Pibbok" based on user requirement
  const suppliers = ["Pibbok"];

  // Handle filter changes
  const handleAuthorChange = (author: string) => {
    setSelectedAuthors(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author)
        : [...prev, author]
    );
  };

  const handlePublisherChange = (publisher: string) => {
    setSelectedPublishers(prev => 
      prev.includes(publisher) 
        ? prev.filter(p => p !== publisher)
        : [...prev, publisher]
    );
  };

  const handleSupplierChange = (supplier: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplier) 
        ? prev.filter(s => s !== supplier)
        : [...prev, supplier]
    );
  };

  const handleBookTypeChange = (bookType: string) => {
    setSelectedBookTypes(prev => 
      prev.includes(bookType) 
        ? prev.filter(b => b !== bookType)
        : [...prev, bookType]
    );
  };

  // Apply filters
  const filteredBooks = books
    .filter((b) => {
      // Search filter
      const matchesSearch = 
        b.ten_sach.toLowerCase().includes(search.toLowerCase()) ||
        b.ten_tac_gia.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      // Author filter
      if (selectedAuthors.length > 0 && !selectedAuthors.includes(b.ten_tac_gia)) {
        return false;
      }

      // Publisher filter
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(b.ten_NXB)) {
        return false;
      }

      // Supplier filter (Pibbok - fixed, if selected, show all books as all books are from Pibbok)
      // Since supplier is fixed as "Pibbok", this filter doesn't actually filter anything
      // but we keep it for UI consistency
      if (selectedSuppliers.length > 0 && !selectedSuppliers.includes("Pibbok")) {
        // If Pibbok is not selected but supplier filter is active, hide all (shouldn't happen)
        return false;
      }

      // Book type filter
      if (selectedBookTypes.length > 0 && !selectedBookTypes.includes(b.loai_bia)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.gia_sach - b.gia_sach;
      if (sortOrder === "desc") return b.gia_sach - a.gia_sach;
      return 0;
    });

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  const formatPrice = (price: number) =>
    Math.round(price).toLocaleString("vi-VN") + "₫";

  return (
    <div
      className="container py-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      }}
    >
      {/* HEADER */}
      <div className="mb-5 text-center">
        <h1
          className="fw-bold mb-2"
          style={{
            letterSpacing: 2,
            fontSize: "2.8rem",
            color: "#d35400",
            textShadow: "2px 4px 10px rgba(241,196,15,0.09)"
          }}
        >
          Khám Phá Kho Sách
        </h1>
        <p className="lead" style={{color:"#616161", maxWidth: 600, margin: "0 auto"}}>
          Nơi hội tụ những cuốn sách, tri thức và cảm hứng bất tận dành cho bạn!
        </p>
      </div>

      {/* Bộ lọc + Sắp xếp */}
      <div className="card p-4 mb-4 shadow-lg border-0" style={{
        borderRadius: "28px",
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(2px)"
      }}>
        <div className="row g-3 justify-content-center align-items-center">
          {/* Tìm kiếm */}
          <div className="col-md-6">
            <div className="input-group shadow-sm" style={{borderRadius:"30px"}}>
              <span className="input-group-text bg-white border-0" style={{borderRadius:"30px 0 0 30px", fontSize:"1.4rem", color:"#f39c12"}}>
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Tìm sách hoặc tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control border-0"
                style={{
                  borderRadius: "0 30px 30px 0",
                  fontSize: "1.1rem",
                  background: "#fafafa"
                }}
              />
            </div>
          </div>
          {/* Sắp xếp */}
          <div className="col-md-3">
            <div style={{position: "relative"}}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-select shadow-sm"
                style={{
                  borderRadius: "30px",
                  padding: "10px 38px 10px 16px",
                  border: "1.7px solid #f9bf3b",
                }}
              >
                <option value="">-- Sắp xếp theo giá --</option>
                <option value="asc">Giá tăng dần</option>
                <option value="desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc và Danh sách sách */}
      <div className="row gx-4">
        {/* Sidebar Filter */}
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="card border-0 shadow-lg" style={{
            borderRadius: "20px",
            background: "rgba(255,255,255,0.98)",
            position: "sticky",
            top: "20px"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-center" style={{ color: "#d35400", fontSize: "1.3rem" }}>
                Bộ Lọc
              </h5>

              {/* Tác giả */}
              <div className="mb-4" style={{ borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#333", textTransform: "uppercase" }}>
                  Tác giả
                </h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {uniqueAuthors.map((author) => (
                    <div key={author} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`author-${author}`}
                        checked={selectedAuthors.includes(author)}
                        onChange={() => handleAuthorChange(author)}
                        style={{ cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`author-${author}`}
                        style={{ cursor: "pointer", fontSize: "0.95rem" }}
                      >
                        {author}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhà xuất bản */}
              <div className="mb-4" style={{ borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#333", textTransform: "uppercase" }}>
                  Nhà xuất bản
                </h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {uniquePublishers.map((publisher) => (
                    <div key={publisher} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`publisher-${publisher}`}
                        checked={selectedPublishers.includes(publisher)}
                        onChange={() => handlePublisherChange(publisher)}
                        style={{ cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`publisher-${publisher}`}
                        style={{ cursor: "pointer", fontSize: "0.95rem" }}
                      >
                        {publisher}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhà cung cấp */}
              <div className="mb-4" style={{ borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#333", textTransform: "uppercase" }}>
                  Nhà cung cấp
                </h6>
                <div>
                  {suppliers.map((supplier) => (
                    <div key={supplier} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`supplier-${supplier}`}
                        checked={selectedSuppliers.includes(supplier)}
                        onChange={() => handleSupplierChange(supplier)}
                        style={{ cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`supplier-${supplier}`}
                        style={{ cursor: "pointer", fontSize: "0.95rem" }}
                      >
                        {supplier}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loại bìa */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#333", textTransform: "uppercase" }}>
                  Loại bìa
                </h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {uniqueBookTypes.map((bookType) => (
                    <div key={bookType} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`bookType-${bookType}`}
                        checked={selectedBookTypes.includes(bookType)}
                        onChange={() => handleBookTypeChange(bookType)}
                        style={{ cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`bookType-${bookType}`}
                        style={{ cursor: "pointer", fontSize: "0.95rem" }}
                      >
                        {bookType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút reset filter */}
              {(selectedAuthors.length > 0 || selectedPublishers.length > 0 || 
                selectedSuppliers.length > 0 || selectedBookTypes.length > 0) && (
                <button
                  className="btn w-100 mt-3"
                  onClick={() => {
                    setSelectedAuthors([]);
                    setSelectedPublishers([]);
                    setSelectedSuppliers([]);
                    setSelectedBookTypes([]);
                  }}
                  style={{
                    borderRadius: "20px",
                    background: "linear-gradient(90deg, #f7ca57, #efb14e)",
                    border: "none",
                    color: "white",
                    fontWeight: 600,
                    padding: "10px"
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Danh sách sách */}
        <div className="col-lg-9 col-md-8">
      <div className="row gx-4 gy-5">
        {visibleBooks.map((b) => (
          <div className="col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch" key={b.sach_id}>
            <div
              className="card border-0 shadow-lg position-relative product-card d-flex flex-column w-100"
              style={{
                borderRadius: "22px",
                height: "480px",
                background: "linear-gradient(120deg,#fffbe8 80%,#fff6e9 100%)",
                overflow: "hidden",
                transition: "transform 0.24s cubic-bezier(.2,.68,.37,.98), box-shadow 0.22s"
              }}
            >
              {/* Deal Ribbon */}
              {b.gg_sach > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "-25px",
                    background: "linear-gradient(90deg, #f79c43, #f1c40f)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "4px 40px",
                    transform: "rotate(-23deg)",
                    boxShadow: "0 4px 18px #f1c40f70",
                    zIndex: 2,
                    letterSpacing: 2
                  }}
                >
                  ƯU ĐÃI
                </div>
              )}

              {/* Hình ảnh */}
              <div
                style={{
                  width: "100%",
                  height: "240px",
                  minHeight: "240px",
                  background: "linear-gradient(135deg, #f5f6fa 65%, #e5ecfa 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopLeftRadius: "22px",
                  borderTopRightRadius: "22px",
                  transition: "background 0.23s",
                  flexShrink: 0
                }}
              >
                <img
                  src={b.image || "/image/default-book.jpg"}
                  alt={b.ten_sach}
                  style={{
                    maxHeight: "96%",
                    maxWidth: "70%",
                    objectFit: "contain",
                    filter: b.ton_kho_sach === 0 ? "grayscale(90%) opacity(0.7)" : "none",
                    transition: "filter 0.25s"
                  }}
                />
              </div>
              <div className="card-body text-center px-3 py-3 d-flex flex-column justify-content-between flex-grow-1" style={{flexGrow: 1}}>
                <div>
                  <h6 className="fw-bold mb-1 text-truncate" title={b.ten_sach}
                    style={{fontSize: "1.09rem", color: "#222", minHeight: 32}}
                  >
                    {b.ten_sach}
                  </h6>
                  <p className="fw-medium mb-1 text-secondary text-truncate" style={{fontSize: "0.96rem"}} title={b.ten_tac_gia}>
                    {b.ten_tac_gia}
                  </p>
                </div>

                {/* Giá sách */}
                <div>
                  {b.gg_sach > 0 ? (
                    <div className="mb-1">
                      <span className="text-decoration-line-through text-muted small me-1">
                        {formatPrice(b.gia_sach)}
                      </span>
                      <span
                        className="fw-bold fs-5 text-danger"
                        style={{letterSpacing:0.5}}
                      >
                        {formatPrice(b.gia_sach - b.gg_sach)}
                      </span>
                      <span
                        className="badge bg-success ms-2"
                        style={{ fontSize: "0.85rem", fontWeight: 500 }}
                      >
                        -{Math.round((b.gg_sach / b.gia_sach) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <div className="mb-1">
                      <span className="fw-bold fs-5 text-danger">
                        {formatPrice(b.gia_sach)}
                      </span>
                    </div>
                  )}
                  {b.ton_kho_sach === 0 && (
                    <div className="badge bg-danger mb-2" style={{background:'#dc3545cc'}}>Hết hàng</div>
                  )}
                </div>
                {/* Nút xem chi tiết */}
                <div className="d-flex flex-column gap-2 mt-2">
  <Link
    href={`/products/${b.sach_id}`}
    className="btn d-inline-flex align-items-center justify-content-center fw-bold shadow-sm"
    style={{
      borderRadius: "30px",
      background: "linear-gradient(90deg,#f7ca57 20%,#efb14e 100%)",
      border: "none",
      color: "#fff",
      fontSize: "1.05rem",
      minHeight: "38px",
      boxShadow: "0 2px 8px #f5c96b21"
    }}
  >
    Xem chi tiết
  </Link>

  <button
    onClick={() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((item: Book) => item.sach_id === b.sach_id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ ...b, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`🛒 Đã thêm "${b.ten_sach}" vào giỏ hàng!`);
    }}
    className="btn fw-bold shadow-sm"
    style={{
      borderRadius: "30px",
      background: "linear-gradient(90deg,#58d68d,#28b463)",
      border: "none",
      color: "white",
      fontSize: "1.05rem",
      minHeight: "38px"
    }}
  >
    Thêm vào giỏ hàng
  </button>

  <button
    onClick={() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((item: Book) => item.sach_id === b.sach_id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ ...b, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.location.href = "/cart"; // ✅ chuyển sang trang giỏ hàng
    }}
    className="btn fw-bold shadow-sm"
    style={{
      borderRadius: "30px",
      background: "linear-gradient(90deg,#f06292,#e84393)",
      border: "none",
      color: "white",
      fontSize: "1.05rem",
      minHeight: "38px"
    }}
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
            <img
              src="/image/no-books.svg"
              alt="Không có sách"
              style={{ width: 130, opacity: 0.65 }}
            />
            <p className="text-muted mt-3 fs-5">Không có sách nào phù hợp với tìm kiếm của bạn.</p>
          </div>
        )}
      </div>

      {/*  Nút "Xem thêm" */}
      {visibleCount < filteredBooks.length && (
        <div className="text-center mt-4">
          <button
            className="btn btn-lg py-2 px-5 fw-bold shadow-lg"
            style={{
              borderRadius: "40px",
              background: "linear-gradient(90deg, #f7ca57, #efb14e)",
              border: "none",
              color: "white",
              fontSize: "1.15rem",
              letterSpacing: 0.7,
              boxShadow: "0 2px 15px #f1c40f44"
            }}
            onClick={() => setVisibleCount((prev) => prev + 8)}
          >
            Xem thêm sách
          </button>
        </div>
      )}
        </div>
      </div>

      {/* Trang trí CSS nhỏ cho hover sản phẩm */}
      <style>{`
        .product-card:hover {
          transform: translateY(-9px) scale(1.024);
          box-shadow: 0 12px 38px #f7ca5749;
          border-color: #f7ca57 !important;
        }
        .product-card:hover img {
          filter: saturate(115%) drop-shadow(0 4px 12px #f9c86538);
        }
      `}</style>
    </div>
  );
}
