"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  an_hien?: number;
}

const PRODUCTS_PER_PAGE = 12;

const buttonBaseStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "10px",
  border: "none",
  padding: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 1,
};

const viewButtonStyle = {
  ...buttonBaseStyle,
  background: "#93c5fd",
  color: "#1e40af",
};

const buyButtonStyle = {
  ...buttonBaseStyle,
  background: "#fcd34d",
  color: "#92400e",
};

const cartButtonStyle = {
  ...buttonBaseStyle,
  background: "#6ee7b7",
  color: "#047857",
};

export default function ProductList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Bộ lọc
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedBookTypes, setSelectedBookTypes] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const savedQuery = sessionStorage.getItem("searchQueryFromHeader");
    if (savedQuery) {
      setSearch(savedQuery);
      sessionStorage.removeItem("searchQueryFromHeader");
    }

    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q");
    if (urlQuery) setSearch(decodeURIComponent(urlQuery));

    fetch("http://localhost:3003/books")
      .then((res) => res.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map((b: any) => [b.sach_id, b])).values()) as Book[];
          const visibleBooks = unique.filter(book => book.an_hien !== 0);
          setBooks(visibleBooks);
        }
      })
      .catch((err) => console.error(err));

    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedAuthors, selectedPublishers, selectedBookTypes, sortOrder]);

  const uniqueAuthors = Array.from(new Set(books.map((b) => b.ten_tac_gia))).sort();
  const uniquePublishers = Array.from(new Set(books.map((b) => b.ten_NXB))).sort();
  const uniqueBookTypes = Array.from(new Set(books.map((b) => b.loai_bia))).sort();

  const toggleFilter = (setter: Function, arr: string[], val: string) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filteredBooks = books
    .filter((b) => {
      const matchSearch =
        b.ten_sach.toLowerCase().includes(search.toLowerCase()) ||
        b.ten_tac_gia.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedAuthors.length && !selectedAuthors.includes(b.ten_tac_gia)) return false;
      if (selectedPublishers.length && !selectedPublishers.includes(b.ten_NXB)) return false;
      if (selectedBookTypes.length && !selectedBookTypes.includes(b.loai_bia)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.gia_sach - b.gia_sach;
      if (sortOrder === "desc") return b.gia_sach - a.gia_sach;
      return 0;
    });

  const totalPages = Math.ceil(filteredBooks.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const visibleBooks = filteredBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) => Math.round(price).toLocaleString("vi-VN") + "đ";

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxPageDisplay = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageDisplay / 2));
    let endPage = Math.min(totalPages, startPage + maxPageDisplay - 1);

    if (endPage - startPage + 1 < maxPageDisplay) {
      startPage = Math.max(1, endPage - maxPageDisplay + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <a
            className="page-link shadow-sm fw-bold"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              background: i === currentPage ? "#fcd34d" : "#fff",
              borderColor: i === currentPage ? "#fcd34d" : "#dee2e6",
              color: i === currentPage ? "#92400e" : "#000",
            }}
          >
            {i}
          </a>
        </li>
      );
    }

    return (
      <nav aria-label="Product Page Navigation" className="mt-5">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>

          {items}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#" aria-label="Next" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  // === THÊM VÀO GIỎ HÀNG (KHÔNG CẦN ĐĂNG NHẬP) ===
  const handleAddToCart = (book: Book) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const exist = cart.find((x: any) => x.id === book.sach_id.toString());

      if (exist) exist.quantity += 1;
      else {
        cart.push({
          id: book.sach_id.toString(),
          name: book.ten_sach,
          price: book.gia_sach - book.gg_sach,
          image: book.image || "/image/default-book.jpg",
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-update"));

      // Notification đẹp
      const toast = document.createElement("div");
      toast.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Đã thêm <strong>"${book.ten_sach}"</strong> vào giỏ hàng!`;
      Object.assign(toast.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "white",
        padding: "16px 24px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 9999,
        fontWeight: "bold",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        animation: "slideIn 0.4s ease",
      });
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 500);
      }, 2500);
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
    }
  };

  // === MUA NGAY – BẮT BUỘC ĐĂNG NHẬP ===
  const handleBuyNow = (book: Book) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // Chưa đăng nhập → thông báo + chuyển sang đăng nhập
      const toast = document.createElement("div");
      toast.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Vui lòng đăng nhập để mua ngay!</strong>`;
      Object.assign(toast.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        color: "white",
        padding: "16px 32px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 9999,
        fontWeight: "bold",
        fontSize: "1.1rem",
        textAlign: "center",
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      router.push("/auth/dangnhap");
      return;
    }

    // Đã đăng nhập → cho mua ngay
    try {
      const item = {
        id: book.sach_id.toString(),
        name: book.ten_sach,
        price: book.gia_sach - book.gg_sach,
        image: book.image || "/image/default-book.jpg",
        quantity: 1,
      };
      localStorage.setItem("checkoutItems", JSON.stringify([item]));
      router.push("/checkout");
    } catch (error) {
      console.error("Lỗi mua ngay:", error);
    }
  };

  return (
    <>
      <div className="container py-5" style={{ background: "linear-gradient(135deg, #fff8e1 0%, #fed7aa 100%)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="text-center mb-5 pt-4">
          <h1 className="fw-bold display-5" style={{ color: "#d97706" }}>
            Kho Sách Pibbok – Nơi Khởi Đầu Của Thành Công
          </h1>
        </div>

        {/* Tìm kiếm + Sắp xếp */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="input-group shadow-lg" style={{ borderRadius: "50px", overflow: "hidden" }}>
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search text-warning fs-4"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 py-3 fs-5"
                placeholder="Tìm tên sách, tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ boxShadow: "none" }}
              />
            </div>
          </div>
          <div className="col-lg-3 mt-3 mt-lg-0">
            <select
              className="form-select form-select-lg shadow py-3"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ borderRadius: "30px" }}
            >
              <option value="">Sắp xếp theo giá</option>
              <option value="asc">Thấp đến Cao</option>
              <option value="desc">Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <div className="row g-4">
          {/* Bộ lọc bên trái */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-lg sticky-top" style={{ top: "20px", borderRadius: "20px" }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-center mb-4 text-warning">Bộ Lọc</h5>

                {["Tác giả", "Nhà xuất bản", "Loại bìa"].map((title, i) => {
                  const data = i === 0 ? uniqueAuthors : i === 1 ? uniquePublishers : uniqueBookTypes;
                  const setter = i === 0 ? setSelectedAuthors : i === 1 ? setSelectedPublishers : setSelectedBookTypes;
                  const selected = i === 0 ? selectedAuthors : i === 1 ? selectedPublishers : selectedBookTypes;

                  return (
                    <div key={title} className="mb-4">
                      <h6 className="fw-bold text-dark">{title}</h6>
                      {data.slice(0, 6).map((item) => (
                        <div className="form-check" key={item}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selected.includes(item)}
                            onChange={() => toggleFilter(setter, selected, item)}
                          />
                          <label className="form-check-label small">{item}</label>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {(selectedAuthors.length + selectedPublishers.length + selectedBookTypes.length) > 0 && (
                  <button
                    className="btn btn-outline-danger w-100 rounded-pill"
                    onClick={() => {
                      setSelectedAuthors([]);
                      setSelectedPublishers([]);
                      setSelectedBookTypes([]);
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách sách */}
          <div className="col-lg-9">
            <div className="row g-4">
              {visibleBooks.map((book) => {
                const hasDiscount = book.gg_sach > 0;
                const finalPrice = hasDiscount ? book.gia_sach - book.gg_sach : book.gia_sach;

                return (
                  <div className="col-6 col-md-4 col-lg-4 col-xl-3" key={book.sach_id}>
                    <div
                      className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative"
                      style={{
                        background: "#fff9e6",
                        transition: "all 0.35s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-12px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      onClick={() => router.push(`/products/${book.sach_id}`)}
                    >
                      <div className="position-relative">
                        <img
                          src={book.image || "/image/default-book.jpg"}
                          alt={book.ten_sach}
                          style={{
                            height: "200px",
                            width: "100%",
                            objectFit: "contain",
                            padding: "20px",
                            background: "white",
                          }}
                        />
                        {hasDiscount && (
                          <span
                            className="position-absolute top-0 end-0 m-3 badge rounded-pill text-white fw-bold shadow-lg"
                            style={{
                              fontSize: "1rem",
                              padding: "10px 16px",
                              background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            }}
                          >
                            -{Math.round((book.gg_sach / book.gia_sach) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="card-body d-flex flex-column p-3 text-center">
                        <h6
                          className="fw-bold mb-2"
                          style={{
                            height: "40px",
                            overflow: "hidden",
                            fontSize: "1.05rem"
                          }}
                        >
                          {book.ten_sach}
                        </h6>

                        <p
                          className="fw-semibold mb-2"
                          style={{
                            color: "#059669",
                            fontSize: "0.98rem"
                          }}
                        >
                          {book.ten_tac_gia}
                        </p>

                        {hasDiscount ? (
                          <>
                            <h5 className="text-danger fw-bold">{formatPrice(finalPrice)}</h5>
                            <del className="text-muted small">{formatPrice(book.gia_sach)}</del>
                          </>
                        ) : (
                          <h5 className="text-primary fw-bold">{formatPrice(book.gia_sach)}</h5>
                        )}

                        <div className="d-flex justify-content-center gap-3 mt-3">
                          <button
                            className="btn shadow-sm fw-bold p-2"
                            style={viewButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/products/${book.sach_id}`);
                            }}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-search fs-5"></i>
                          </button>

                          <button
                            className="btn shadow-sm fw-bold p-2"
                            style={buyButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(book);
                            }}
                            title="Mua ngay"
                          >
                            <i className="bi bi-lightning-fill fs-5"></i>
                          </button>

                          <button
                            className="btn shadow-sm fw-bold p-2"
                            style={cartButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(book);
                            }}
                            title="Thêm vào giỏ"
                          >
                            <i className="bi bi-cart-plus-fill fs-5"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleBooks.length > 0 && renderPagination()}

            {visibleBooks.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-emoji-frown fs-1 text-muted mb-3"></i>
                <p className="fs-4 text-muted">Không tìm thấy sách nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}