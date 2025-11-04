"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

interface User {
  id?: number;
  nguoi_dung_id?: number;
  ten?: string;
  ho_ten?: string;
  mat_khau?: string;
  ngay_sinh?: string;
  email: string;
  dia_chi?: string;
  dien_thoai?: string;
  role?: string;
  vai_tro?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // ✅ Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ✅ Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    alert("Đã đăng xuất thành công!");
    router.push("/auth/dangnhap");
  };

  // ✅ Hiển thị mật khẩu đã che
  const maskPassword = (password?: string) => {
    if (!password) return "Chưa có";
    return "•".repeat(Math.min(password.length, 12));
  };

  // ✅ Định dạng ngày tháng
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa có";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 rounded-4" style={{
              background: "linear-gradient(135deg, #fff9e6 0%, #ffeecf 100%)"
            }}>
              <Card.Body className="p-5 text-center">
                <h2 className="fw-bold text-dark mb-3">Tài khoản của tôi</h2>
                <p className="text-muted mb-4">Bạn chưa đăng nhập vào hệ thống.</p>
                <Button 
                  variant="warning" 
                  onClick={() => router.push("/auth/dangnhap")}
                  className="px-4 py-2 fw-semibold"
                  style={{ borderRadius: "12px" }}
                >
                  Đăng nhập ngay
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const userId = user.nguoi_dung_id || user.id;
  const userName = user.ten || user.ho_ten || "Người dùng";
  const userRole = user.role || user.vai_tro || "user";

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{
            background: "linear-gradient(135deg, #fff9e6 0%, #ffeecf 100%)"
          }}>
            {/* Header */}
            <div className="p-4 text-center" style={{
              background: "linear-gradient(90deg, #ffc107 0%, #ff9800 100%)",
              color: "white"
            }}>
              <div className="mb-3">
                <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center" 
                  style={{ width: "100px", height: "100px" }}>
                  <span style={{ fontSize: "3rem", color: "#ff9800" }}>
                    {(userName.charAt(0) || "U").toUpperCase()}
                  </span>
                </div>
              </div>
              <h2 className="fw-bold mb-1">{userName}</h2>
              <span className="badge bg-light text-dark px-3 py-2" style={{ fontSize: "0.9rem" }}>
                {userRole === "admin" || Number(userRole) === 1 ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>

            <Card.Body className="p-4">
              {/* Thông tin chi tiết */}
              <Row className="g-4">
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Mã người dùng</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {userId || "Chưa có"}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Tên người dùng</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {userName}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Mật khẩu</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem", fontFamily: "monospace" }}>
                      {maskPassword(user.mat_khau)}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Ngày sinh</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {formatDate(user.ngay_sinh)}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Email</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {user.email || "Chưa có"}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Địa chỉ</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {user.dia_chi || user.dien_thoai || "Chưa có"}
                    </div>
                  </div>
                </Col>

                <Col md={12}>
                  <div className="p-3 rounded-3" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 193, 7, 0.2)"
                  }}>
                    <div className="text-muted small mb-1 fw-semibold">Vai trò</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {userRole === "admin" || Number(userRole) === 1 ? "Quản trị viên" : "Người dùng"}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Các nút hành động */}
              <div className="d-flex justify-content-center gap-3 mt-4 pt-3">
                <Button
                  variant="outline-success"
                  onClick={() => router.push("/auth/doi-pass")}
                  className="px-4 py-2 fw-semibold"
                  style={{ borderRadius: "12px", minWidth: "150px" }}
                >
                  Đổi mật khẩu
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="px-4 py-2 fw-semibold"
                  style={{ borderRadius: "12px", minWidth: "150px" }}
                >
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
