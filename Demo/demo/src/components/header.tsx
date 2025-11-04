"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";

type UserShape = {
  id?: number;
  ten?: string;
  email?: string;
  role?: string | number;
  vai_tro?: string | number;
};

export default function Header() {
  const [user, setUser] = useState<UserShape | null>(null);
  const [query, setQuery] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }

    const handleLogin = () => {
      const s = localStorage.getItem("user");
      if (s) setUser(JSON.parse(s));
      else setUser(null);
    };

    window.addEventListener("login", handleLogin);
    return () => window.removeEventListener("login", handleLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth/dangnhap");
  };

  const isAdmin = Boolean(
    user && (user.role === "admin" || user.vai_tro === "admin" || Number(user.role) === 1 || Number(user.vai_tro) === 1)
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <>
      <header className="site-header shadow-sm">
        <div className="container header-inner d-flex align-items-center justify-content-between">
          {/* LOGO */}
          <Link href="/" className="logo d-flex align-items-center text-decoration-none">
            <img src="/image/Grace.png" alt="Pibook" className="logo-img" />
            <span className="brand-name"></span>
          </Link>

          {/* NAVIGATION */}
          <nav className="header-nav d-none d-md-flex align-items-center justify-content-center flex-grow-1">
            <Link href="/home" className="nav-link">Trang chủ</Link>
            <Link href="/products" className="nav-link">Sản phẩm</Link>
            <Link href="/policy" className="nav-link">Chính sách</Link>
            <Link href="/contact" className="nav-link">Liên hệ</Link>
            <Link href="/about" className="nav-link">Giới thiệu</Link>
            <Link href="/orders" className="nav-link">Đơn hàng Của Bạn</Link>
          </nav>

          {/* SEARCH + USER + CART */}
          <div className="header-right d-flex align-items-center gap-4">
            {/* SEARCH */}
            <form className="search-form d-flex" onSubmit={onSearchSubmit}>
              <input
                type="text"
                placeholder="🔍 Tìm sách, truyện, dụng cụ..."
                className="form-control search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-warning btn-search" aria-label="Tìm">
                <i className="bi bi-search text-dark"></i>
              </button>
            </form>

            {/* HOTLINE */}
            <div className="d-none d-lg-flex flex-column text-end hotline">
              <small className="text-muted">Hotline</small>
              <strong>0857 226 757</strong>
            </div>

            {/* USER */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user" className="user-toggle">
                  <i className="bi bi-person-circle fs-4"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  {isAdmin ? (
                    <>
                      <Dropdown.Item as={Link} href="/account">Tài khoản của tôi</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/auth/doi-pass">Đổi mật khẩu</Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} href="/account">Tài khoản của tôi</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/auth/doi-pass">Đổi mật khẩu</Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link href="/auth/dangnhap" className="btn btn-outline-dark btn-sm">
                Đăng nhập
              </Link>
            )}

            {/* CART */}
            <Link href="/cart" className="btn btn-outline-dark btn-sm position-relative cart-btn">
              <i className="bi bi-bag-fill"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* STYLE */}
      <style jsx>{`
        .site-header {
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 1030;
          border-bottom: 1px solid #eee;
        }

        .header-inner {
          padding: 0.9rem 0;
        }

        .logo-img {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          object-fit: cover;
        }

        .brand-name {
          font-weight: 700;
          color: #2c3e50;
          font-size: 1.1rem;
          margin-left: 10px;
        }

        /* NAV LINK */
        .header-nav {
          gap: 1.6rem;
        }

        .header-nav .nav-link {
          color: #2c3e50;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 14px;
          transition: all 0.2s ease;
        }

        .header-nav .nav-link:hover {
          background: rgba(255, 193, 7, 0.2); /* vàng nhạt */
          color: #d4a017; /* vàng đậm */
          transform: translateY(-2px);
        }

        /* SEARCH */
        .search-form {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .search-input {
          width: 240px;
          border-radius: 25px;
          border: 1px solid #e6e6e6;
          padding: 0.5rem 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #ffc107;
          box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
        }

        .btn-search {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-toggle {
          background: transparent;
          border: none;
        }

        .cart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 991px) {
          .header-nav {
            display: none;
          }
          .search-input {
            width: 160px;
          }
        }

        @media (max-width: 576px) {
          .brand-name {
            display: none;
          }
          .logo-img {
            width: 48px;
            height: 48px;
          }
          .search-input {
            width: 130px;
          }
          .hotline {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
