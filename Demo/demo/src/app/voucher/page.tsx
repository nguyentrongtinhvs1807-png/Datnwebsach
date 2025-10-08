"use client";

import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Badge } from "react-bootstrap";

interface Voucher {
  id: number;
  code: string;
  discount: number;
  min_order: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  description?: string;
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      const res = await fetch("/api/voucher");
      const data = await res.json();
      setVouchers(data);
    };
    fetchVouchers();
  }, []);

  return (
    <Container className="py-5">
      <h2
        className="text-center fw-bold mb-5"
        style={{
          color: "#0d6efd",
          fontSize: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        🎁 Danh sách Voucher
      </h2>

      <Row className="justify-content-center">
        {vouchers.map((v) => (
          <Col md={4} sm={6} xs={12} key={v.id} className="mb-4">
            <Card
              className="border-0 shadow-sm h-100 hover-card"
              style={{
                borderRadius: "16px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-success mb-0">{v.code}</h5>
                  <Badge bg="warning" text="dark" style={{ fontSize: "0.9rem" }}>
                    -{v.discount}%
                  </Badge>
                </div>

                <Card.Text className="text-muted" style={{ minHeight: "40px" }}>
                  {v.description || `Giảm ${v.discount}% cho đơn từ ${v.min_order.toLocaleString()}đ`}
                </Card.Text>

                <div className="mt-3">
                  <div>
                    <strong>Đơn tối thiểu:</strong>{" "}
                    <span>{v.min_order.toLocaleString()}đ</span>
                  </div>
                  <div>
                    <strong>Giảm tối đa:</strong>{" "}
                    <span>{v.max_discount.toLocaleString()}đ</span>
                  </div>
                </div>
              </Card.Body>

              <Card.Footer
                className="bg-light text-center small text-muted"
                style={{
                  borderTop: "1px solid #eee",
                  borderBottomLeftRadius: "16px",
                  borderBottomRightRadius: "16px",
                }}
              >
                Hiệu lực:{" "}
                <span className="fw-semibold">
                  {new Date(v.start_date).toLocaleDateString("vi-VN")} →{" "}
                  {new Date(v.end_date).toLocaleDateString("vi-VN")}
                </span>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {vouchers.length === 0 && (
        <p className="text-center text-muted mt-5 fs-5">
          😔 Hiện chưa có voucher nào đang hoạt động
        </p>
      )}

      <style jsx global>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Container>
  );
}
