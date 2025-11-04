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
    alert("Gửi thông tin thành công!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div
      style={{
        background: "linear-gradient(104deg, #f3f8ff 55%, #fff6ea 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "56px 0",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={9} lg={7}>
            <Card
              className="shadow-lg border-0 rounded-4"
              style={{
                background: "linear-gradient(115deg, #fffbe8 80%, #e7f3ff 100%)",
                border: "1.5px solid #ffe4a7",
                boxShadow: "0 8px 38px #fbbbbf0f, 0 2px 16px #c5e6ff2a",
              }}
            >
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2
                    className="fw-bold mb-2"
                    style={{
                      color: "#085b9a",
                      letterSpacing: ".015em",
                      textShadow: "0 2px 13px #bfdbff2d",
                      fontSize: "2.12rem"
                    }}
                  >
                    Liên hệ với chúng tôi
                  </h2>
                  <div
                    className="mx-auto d-block"
                    style={{
                      width: 62,
                      height: 3,
                      borderRadius: 10,
                      background: "linear-gradient(90deg,#ffaa3b 38%,#ffd362 100%)",
                      marginBottom: 9,
                      marginTop: 7,
                    }}
                  ></div>
                  <p
                    className="text-secondary"
                    style={{
                      fontSize: "1.06rem",
                      maxWidth: 430,
                      margin: "0 auto",
                      lineHeight: 1.62
                    }}
                  >
                    Gửi thông tin hoặc ý kiến của bạn cho chúng tôi – Đội ngũ Pibook sẽ phản hồi và hỗ trợ bạn nhanh nhất!
                  </p>
                </div>
                <Form onSubmit={handleSubmit} className="py-2">
                  <Form.Group className="mb-3">
                    <Form.Label
                      className="fw-semibold"
                      style={{ fontSize: "1.03rem", color: "#664a1e" }}
                    >
                      Họ và Tên
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập họ tên của bạn"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={60}
                      className="rounded-4 p-3 shadow-sm border-0"
                      style={{
                        background: "#fffdfa",
                        fontSize: "1.05rem",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="fw-semibold"
                      style={{ fontSize: "1.03rem", color: "#664a1e" }}
                    >
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={80}
                      className="rounded-4 p-3 shadow-sm border-0"
                      style={{
                        background: "#fffdfa",
                        fontSize: "1.05rem",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-semibold"
                      style={{ fontSize: "1.03rem", color: "#664a1e" }}
                    >
                      Tin nhắn
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Nội dung bạn muốn gửi đến Pibook..."
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={500}
                      className="rounded-4 p-3 shadow-sm border-0"
                      style={{
                        background: "#fffdfa",
                        fontSize: "1.04rem",
                        minHeight: 112,
                        resize: "vertical"
                      }}
                    />
                  </Form.Group>

                  <div className="text-center mt-3">
                    <Button
                      type="submit"
                      className="px-5 py-2 rounded-4 shadow fw-bold"
                      style={{
                        background: "linear-gradient(97deg, #ffc253 65%, #ffbb70 98%, #efc383 100%)",
                        border: "none",
                        fontSize: "1.11rem",
                        color: "#594011",
                        letterSpacing: ".016em",
                        boxShadow: "0 2px 14px #ffcf6859, 0 1.5px 8px #ffe4a999",
                        transition: "background 0.18s",
                      }}
                    >
                      Gửi ngay
                    </Button>
                  </div>
                </Form>
                <div
                  className="text-center mt-5"
                  style={{
                    color: "#8b6845",
                    fontWeight: 500,
                    fontSize: "1.01rem"
                  }}
                >
                  {/* Thông tin liên hệ hoặc địa chỉ */}
                  <div>
                    <div>Hoặc liên hệ trực tiếp:</div>
                    <div>Pibook - Nhà sách trực tuyến</div>
                    <div className="text-secondary" style={{fontSize: "0.97rem"}}>Email: support@pibook.vn</div>
                    <div className="text-secondary" style={{fontSize: "0.97rem"}}>Địa chỉ: 123 Đường Sách, P. Văn Hóa, TP. Tri Thức</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
