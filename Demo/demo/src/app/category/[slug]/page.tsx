"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Nav } from "react-bootstrap";

interface Book {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  gg_sach: number;
  loai_bia: string;
  mo_ta: string;
  image?: string;
  ten_loai?: string;
}

interface Category {
  loai_sach_id: number;
  ten_loai: string;
}

export default function CategoryPage() {
  const params = useParams() as { slug: string };
  const slug = params.slug;

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const router = useRouter();

  // Lấy danh sách loại sách
  useEffect(() => {
    fetch("http://localhost:3003/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const current = data.find(
          (c: Category) => String(c.loai_sach_id) === String(slug)
        );
        if (current) setCategoryName(current.ten_loai);
      })
      .catch(() => setCategories([]));
  }, [slug]);

  // Lấy danh sách sách theo loại
  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:3003/books/category/${slug}`)
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch((error) => console.error("❌ Lỗi khi tải sách:", error));
  }, [slug]);

  const formatPrice = (price: number) => {
    if (!price) return "Liên hệ";
    const cleanPrice = Math.round(price);
    return cleanPrice.toLocaleString("vi-VN") + "đ";
  };

  return (
    <Container className="mt-5">
      {/* ===== Nút trở về Home ===== */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="outline-primary"
          onClick={() => router.push("/home")}
          style={{
            borderRadius: "25px",
            fontWeight: "500",
            padding: "8px 20px",
            letterSpacing: '0.5px'
          }}
        >
          Thoát về Trang chủ
        </Button>
      </div>

      {/* ===== Thanh chọn loại sách ===== */}
      <div className="mb-4 d-flex justify-content-center align-items-center flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.loai_sach_id}
            variant={Number(slug) === cat.loai_sach_id ? "primary" : "light"}
            className={`mx-1 my-1 fw-semibold ${Number(slug) === cat.loai_sach_id ? "text-white" : "text-dark"}`}
            style={{
              border: Number(slug) === cat.loai_sach_id ? "2px solid #2563eb" : "1px solid #dee2e6",
              borderRadius: "30px",
              background: Number(slug) === cat.loai_sach_id ? "linear-gradient(90deg, #3A54C1 0%, #4FDFFF 100%)" : "#f8fafc",
              transition: 'all 0.2s'
            }}
            onClick={() => router.push(`/category/${cat.loai_sach_id}`)}
          >
            {cat.ten_loai}
          </Button>
        ))}
      </div>

      {/* ===== Tiêu đề ===== */}
      <h2 className="text-center mb-5 text-uppercase fw-bold text-primary" style={{letterSpacing: '1.5px'}}>
        {categoryName ? categoryName : `Danh mục #${slug}`}
      </h2>

      {/* ===== Danh sách sách ===== */}
      {books.length === 0 ? (
        <p className="text-center text-muted" style={{ fontSize: "1.1rem", padding: 48 }}>
          Không có sách nào trong danh mục này.
        </p>
      ) : (
        <Row>
          {[...new Map(books.map((b) => [b.ten_sach, b])).values()].map(
            (book) => (
              <Col key={book.sach_id} md={3} sm={6} xs={12} className="mb-4">
                <Card
                  className="shadow-sm text-center h-100"
                  style={{
                    borderRadius: "15px",
                    border: "2px solid transparent",
                    transition:
                      "all 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.borderColor = "#f1c40f";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(241, 196, 15, 0.14)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.09)";
                  }}
                >
                  {/* Ảnh bìa */}
                  <div
                    className="p-3"
                    style={{ position: "relative", background: "#fff" }}
                  >
                    <Card.Img
                      variant="top"
                      src={book.image || "/image/default-book.jpg"}
                      alt={book.ten_sach}
                      style={{
                        height: "230px",
                        objectFit: "contain",
                        borderRadius: "10px"
                      }}
                    />
                    {book.gg_sach > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          fontSize: "0.83rem",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontWeight: 600,
                          background: "#db222a",
                          color: "#fff"
                        }}
                      >
                        Giảm {((book.gg_sach / book.gia_sach) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <Card.Body className="d-flex flex-column align-items-center text-center px-3">
                    {/* Tên sách */}
                    <Card.Title
                      className="fw-bold mb-2"
                      style={{
                        minHeight: "48px",
                        fontSize: "1rem",
                        lineHeight: "1.3",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                      title={book.ten_sach}
                    >
                      {book.ten_sach}
                    </Card.Title>

                    {/* Tác giả */}
                    <Card.Text
                      className="mb-2"
                      style={{ fontSize: "0.98rem", color: "#188945", fontWeight: 500 }}
                    >
                      {book.ten_tac_gia}
                    </Card.Text>

                    {/* Giá */}
                    <div className="mb-3">
                      <h5
                        className="mb-0 fw-bold"
                        style={{ color: "#e53935", fontSize: "1.18rem" }}
                      >
                        {formatPrice(book.gia_sach - (book.gg_sach || 0))}
                      </h5>
                      {book.gg_sach > 0 && (
                        <small className="text-muted text-decoration-line-through" style={{fontSize:"0.97rem"}}>
                          {formatPrice(book.gia_sach)}
                        </small>
                      )}
                    </div>

                    {/* Nút chọn mua */}
                    <Button
                      variant="warning"
                      className="w-100 fw-semibold"
                      style={{
                        borderRadius: "30px",
                        color: "#fff",
                        background: "linear-gradient(45deg, #f1c40f, #f39c12)",
                        border: "none",
                        transition: "0.3s",
                        fontWeight: 580
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "linear-gradient(45deg, #f39c12, #e67e22)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "linear-gradient(45deg, #f1c40f, #f39c12)")
                      }
                      onClick={() => router.push(`/products/${book.sach_id}`)}
                    >
                      Chọn mua
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )
          )}
        </Row>
      )}
    </Container>
  );
}
