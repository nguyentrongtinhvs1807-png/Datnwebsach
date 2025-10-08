'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";

const Header = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Lắng nghe sự kiện login từ LoginForm
      const handleLogin = () => {
        const newUser = localStorage.getItem("user");
        if (newUser) setUser(JSON.parse(newUser));
      };

      window.addEventListener("login", handleLogin);
      return () => window.removeEventListener("login", handleLogin);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth/dangnhap");
  };

  // ✅ kiểm tra admin
  const isAdmin = user && (user.vai_tro === "admin" || Number(user.vai_tro) === 1);
  console.log("User trong Header:", user);

  return (
    <header className="bg-light shadow-sm py-3">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Link
          href="/home"
          className="fw-bold text-primary fs-4 text-decoration-none"
        >
          Pibook 
        </Link>

        {/* Navigation */}
        <nav className="d-flex align-items-center gap-4 w-100 justify-content-center">
          <Link href="/home" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Trang chủ
          </Link>
          <Link href="/products" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Sản phẩm
          </Link>
          <Link href="/policy" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Chính sách
          </Link>
          <Link href="/contact" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Liên hệ
          </Link>
          <Link href="/about" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Giới Thiệu
          </Link>
          <Link href="/orders" className="text-dark fw-semibold text-decoration-none nav-link-hover">
            Đơn Hàng
          </Link>
          {!user && (
            <Link href="/auth/dangnhap" className="text-dark fw-semibold text-decoration-none nav-link-hover">
              Đăng Nhập
            </Link>
          )}
        </nav>

        {/* User + Cart */}
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <Dropdown>
              <Dropdown.Toggle
                id="dropdown-user"
                variant="light"
                className="border-0 bg-transparent p-0"
              >
                <i className="bi bi-person-circle fs-3"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu
                align="end"
                className="d-flex flex-row gap-3 px-3 py-2 shadow"
                style={{
                  minWidth: "max-content",
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  zIndex: 1050,
                }}
              >
                {isAdmin ? (
                  <>
                    <Dropdown.Item as={Link} href="/admin/products">
                      Quản lý sản phẩm
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/admin/orders">
                      Quản lý đơn hàng
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/admin/users">
                      Quản lý user
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/admin/comments">
                      Quản lý bình luận
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/admin/dashboard">
                      Quản lý Thống Kê
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/admin/voucher">
                      Quản lý Voucher
                    </Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} href="/account">
                      Tài khoản của tôi
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/auth/doi-pass">
                      Đổi mật khẩu
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Item
                  onClick={handleLogout}
                  className="text-danger"
                >
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Link href="/auth/dangnhap" className="text-dark fs-5">
              <i className="bi bi-person-fill fs-3"></i>
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className="text-dark fs-5 position-relative">
            <i className="bi bi-bag-fill fs-3"></i>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
