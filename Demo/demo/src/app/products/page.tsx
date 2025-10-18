"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [filterType, setFilterType] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState("");

  // 🔹 Gọi API Node.js backend
  useEffect(() => {
    fetch("http://localhost:3003/books") // ✅ đúng API backend trong server.js
      .then((res) => res.json())
      .then((data) => {
        console.log("📚 Dữ liệu từ API /books:", data);
        setBooks(data);
      })
      .catch((err) => console.error("❌ Lỗi khi gọi API:", err));
  }, []);

  // 🔹 Lấy danh sách loại bìa duy nhất
  const bookTypes = ["Tất cả", ...new Set(books.map((b) => b.loai_bia))];

  // 🔹 Lọc + Sắp xếp
  const filteredBooks = books
    .filter(
      (b) =>
        b.ten_sach.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === "Tất cả" || b.loai_bia === filterType)
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.gia_sach - b.gia_sach;
      if (sortOrder === "desc") return b.gia_sach - a.gia_sach;
      return 0;
    });

  return (
    <div className="container mt-5">
      {/* --- Bộ lọc --- */}
      <div className="card p-4 mb-5 shadow-sm" style={{ borderRadius: "15px" }}>
        <h5 className="fw-bold mb-3 text-center" style={{ color: "#2c3e50" }}>
          🎯 LỌC SÁCH
        </h5>
        <div className="row g-3">
          {/* Ô tìm kiếm */}
          <div className="col-md-4">
            <input
              type="text"
              placeholder="🔍 Tìm theo tên sách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{
                borderRadius: "30px",
                padding: "10px 20px",
                border: "2px solid #f1c40f",
              }}
            />
          </div>

          {/* Lọc theo loại bìa */}
          <div className="col-md-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
              style={{
                borderRadius: "30px",
                border: "2px solid #f1c40f",
                padding: "10px",
              }}
            >
              {bookTypes.map((type, i) => (
                <option key={i} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="col-md-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
              style={{
                borderRadius: "30px",
                border: "2px solid #f1c40f",
                padding: "10px",
              }}
            >
              <option value="">-- Sắp xếp theo giá --</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Danh sách sách --- */}
      <h2 className="text-center mb-5 fw-bold" style={{ color: "#2c3e50" }}>
        📚 DANH SÁCH SÁCH
      </h2>

      <div className="row">
        {filteredBooks.map((b) => (
          <div className="col-md-3 mb-4" key={b.sach_id}>
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "15px",
                border: "2px solid #f1c40f33",
                overflow: "hidden",
                transition: "transform 0.3s, box-shadow 0.3s, border 0.3s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-8px)";
                el.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                el.style.border = "2px solid #f1c40f";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                el.style.border = "2px solid #f1c40f33";
              }}
            >
              {/* Hình ảnh */}
              <div
                style={{
                  width: "100%",
                  height: "250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fdfdfd",
                }}
              >
                <img
                  src={b.image || "/image/default-book.jpg"}
                  alt={b.ten_sach}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Nội dung */}
              <div className="card-body text-center">
                <h6 className="fw-semibold">{b.ten_sach}</h6>
                <p className="fw-semibold mb-1" style={{ color: "#2980b9" }}>
                  {b.ten_tac_gia}
                </p>
                <p className="fw-semibold mb-1" style={{ color: "#27ae60" }}>
                  {b.loai_bia}
                </p>
                <p className="text-danger fw-bold fs-5 mb-1">
                  {Number(b.gia_sach).toLocaleString("vi-VN")}đ
                </p>
                {b.gg_sach > 0 && (
                  <p className="text-muted small">
                    Giảm {b.gg_sach.toLocaleString("vi-VN")}đ
                  </p>
                )}
                <Link
                  href={`/products/${b.sach_id}`}
                  className="btn mt-2 px-4 fw-bold"
                  style={{
                    borderRadius: "30px",
                    background: "linear-gradient(45deg, #f1c40f, #f39c12)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredBooks.length === 0 && (
          <p className="text-center text-muted">Không có sách nào phù hợp</p>
        )}
      </div>
    </div>
  );
}
