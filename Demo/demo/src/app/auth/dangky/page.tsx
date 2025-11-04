"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from "react-bootstrap";

export default function DangKy() {
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    dien_thoai: "",
    mat_khau: "",
    nhap_lai_mat_khau: "",
  });
  const [loading, setLoading] = useState(false);
  const [thong_bao, setThongbao] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleDangKy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongbao("");

    // 🔎 Kiểm tra hợp lệ
    if (form.ho_ten.trim().length < 3)
      return setThongbao("Họ tên phải có ít nhất 3 ký tự");
    if (!form.email.includes("@"))
      return setThongbao("Email không hợp lệ");
    if (form.dien_thoai.trim().length < 9)
      return setThongbao("Số điện thoại không hợp lệ");
    if (form.mat_khau.length < 6)
      return setThongbao("Mật khẩu phải từ 6 ký tự trở lên");
    if (form.mat_khau !== form.nhap_lai_mat_khau)
      return setThongbao("Hai mật khẩu không trùng khớp");

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3003/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: form.ho_ten,
          email: form.email,
          dien_thoai: form.dien_thoai,
          mat_khau: form.mat_khau,
        }),
      });

      const data = await res.json();
      setThongbao(data.message || "Đăng ký thất bại");

      if (res.ok) {
        setThongbao("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => router.push("/auth/dangnhap"), 1500);
      }
    } catch (err: any) {
      setThongbao("Lỗi kết nối server: " + err.message);
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
        background: "linear-gradient(120deg,#fffde9 65%,#fbe3c1 100%)",
      }}
    >
      <Row className="justify-content-center w-100">
        <Col md={7} lg={5}>
          <Card
            className="shadow-lg border-0 rounded-4"
            style={{
              background: "linear-gradient(113deg,#fff9e0 70%,#ffe6c7 100%)",
              boxShadow: "0 8px 28px #f5e6baa8, 0 3px 16px #f8f0c8a0",
            }}
          >
            {/* HEADER */}
            <div
              className="px-4 pt-5 pb-3 text-center"
              style={{
                borderRadius: "1.6rem 1.6rem 0 0",
                background: "linear-gradient(87deg,#ffefbe 90%,#fff8e5 100%)",
                boxShadow: "0px 2px 28px #ffeebb39",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "2.15rem",
                  color: "#d29b00",
                  letterSpacing: ".025em",
                  marginBottom: 3,
                }}
              >
                Đăng ký thành viên mới
              </div>
              <div
                className="mx-auto mt-2 mb-1"
                style={{
                  color: "#6d5712",
                  fontSize: "1.08rem",
                  maxWidth: 340,
                  lineHeight: 1.65,
                }}
              >
                Vui lòng điền thông tin bên dưới để tạo tài khoản Pibook và tham gia cộng đồng đọc sách nhé!
              </div>
            </div>
            <Card.Body className="p-5 pt-4">
              <Form onSubmit={handleDangKy} autoComplete="off">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                    Họ và tên
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ho_ten"
                    placeholder="VD: Nguyễn Văn A"
                    value={form.ho_ten}
                    onChange={handleChange}
                    required
                    style={{
                      background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #ffe3a6",
                      fontSize: "1.06rem",
                      padding: "0.9rem 0.8rem",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{
                      background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #ffe3a6",
                      fontSize: "1.06rem",
                      padding: "0.9rem 0.8rem",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                    Số điện thoại
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="dien_thoai"
                    placeholder="Nhập số điện thoại"
                    value={form.dien_thoai}
                    onChange={handleChange}
                    required
                    style={{
                      background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #ffe3a6",
                      fontSize: "1.06rem",
                      padding: "0.9rem 0.8rem",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                    Mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="mat_khau"
                    placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                    value={form.mat_khau}
                    onChange={handleChange}
                    required
                    style={{
                      background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #ffe3a6",
                      fontSize: "1.06rem",
                      padding: "0.9rem 0.8rem",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                    Nhập lại mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="nhap_lai_mat_khau"
                    placeholder="Nhập lại mật khẩu"
                    value={form.nhap_lai_mat_khau}
                    onChange={handleChange}
                    required
                    style={{
                      background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #ffe3a6",
                      fontSize: "1.06rem",
                      padding: "0.9rem 0.8rem",
                    }}
                  />
                </Form.Group>

                {/* Thông báo */}
                {thong_bao && (
                  <Alert
                    variant={
                      thong_bao.includes("thành công")
                        ? "success"
                        : thong_bao.includes("kết nối")
                        ? "warning"
                        : "danger"
                    }
                    className="py-2 text-center mb-3 rounded-3 fw-medium"
                    style={{
                      fontSize: "1.03rem",
                      letterSpacing: ".01em",
                      background:
                        thong_bao.includes("thành công")
                          ? "linear-gradient(92deg,#e0ffe3 80%,#fff 100%)"
                          : thong_bao.includes("kết nối")
                          ? "linear-gradient(92deg,#fff8d5 80%,#fff 100%)"
                          : "linear-gradient(92deg,#ffe7e8 80%,#fff 100%)",
                      color: thong_bao.includes("thành công")
                        ? "#287245"
                        : thong_bao.includes("kết nối")
                        ? "#776a18"
                        : "#c92c40",
                      border: "none"
                    }}
                  >
                    {thong_bao}
                  </Alert>
                )}

                {/* Nút đăng ký */}
                <div className="d-grid mb-3">
                  <Button
                    variant="warning"
                    type="submit"
                    disabled={loading}
                    className="fw-bold text-dark shadow px-4"
                    style={{
                      padding: "0.98rem 0",
                      borderRadius: "18px",
                      fontSize: "1.17rem",
                      background:
                        "linear-gradient(90deg,#ffd44d 68%,#ffe28e 100%)",
                      border: "none",
                      boxShadow:
                        "0 7px 28px #ffe6a938, 0 1.5px 12px #e0e5f0a8",
                      letterSpacing: ".01em",
                      textShadow: "0 2px 10px #ffeea037",
                      transition: "background 0.18s",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" style={{ color: "#e6be35" }} /> &nbsp;Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </div>
                <div
                  className="text-center text-muted"
                  style={{
                    fontSize: "1.04rem",
                    marginTop: 12,
                    marginBottom: 8,
                    letterSpacing: ".01em",
                  }}
                >
                  Đã có tài khoản?{" "}
                  <span
                    onClick={() => router.push("/auth/dangnhap")}
                    className="text-warning fw-semibold text-decoration-none"
                    style={{ cursor: "pointer", color: "#e7aa14" }}
                  >
                    Đăng nhập ngay
                  </span>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
