// app/account/page.tsx (Client Component - "use client")
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

type User = {
  nguoi_dung_id?: number;
  ten?: string;
  email?: string;
  so_dien_thoai?: string;
  dia_chi?: string;
  ngay_sinh?: string | null;
  role?: string;
  has_password?: boolean;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(savedUser);
        const userId = parsed.nguoi_dung_id || parsed.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3003/auth/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/dangnhap");
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Chưa có";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa có";
    }
  };

  const displayRole = user?.role === "admin" ? "Quản trị viên" : "Thành viên";

  if (loading) {
    return <div className="text-center py-5">Đang tải thông tin...</div>;
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center p-5">
              <h3>Bạn chưa đăng nhập</h3>
              <Button variant="primary" onClick={() => router.push("/auth/dangnhap")}>
                Đăng nhập ngay
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="text-center py-5" style={{
              background: "linear-gradient(90deg, #ffb300, #ff9800)",
              color: "white"
            }}>
              <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "120px", height: "120px", fontSize: "4rem", color: "#ff9800" }}>
                {(user.ten?.charAt(0) || "N").toUpperCase()}
              </div>
              <h2 className="fw-bold mb-2">Người dùng</h2>
              <span className="badge bg-white text-dark px-4 py-2 rounded-pill fs-6">
                {displayRole}
              </span>
            </div>

            <Card.Body className="p-5 bg-light">
              <Row className="g-4">
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Mã người dùng</small>
                    <h5 className="fw-bold mt-2">{user.nguoi_dung_id}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Tên người dùng</small>
                    <h5 className="fw-bold mt-2">{user.ten || "Người dùng"}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Email</small>
                    <h5 className="fw-bold mt-2">{user.email}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Số điện thoại</small>
                    <h5 className="fw-bold mt-2">{user.so_dien_thoai || "Chưa có"}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Địa chỉ</small>
                    <h5 className="fw-bold mt-2">{user.dia_chi || "Chưa có"}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Ngày sinh</small>
                    <h5 className="fw-bold mt-2">{formatDate(user.ngay_sinh)}</h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Mật khẩu</small>
                    <h5 className="fw-bold mt-2 font-monospace">
                      {user.has_password ? "••••••••••••" : "Chưa có"}
                    </h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <small className="text-muted">Vai trò</small>
                    <h5 className="fw-bold mt-2 text-success">{displayRole}</h5>
                  </div>
                </Col>
              </Row>

              <div className="text-center mt-5">
                <Button variant="outline-primary" className="me-3 px-5 py-3 rounded-pill" onClick={() => router.push("/auth/doi-pass")}>
                  Đổi mật khẩu
                </Button>
                <Button variant="outline-danger" className="px-5 py-3 rounded-pill" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}