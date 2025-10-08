"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function CategoryPage() {
  const params = useParams() as { slug: string };
  const slug = params.slug; // ✅ lấy slug có kiểu string
  const [books, setBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:3003/books?category=${slug}`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Lỗi khi tải sách:", error));
  }, [slug]);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4 text-uppercase">Danh mục: {slug}</h2>

      {books.length === 0 ? (
        <p className="text-center text-muted">Không có sách nào trong danh mục này.</p>
      ) : (
        <Row>
          {books.map((book) => (
            <Col key={book.id} md={3} className="mb-4">
              <Card className="shadow-sm text-center h-100 border-0">
                <div className="p-3">
                  <Card.Img
                    variant="top"
                    src={book.image}
                    alt={book.name}
                    style={{ height: "200px", objectFit: "contain" }}
                  />
                </div>
                <Card.Body className="d-flex flex-column align-items-center">
                  <Card.Title className="mb-2">{book.name}</Card.Title>
                  <h5 className="text-danger mb-3">{book.price.toLocaleString()}₫</h5>

                  <Button variant="primary" onClick={() => router.push(`/products/${book.id}`)}> Xem chi tiết</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
