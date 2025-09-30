"use client";
import React from "react"; // ✅ thêm dòng này
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function CategoryPage() {
  const { slug } = useParams(); // ✅ lấy slug từ URL
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return; // tránh fetch khi slug chưa có

    fetch(`http://localhost:3003/books?category=${slug}`)
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, [slug]);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Danh mục: {slug}</h2>
      <Row>
        {books.map((book) => (
          <Col key={book.id} md={3} className="mb-3">
            <Card className="shadow-sm text-center h-100">
              <Card.Img
                variant="top"
                src={book.image}
                alt={book.name}
                className="p-3"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title>{book.name}</Card.Title>
                <h5 className="text-danger">{book.price}₫</h5>
                <Button variant="primary" onClick={() => console.log(book.id)}>
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
