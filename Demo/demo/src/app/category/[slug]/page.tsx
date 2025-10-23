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

  // ✅ Lấy danh sách loại sách
  useEffect(() => {
    fetch("http://localhost:3003/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const current = data.find((c: Category) => String(c.loai_sach_id) === String(slug));
        if (current) setCategoryName(current.ten_loai);
      })
      .catch(() => setCategories([]));
  }, [slug]);

  // ✅ Lấy danh sách sách theo loại
  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:3003/books/category/${slug}`)
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch((error) => console.error("❌ Lỗi khi tải sách:", error));
  }, [slug]);

  // ✅ Format giá
  const formatPrice = (price: number) =>
    price ? price.toLocaleString("vi-VN") + "₫" : "Liên hệ";

  return (
    <Container className="mt-5">
      {/* ===== Thanh chọn loại sách ===== */}
      <Nav variant="tabs" defaultActiveKey={`/category/${slug}`} className="mb-4">
        {categories.map((cat) => (
          <Nav.Item key={cat.loai_sach_id}>
            <Nav.Link
              href={`/category/${cat.loai_sach_id}`}
              className={
                Number(slug) === cat.loai_sach_id
                  ? "fw-bold text-primary"
                  : "text-dark"
              }
            >
              {cat.ten_loai}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* ===== Tiêu đề ===== */}
      <h2 className="text-center mb-4 text-uppercase text-primary">
        {categoryName ? categoryName : `Danh mục #${slug}`}
      </h2>

      {/* ===== Danh sách sách ===== */}
      {books.length === 0 ? (
        <p className="text-center text-muted">
          Không có sách nào trong danh mục này.
        </p>
      ) : (
        <Row>
          {books.map((book) => (
            <Col key={book.sach_id} md={3} sm={6} xs={12} className="mb-4">
              <Card className="shadow-sm text-center h-100 border-0">
                <div className="p-3" style={{ position: "relative" }}>
                  <Card.Img
                    variant="top"
                    src={book.image || "/image/default-book.jpg"}
                    alt={book.ten_sach}
                    style={{
                      height: "230px",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                  />
                  {book.gg_sach > 0 && (
                    <span
                      className="badge bg-danger"
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        fontSize: "0.8rem",
                      }}
                    >
                      Giảm {((book.gg_sach / book.gia_sach) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <Card.Body className="d-flex flex-column align-items-center">
                  <Card.Title
                    className="mb-2 text-truncate fw-bold"
                    title={book.ten_sach}
                  >
                    {book.ten_sach}
                  </Card.Title>

                  <Card.Text className="text-success mb-1">
                    {book.ten_tac_gia}
                  </Card.Text>

                  <h5 className="text-danger mb-1">
                    {formatPrice(book.gia_sach - (book.gg_sach || 0))}
                  </h5>

                  {book.gg_sach > 0 && (
                    <small className="text-muted text-decoration-line-through mb-2">
                      {formatPrice(book.gia_sach)}
                    </small>
                  )}

                  <Button
                    variant="warning"
                    className="w-100 mt-auto"
                    onClick={() => router.push(`/products/${book.sach_id}`)}
                  >
                    Chọn mua
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
