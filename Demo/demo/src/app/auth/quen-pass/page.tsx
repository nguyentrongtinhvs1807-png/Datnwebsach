"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";

export default function LostPass() {
  const [email, setEmail] = useState("");
  const [thongBao, setThongBao] = useState<{ type: "success" | "warning" | "danger"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongBao(null);

    const emailTrim = email.trim();
    if (!emailTrim) {
      setThongBao({ type: "warning", msg: "Vui lòng nhập email của bạn!" });
      return;
    }

    // Validate định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setThongBao({ type: "warning", msg: "Email không hợp lệ!" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3003/auth/quenpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim }),
      });

      // Quan trọng: Đọc response trước khi parse JSON (tránh lỗi Unexpected token <)
      const text = await res.text();

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Server trả về không phải JSON:", text.substring(0, 200));
        setThongBao({ type: "danger", msg: "Lỗi server, vui lòng thử lại sau!" });
        return;
      }

      if (res.ok) {
        setThongBao({
          type: "success",
          msg: "Mật khẩu mới đã được gửi đến email của bạn! Kiểm tra hộp thư nhé",
        });

        // Tự động chuyển về đăng nhập sau 3 giây
        setTimeout(() => {
          router.push("/auth/dangnhap");
        }, 3000);
      } else {
        // API trả lỗi (ví dụ: 400, 500) → vẫn hiện thông báo nhẹ nhàng để không lộ thông tin
        setThongBao({
          type: "warning",
          msg: data.message || "Không thể gửi mật khẩu mới. Vui lòng thử lại!",
        });
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setThongBao({
        type: "danger",
        msg: "Không kết nối được đến server. Kiểm tra backend có đang chạy không?",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      }}
    >
      <Card
        className="shadow-xl border-0 rounded-4 p-5"
        style={{ maxWidth: "460px", width: "100%", background: "rgba(255,255,255,0.95)" }}
      >
        <Card.Body className="text-center">
          <div className="mb-4">
            <h2 className="fw-bold text-primary">Quên mật khẩu</h2>
            <p className="text-muted mt-3">
              Đừng lo! Chỉ cần nhập email đăng ký, chúng tôi sẽ gửi mật khẩu mới ngay
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="text-start">
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <i className="bi bi-envelope me-2"></i> Email của bạn
              </Form.Label>
              <Form.Control
                type="email"
                size="lg"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border-2"
                autoFocus
              />
            </Form.Group>

            {thongBao && (
              <Alert
                variant={thongBao.type}
                className="d-flex align-items-center py-3 mb-4 rounded-3"
              >
                <i
                  className={`bi ${
                    thongBao.type === "success"
                      ? "bi-check-circle-fill"
                      : thongBao.type === "warning"
                      ? "bi-exclamation-triangle-fill"
                      : "bi-x-circle-fill"
                  } fs-4 me-3`}
                ></i>
                <div>{thongBao.msg}</div>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={loading}
              className="w-100 fw-bold py-3 rounded-3 shadow-sm"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang gửi mật khẩu mới...
                </>
              ) : (
                "Gửi mật khẩu mới"
              )}
            </Button>
          </Form>

          <div className="mt-4 text-center">
            <small className="text-muted">
              Đã nhớ ra rồi?{" "}
              <a href="/auth/dangnhap" className="text-primary fw-bold text-decoration-none">
                → Đăng nhập ngay
              </a>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}