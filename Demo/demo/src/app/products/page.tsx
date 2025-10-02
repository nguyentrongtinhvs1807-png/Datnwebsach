"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  description?: string | null;
  tac_gia?: string | null;
  book_type: string;
};

type Post = {
  id: number;
  title: string;
  image: string;
  url: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  // Fake data cho bài viết
  const posts: Post[] = [
    {
      id: 1,
      title: "Top 10 cuốn sách hay nhất mọi thời đại",
      image: "/image/sach-hay-thumbnail.jpg",
      url: "https://vnexpress.net/sach-hay-4567890.html",
    },
    {
      id: 2,
      title: "Bí quyết đọc sách nhanh và hiệu quả",
      image: "/image/cach-doc-sach-nhanh.jpg",
      url: "https://zingnews.vn/bi-quyet-doc-sach-post456789.html",
    },
    {
      id: 3,
      title: "Xu hướng sách mới năm 2025",
      image: "/image/file-7tHt.jpg",
      url: "https://tuoitre.vn/xu-huong-sach-2025-456789.htm",
    },
  ];

  useEffect(() => {
    fetch("http://localhost:3003/products")
      .then((r) => r.json())
      .then((data) => {
        console.log("📦 Products API:", data);
        setProducts(data);
      })
      .catch((err) => console.error("❌ API Error:", err));
  }, []);

  return (
    <div className="container mt-5">
      {/* --- Banner nhỏ quảng cáo --- */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <img
            src="/image/b9690ac7ec4b7c94d44d9e519b6c30e7.jpg"
            alt="Quảng cáo 1"
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-4 mb-3">
          <img
            src="/image/87a6df704dbfecf5d3a1fa190070b5e2.jpg"
            alt="Quảng cáo 2"
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-4 mb-3">
          <img
            src="/image/43656448182f8e5f216238dc130add08.jpg"
            alt="Quảng cáo 3"
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* --- Danh sách sản phẩm --- */}
      <h2 className="text-center mb-5 fw-bold" style={{ color: "#2c3e50" }}>
        📚 DANH SÁCH SẢN PHẨM
      </h2>
      <div className="row">
        {products.map((p) => (
          <div className="col-md-3 mb-4" key={p.id}>
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "15px",
                border: "2px solid #f1c40f33", // vàng nhạt
                overflow: "hidden",
                transition: "transform 0.3s, box-shadow 0.3s, border 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-8px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.15)";
                (e.currentTarget as HTMLElement).style.border =
                  "2px solid #f1c40f"; // viền vàng đậm khi hover
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 6px rgba(0,0,0,0.1)";
                (e.currentTarget as HTMLElement).style.border =
                  "2px solid #f1c40f33"; // trở lại vàng nhạt
              }}
            >
              {/* Khung ảnh */}
              <div
                style={{
                  width: "100%",
                  height: "280px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fdfdfd",
                }}
              >
                <img
                  src={p.image || "/no-image.png"}
                  alt={p.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transition: "transform 0.4s",
                  }}
                  className="card-img-top"
                />
              </div>

              {/* Nội dung */}
              <div className="card-body text-center">
                <h6
                  className="card-title fw-semibold"
                  style={{ minHeight: "48px" }}
                >
                  {p.name}
                </h6>
                {p.tac_gia && (
                  <p className="fw-semibold mb-1" style={{ color: "#2980b9" }}>
                    {p.tac_gia}
                  </p>
                )}
                {p.book_type && (
                  <p className="fw-semibold mb-2" style={{ color: "#27ae60" }}>
                    {p.book_type}
                  </p>
                )}
                <p className="text-danger fw-bold fs-5 mb-1">
                  {Number(p.price).toLocaleString("vi-VN")}đ
                </p>
                {p.originalPrice && p.originalPrice > p.price && (
                  <p className="text-muted text-decoration-line-through">
                    {Number(p.originalPrice).toLocaleString("vi-VN")}đ
                  </p>
                )}
                <Link
                  href={`/products/${p.id}`}
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

        {products.length === 0 && (
          <p className="text-center text-muted">Không có sản phẩm nào</p>
        )}
      </div>

      {/* --- Bài viết --- */}
      <h2 className="text-center mt-5 mb-4 fw-bold" style={{ color: "#2c3e50" }}>
        📰 BÀI VIẾT MỚI
      </h2>
      <div className="row">
        {posts.map((post) => (
          <div className="col-md-4 mb-4" key={post.id}>
            <div
              className="card h-100 shadow-sm rounded-3"
              style={{
                border: "2px solid #f1c40f33",
                transition: "border 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border =
                  "2px solid #f1c40f";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border =
                  "2px solid #f1c40f33";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <img
                src={post.image}
                alt={post.title}
                className="card-img-top"
                style={{
                  height: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                }}
              />
              <div className="card-body text-center">
                <h6 className="fw-bold">{post.title}</h6>
                <Link
                  href={post.url}
                  target="_blank"
                  className="btn btn-sm fw-bold"
                  style={{
                    borderRadius: "30px",
                    background: "linear-gradient(45deg, #3498db, #2980b9)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Đọc thêm →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
