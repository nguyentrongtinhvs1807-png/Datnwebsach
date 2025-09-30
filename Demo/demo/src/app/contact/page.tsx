"use client";
import { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Thông tin gửi đi:", formData);
    alert("📩 Gửi thông tin thành công!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #fdfcfb, #e2d1c3)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "40px 0",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                <h2 className="text-center mb-4 fw-bold text-dark">
                  Liên Hệ Với Chúng Tôi 📚
                </h2>
                <p className="text-center text-muted mb-4">
                  Hãy để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Họ và Tên</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập họ tên của bạn"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email của bạn"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Tin nhắn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Nhập nội dung tin nhắn..."
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    />
                  </Form.Group>

                  <div className="text-center">
                    <Button
                      type="submit"
                      className="px-5 py-2 rounded-3 shadow"
                      style={{
                        background: "linear-gradient(to right, #ff7e5f, #feb47b)",
                        border: "none",
                      }}
                    >
                      ✨ Gửi ngay
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
