"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

// Chuẩn hóa Interface theo tên cột trong Database (nguoi_dung_id, ten, role)
interface User {
  id?: number; // ID phổ biến
  nguoi_dung_id?: number; // ID từ DB (để khớp với tên cột)
  ten?: string; // Tên từ DB (để khớp với tên cột)
  mat_khau?: string;
  ngay_sinh?: string;
  email: string;
  dia_chi?: string;
  role?: string; // Vai trò từ DB (để khớp với tên cột)
  
  // Giữ lại các trường dự phòng nếu cần, hoặc loại bỏ chúng
  ho_ten?: string; 
  vai_tro?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Lỗi phân tích JSON từ user localStorage:", error);
        localStorage.removeItem("user");
        // Có thể redirect nếu parsing lỗi
      }
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    alert("Đã đăng xuất thành công!");
    router.push("/auth/dangnhap");
  };

  // Hiển thị mật khẩu đã che
  const maskPassword = (password?: string) => {
    if (!password) return "Chưa có";
    return "•".repeat(Math.min(password.length, 12));
  };

  // Định dạng ngày tháng
  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr.toLowerCase() === 'null') return "Chưa có";
    try {
      const date = new Date(dateStr);
      // Kiểm tra tính hợp lệ của ngày
      if (isNaN(date.getTime())) return "Không hợp lệ"; 
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    // Giao diện khi chưa đăng nhập
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

  // --- Lấy dữ liệu và Fallback (Ưu tiên theo tên cột DB) ---
  const userId = user.nguoi_dung_id || user.id || "Chưa có";
  const userName = user.ten || user.ho_ten || "Người dùng";
  const userRole = user.role || user.vai_tro || "user";
  const displayRole = userRole === "admin" || Number(userRole) === 1 ? "Quản trị viên" : "Thành viên";

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
                {displayRole}
              </span>
            </div>

            <Card.Body className="p-4">
              {/* Thông tin chi tiết */}
              <Row className="g-4">
                {/* 1. Mã người dùng (nguoi_dung_id) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Mã người dùng</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {userId}
                    </div>
                  </div>
                </Col>

                {/* 2. Tên người dùng (ten) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Tên người dùng</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {userName}
                    </div>
                  </div>
                </Col>

                {/* 3. Mật khẩu (mat_khau) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Mật khẩu</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem", fontFamily: "monospace" }}>
                      {maskPassword(user.mat_khau)}
                    </div>
                  </div>
                </Col>

                {/* 4. Ngày sinh (ngay_sinh) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Ngày sinh</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {formatDate(user.ngay_sinh)}
                    </div>
                  </div>
                </Col>

                {/* 5. Email (email) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Email</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {user.email || "Chưa có"}
                    </div>
                  </div>
                </Col>

                {/* 6. Địa chỉ (dia_chi) */}
                <Col md={6}>
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Địa chỉ</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {user.dia_chi || "Chưa có"}
                    </div>
                  </div>
                </Col>

                {/* 7. Vai trò (role) */}
                <Col md={12}>
                  <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <div className="text-muted small mb-1 fw-semibold">Vai trò</div>
                    <div className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                      {displayRole}
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