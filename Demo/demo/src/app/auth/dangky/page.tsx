"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from "react-bootstrap";

export default function DangKy() {
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",           // ← THÊM TRƯỜNG ĐỊA CHỈ
    ngay_sinh: "",         // ← THÊM TRƯỜNG NGÀY SINH (format YYYY-MM-DD)
    mat_khau: "",
    nhap_lai_mat_khau: "",
  });
  const [loading, setLoading] = useState(false);
  const [thong_bao, setThongbao] = useState<{ type: "success" | "danger" | "warning"; message: string } | null>(null);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "so_dien_thoai") {
      const numericValue = value.replace(/\D/g, "").slice(0, 11);
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    if (form.ho_ten.trim().length < 3) {
      setThongbao({ type: "danger", message: "Họ và tên phải có ít nhất 3 ký tự" });
      return false;
    }

    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email.trim())) {
      setThongbao({ type: "danger", message: "Email không hợp lệ (ví dụ: abc@gmail.com)" });
      return false;
    }

    const phone = form.so_dien_thoai.trim();
    if (phone.length !== 10) {
      setThongbao({ type: "danger", message: "Số điện thoại phải có đúng 10 số" });
      return false;
    }
    if (!/^0[3|5|7|8|9][0-9]{8}$/.test(phone)) {
      setThongbao({ type: "danger", message: "Số điện thoại không hợp lệ (bắt đầu bằng 03, 05, 07, 08, 09)" });
      return false;
    }

    if (form.mat_khau.length < 6) {
      setThongbao({ type: "danger", message: "Mật khẩu phải từ 6 ký tự trở lên" });
      return false;
    }

    if (form.mat_khau !== form.nhap_lai_mat_khau) {
      setThongbao({ type: "danger", message: "Hai mật khẩu không trùng khớp" });
      return false;
    }

    return true;
  };

  async function handleDangKy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongbao(null);

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3003/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: form.ho_ten.trim(),
          email: form.email.trim(),
          so_dien_thoai: form.so_dien_thoai.trim(),
          dia_chi: form.dia_chi.trim() || null,           // ← GỬI ĐỊA CHỈ (có thể trống → null)
          ngay_sinh: form.ngay_sinh || null,             // ← GỬI NGÀY SINH (có thể trống → null)
          mat_khau: form.mat_khau,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setThongbao({ type: "success", message: "Đăng ký thành công! Đang chuyển đến trang đăng nhập..." });
        setTimeout(() => router.push("/auth/dangnhap"), 2000);
      } else {
        setThongbao({ type: "danger", message: data.message || "Đăng ký thất bại. Email hoặc số điện thoại đã tồn tại." });
      }
    } catch (err: any) {
      setThongbao({ type: "warning", message: "Lỗi kết nối server. Vui lòng kiểm tra mạng và thử lại." });
      console.error("Lỗi đăng ký:", err);
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
        background: "linear-gradient(120deg, #fffde9 65%, #fbe3c1 100%)",
      }}
    >
      <Row className="justify-content-center w-100">
        <Col md={7} lg={5}>
          <Card
            className="shadow-lg border-0 rounded-4"
            style={{
              background: "linear-gradient(113deg, #fff9e0 70%, #ffe6c7 100%)",
              boxShadow: "0 8px 28px #f5e6baa8, 0 3px 16px #f8f0c8a0",
            }}
          >
            {/* HEADER */}
            <div
              className="px-4 pt-5 pb-3 text-center"
              style={{
                borderRadius: "1.6rem 1.6rem 0 0",
                background: "linear-gradient(87deg, #ffefbe 90%, #fff8e5 100%)",
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
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Họ và tên <span className="text-danger">*</span>
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
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Email <span className="text-danger">*</span>
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
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Số điện thoại <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="so_dien_thoai"
                        placeholder="VD: 0987654321"
                        value={form.so_dien_thoai}
                        onChange={handleChange}
                        required
                        maxLength={11}
                        style={{
                          background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                          borderRadius: "0.75rem",
                          border: "1.5px solid #ffe3a6",
                          fontSize: "1.06rem",
                          padding: "0.9rem 0.8rem",
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Ngày sinh
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="ngay_sinh"
                        value={form.ngay_sinh}
                        onChange={handleChange}
                        style={{
                          background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                          borderRadius: "0.75rem",
                          border: "1.5px solid #ffe3a6",
                          fontSize: "1.06rem",
                          padding: "0.9rem 0.8rem",
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Địa chỉ
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="dia_chi"
                        placeholder="Số nhà, đường, phường/xã..."
                        value={form.dia_chi}
                        onChange={handleChange}
                        style={{
                          background: "linear-gradient(98deg,#fffceb 96%,#fbecda 100%)",
                          borderRadius: "0.75rem",
                          border: "1.5px solid #ffe3a6",
                          fontSize: "1.06rem",
                          padding: "0.9rem 0.8rem",
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Mật khẩu <span className="text-danger">*</span>
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
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold" style={{ color: "#7c650b", fontSize: "1.05rem" }}>
                        Nhập lại mật khẩu <span className="text-danger">*</span>
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
                  </Col>
                </Row>

                {/* Thông báo */}
                {thong_bao && (
                  <Alert
                    variant={thong_bao.type}
                    className="py-2 text-center mb-3 rounded-3 fw-medium"
                    style={{
                      fontSize: "1.03rem",
                      letterSpacing: ".01em",
                    }}
                  >
                    {thong_bao.message}
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
                      background: "linear-gradient(90deg,#ffd44d 68%,#ffe28e 100%)",
                      border: "none",
                      boxShadow: "0 7px 28px #ffe6a938, 0 1.5px 12px #e0e5f0a8",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" /> Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </div>

                <div className="text-center text-muted" style={{ fontSize: "1.04rem" }}>
                  Đã có tài khoản?{" "}
                  <span
                    onClick={() => router.push("/auth/dangnhap")}
                    className="text-warning fw-semibold text-decoration-none"
                    style={{ cursor: "pointer" }}
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