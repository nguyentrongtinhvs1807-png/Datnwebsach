"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";

export default function LoginForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const matkhauRef = useRef<HTMLInputElement>(null);
  const thongbaoRef = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim() || "";
    const mat_khau = matkhauRef.current?.value.trim() || "";

    if (!email || !mat_khau) {
      if (thongbaoRef.current)
        thongbaoRef.current.innerHTML = `
          <div class="alert alert-warning py-2 text-center">
            Vui lòng nhập đầy đủ thông tin
          </div>`;
      return;
    }

    try {
      const res = await fetch("http://localhost:3003/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mat_khau }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (thongbaoRef.current)
          thongbaoRef.current.innerHTML = `
            <div class="alert alert-danger py-2 text-center">
              ${data.message || "Email hoặc mật khẩu không đúng."}<br/>
              <a href="/auth/quen-pass" class="text-decoration-none text-warning fw-semibold">
                Quên mật khẩu?
              </a>
            </div>`;
        return;
      }

      // === LƯU THÔNG TIN ĐĂNG NHẬP ===
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      // === XÓA GIỎ HÀNG CŨ KHI ĐĂNG NHẬP (QUAN TRỌNG NHẤT!) ===
      localStorage.removeItem("cart");              // Xóa toàn bộ sản phẩm trong giỏ
      localStorage.removeItem("appliedDiscount");   // Xóa mã giảm giá cũ
      localStorage.removeItem("checkoutItems");     // Xóa items đã chọn thanh toán

      // Phát sự kiện để các component khác biết đã login và giỏ hàng thay đổi
      window.dispatchEvent(new Event("login"));
      window.dispatchEvent(new Event("cart-update"));

      // Điều hướng theo role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }

      // Thông báo thành công
      if (thongbaoRef.current)
        thongbaoRef.current.innerHTML = `
          <div class="alert alert-success py-2 text-center">
            Đăng nhập thành công! Đang chuyển hướng...
          </div>`;
    } catch (error) {
      if (thongbaoRef.current)
        thongbaoRef.current.innerHTML = `
          <div class="alert alert-danger py-2 text-center">
            Lỗi kết nối server
          </div>`;
      console.error(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(125deg,#fffbe8 60%,#dbebff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={5}>
            <Card
              className="shadow-lg border-0 rounded-4"
              style={{
                background: "linear-gradient(110deg, #fffbe8 58%, #eaf4ff 100%)",
                boxShadow: "0 6px 38px #cfd3e6b8",
              }}
            >
              <div
                className="px-4 pt-5 pb-3 text-center"
                style={{
                  borderRadius: "1.7rem 1.7rem 0 0",
                  background: "linear-gradient(88deg,#fdecad 70%, #fbeee5 100%)",
                  boxShadow: "0px 2px 28px #ffeebb35",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "2.1rem",
                    color: "#d78f09",
                    letterSpacing: ".03em",
                  }}
                >
                  Đăng nhập thành viên
                </div>
                <div
                  className="mx-auto mt-3"
                  style={{
                    color: "#837131",
                    fontSize: "1.08rem",
                    maxWidth: 350,
                    lineHeight: 1.6,
                  }}
                >
                  Để tiếp tục, hãy nhập email và mật khẩu của bạn phía dưới.
                </div>
              </div>

              <Card.Body className="py-4 px-4">
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      className="fw-semibold"
                      style={{ color: "#374151", fontSize: "1.05rem" }}
                    >
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email của bạn"
                      ref={emailRef}
                      required
                      style={{
                        background:
                          "linear-gradient(98deg, #fffceb 90%, #e8edfb 100%)",
                        borderRadius: "0.7rem",
                        border: "1px solid #ffe3a6",
                        fontSize: "1.05rem",
                        padding: "0.88rem 0.75rem",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label
                      className="fw-semibold"
                      style={{ color: "#374151", fontSize: "1.05rem" }}
                    >
                      Mật khẩu
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Nhập mật khẩu"
                      ref={matkhauRef}
                      required
                      style={{
                        background:
                          "linear-gradient(98deg, #fffceb 90%, #e8edfb 100%)",
                        borderRadius: "0.7rem",
                        border: "1px solid #ffe3a6",
                        fontSize: "1.05rem",
                        padding: "0.88rem 0.75rem",
                      }}
                    />
                  </Form.Group>

                  {/* Thông báo */}
                  <div ref={thongbaoRef} className="mb-2"></div>

                  <div className="d-grid mb-3">
                    <Button
                      variant="warning"
                      type="submit"
                      className="fw-bold text-dark shadow"
                      style={{
                        padding: "0.9rem 0",
                        borderRadius: "15px",
                        fontSize: "1.15rem",
                        background:
                          "linear-gradient(90deg,#ffe285 50%,#ffc932 100%)",
                        border: "none",
                        boxShadow: "0 7px 32px #ffe6a948, 0 1.5px 12px #e0e5f0a0",
                        letterSpacing: ".01em",
                        textShadow: "0 2px 14px #ffeea022",
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </div>

                  <div
                    className="text-center text-muted"
                    style={{
                      fontSize: "1.01rem",
                      marginTop: 10,
                      marginBottom: 6,
                    }}
                  >
                    Chưa có tài khoản?{" "}
                    <Link
                      href="/auth/dangky"
                      className="text-warning fw-semibold text-decoration-none"
                    >
                      Đăng ký ngay
                    </Link>
                  </div>

                  <div
                    className="text-center"
                    style={{ marginTop: 3, fontSize: "1.01rem" }}
                  >
                    <Link
                      href="/auth/quen-pass"
                      className="text-decoration-none"
                      style={{
                        color: "#e6bc1c",
                        fontWeight: 600,
                        letterSpacing: ".01em",
                      }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        body {
          background: none !important;
        }
        .form-control:focus {
          border-color: #ffc107 !important;
          box-shadow: 0 0 4px #ffe17f80 !important;
        }
        .form-label {
          margin-bottom: 0.48rem;
        }
      `}</style>
    </div>
  );
}