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
};

type Post = {
  id: number;
  title: string;
  image: string;
  url: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  // Fake data cho bài viết (hardcode, không cần API)
  const posts: Post[] = [
    {
      id: 1,
      title: "Top 10 cuốn sách hay nhất mọi thời đại",
      image:
        "/image/sach-hay-thumbnail.jpg",
      url: "https://vnexpress.net/sach-hay-4567890.html",
    },
    {
      id: 2,
      title: "Bí quyết đọc sách nhanh và hiệu quả",
      image:
        "/image/cach-doc-sach-nhanh.jpg",
      url: "https://zingnews.vn/bi-quyet-doc-sach-post456789.html",
    },
    {
      id: 3,
      title: "Xu hướng sách mới năm 2025",
      image:
        "/image/file-7tHt.jpg",
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
      {/* --- Banner Slider lớn --- */}
      <div
        id="bannerCarousel"
        className="carousel slide mb-5"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner rounded shadow-sm">
          <div className="carousel-item active">
            <img
              src="https://theme.hstatic.net/200000845405/1001223012/14/home_slider_image_1.jpg?v=453"
              className="d-block w-100"
              alt="Banner 1"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="https://theme.hstatic.net/200000845405/1001223012/14/home_slider_image_2.jpg?v=453"
              className="d-block w-100"
              alt="Banner 2"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="https://theme.hstatic.net/200000845405/1001223012/14/col2_htb_img_2.jpg?v=453"
              className="d-block w-100"
              alt="Banner 3"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Nút điều khiển */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#bannerCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#bannerCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* --- Banner nhỏ quảng cáo đẹp --- */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <img
            src="https://theme.hstatic.net/1000363117/1000911694/14/ms_banner_img3.jpg?v=635"
            alt="Quảng cáo 1"
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-4 mb-3">
          <img
            src="https://theme.hstatic.net/1000363117/1000911694/14/ms_banner_img4.jpg?v=635"
            alt="Quảng cáo 2"
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-4 mb-3">
          <img
            src="https://theme.hstatic.net/1000363117/1000911694/14/ms_banner_img2.jpg?v=635"
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
              className="card h-100 shadow-sm border-0"
              style={{
                borderRadius: "15px",
                overflow: "hidden",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-8px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 6px rgba(0,0,0,0.1)";
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
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1)")
                  }
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

        {/* Nếu không có sản phẩm */}
        {products.length === 0 && (
          <p className="text-center text-muted">Không có sản phẩm nào</p>
        )}
      </div>

      {/* --- Phần Bài viết --- */}
      <h2 className="text-center mt-5 mb-4 fw-bold" style={{ color: "#2c3e50" }}>
        📰 BÀI VIẾT MỚI
      </h2>
      <div className="row">
        {posts.map((post) => (
          <div className="col-md-4 mb-4" key={post.id}>
            <div className="card h-100 shadow-sm border-0 rounded-3">
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
              <div className="card-body">
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
