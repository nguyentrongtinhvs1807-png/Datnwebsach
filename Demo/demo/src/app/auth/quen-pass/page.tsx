"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";

export default function LostPass() {
  const [email, setEmail] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongBao("");

    if (!email.trim()) {
      setThongBao("⚠️ Vui lòng nhập email.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3003/auth/quenpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setThongBao("✅ Mật khẩu mới đã được gửi đến email của bạn!");
        setTimeout(() => router.push("/auth/dangnhap"), 1500);
      } else {
        setThongBao(data.message || "❌ Không tìm thấy tài khoản này.");
      }
    } catch (error: any) {
      setThongBao("⚠️ Lỗi kết nối server: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #a8edea, #fed6e3)",
      }}
    >
      <Card className="shadow-lg border-0 rounded-4 p-4" style={{ width: "450px" }}>
        <Card.Body>
          <h3 className="text-center text-info fw-bold mb-3">
            🔐 Quên mật khẩu
          </h3>
          <p className="text-center text-muted mb-4">
            Nhập email bạn đã đăng ký, hệ thống sẽ gửi mật khẩu mới về email.
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Email đăng ký</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {thongBao && (
              <Alert
                variant={
                  thongBao.includes("✅")
                    ? "success"
                    : thongBao.includes("⚠️")
                    ? "warning"
                    : "danger"
                }
                className="text-center py-2"
              >
                {thongBao}
              </Alert>
            )}

            <div className="d-grid mt-3">
              <Button
                type="submit"
                variant="info"
                disabled={loading}
                className="fw-semibold text-white"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> &nbsp;Đang gửi...
                  </>
                ) : (
                  "Gửi mật khẩu mới"
                )}
              </Button>
            </div>

            <p className="text-center text-muted mt-4">
              Đã nhớ mật khẩu?{" "}
              <a
                href="/auth/dangnhap"
                className="text-info fw-semibold text-decoration-none"
              >
                Đăng nhập ngay
              </a>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
