'use client';

// Sử dụng imports gốc của Next.js
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';

// Định nghĩa kiểu dữ liệu cho người dùng
type UserShape = {
  id?: number;
  ten?: string;
  email?: string;
  // Chuẩn hóa role và vai_tro thành string hoặc number
  role?: string | number; 
  vai_tro?: string | number;
};


// ĐÃ SỬA: Đếm đúng số sản phẩm (mặt hàng), không phải tổng số lượng
const calculateCartCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) return 0;
    const items = JSON.parse(cart);
    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
};

export default function Header() {
  const [user, setUser] = useState<UserShape | null>(null);
  const [query, setQuery] = useState<string>('');
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const router = useRouter();
  const pathname = usePathname();

  // Dùng useMemo để tính toán isAdmin chỉ khi 'user' thay đổi
  const isAdmin = useMemo(() => {
    return Boolean(
      user &&
        (user.role === 'admin' ||
          user.vai_tro === 'admin' ||
          Number(user.role) === 1 ||
          Number(user.vai_tro) === 1)
    );
  }, [user]);

  // useEffect để xử lý các tác vụ chỉ chạy trên client (localStorage, event listeners)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  
    // CHỈ CẬP NHẬT CART KHI ĐĂNG NHẬP (khi có token)
    const token = localStorage.getItem("token");
    if (token) {
      setCartItemCount(calculateCartCount());
    } else {
      setCartItemCount(0);
    }
  
    // --- Thiết lập Listeners ---
    const handleLogin = () => {
      const s = localStorage.getItem('user');
      if (s) {
        try {
          setUser(JSON.parse(s));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
  
      // cập nhật lại giỏ hàng sau đăng nhập
      const tokenAfter = localStorage.getItem("token");
      setCartItemCount(tokenAfter ? calculateCartCount() : 0);
    };
  
    const handleCartUpdate = () => {
      const tokenNow = localStorage.getItem("token");
      setCartItemCount(tokenNow ? calculateCartCount() : 0);
    };
  
    window.addEventListener('login', handleLogin);
    window.addEventListener('cart-update', handleCartUpdate);
  
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('cart-update', handleCartUpdate);
    };
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Gửi sự kiện để cập nhật trạng thái giỏ hàng sau khi đăng xuất
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-update')); 
    }
    router.push('/auth/dangnhap');
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  // ==========================================================
  // LOGIC HIỂN THỊ: PHÂN BIỆT ADMIN VÀ CLIENT
  // ==========================================================
  
  // 1. Giao diện tối giản khi đang ở trang ADMIN
  if (pathname?.startsWith('/admin')) {
    return (
      <header className="admin-header p-3 d-flex justify-content-end bg-white border-bottom shadow-sm">
        {user ? (
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="dropdown-user" className="user-toggle">
              <i className="bi bi-person-circle fs-4"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item href="/account">Tài khoản của tôi</Dropdown.Item>
              <Dropdown.Item href="/auth/doi-pass">Đổi mật khẩu</Dropdown.Item>
              <Dropdown.Item href="/orders">Đơn hàng của bạn</Dropdown.Item>
              <Dropdown.Divider />
              {/* Nút Đăng xuất - ÁP DỤNG HOVER ĐỎ */}
              <Dropdown.Item onClick={handleLogout} className="text-danger text-danger-hover">
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link href="/auth/dangnhap" className="btn btn-outline-dark btn-sm">
            Đăng nhập
          </Link>
        )}
      </header>
    );
  }

  // 2. Giao diện đầy đủ cho các trang CLIENT/GUEST
  return (
    <>
      <header className="site-header shadow-sm">
        <div className="container header-inner d-flex align-items-center justify-content-between">
          {/* LOGO */}
          <Link href="/" className="logo d-flex align-items-center text-decoration-none">
            <img src="/image/logo chinh.jpg" alt="Pibook" className="logo-img" />
            <span className="brand-name"></span>
          </Link>

          {/* NAVIGATION - Cấu trúc đã sửa để đảm bảo Hover hoạt động */}
          <nav className="header-nav d-none d-md-flex align-items-center justify-content-center flex-grow-1">
            <Link href="/home" legacyBehavior passHref>
              <a className="nav-link">Trang chủ</a>
            </Link>
            <Link href="/products" legacyBehavior passHref>
              <a className="nav-link">Sản phẩm</a>
            </Link>
            <Link href="/policy" legacyBehavior passHref>
              <a className="nav-link">Chính sách</a>
            </Link>
            <Link href="/contact" legacyBehavior passHref>
              <a className="nav-link">Liên hệ</a>
            </Link>
            <Link href="/about" legacyBehavior passHref>
              <a className="nav-link">Giới thiệu</a>
            </Link>
          </nav>

          {/* SEARCH + HOTLINE + CART + USER */}
          <div className="header-right d-flex align-items-center gap-4">
            {/* SEARCH */}
            <form className="search-form" onSubmit={onSearchSubmit}>
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

            {/* CART */}
            <Link href="/cart" className="btn btn-outline-dark position-relative cart-btn">
              <i className="bi bi-bag-fill fs-5"></i> 
              {cartItemCount > 0 && (
                <span className="cart-badge badge rounded-pill bg-danger">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* USER DROP DOWN */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user" className="user-toggle">
                  <i className="bi bi-person-circle fs-4"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item href="/account">Tài khoản của tôi</Dropdown.Item>
                  <Dropdown.Item href="/auth/doi-pass">Đổi mật khẩu</Dropdown.Item>
                  <Dropdown.Item href="/orders">Đơn hàng của bạn</Dropdown.Item>
                  
                  {isAdmin && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/admin" className="text-primary fw-semibold">
                        🔧 Trang quản trị
                      </Dropdown.Item>
                    </>
                  )}
                  
                  <Dropdown.Divider />
                  {/* Nút Đăng xuất - ÁP DỤNG HOVER ĐỎ */}
                  <Dropdown.Item onClick={handleLogout} className="text-danger text-danger-hover">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link href="/auth/dangnhap" className="btn btn-outline-dark btn-sm">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* STYLE (jsx style block) */}
      <style jsx>{`
        /* ... CSS của bạn ... */
        .site-header {
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 1030;
          border-bottom: 1px solid #eee;
        }

        .header-inner {
          padding: 1.25rem 0; 
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
          margin-left: 12px;
        }

        .header-nav {
          gap: 1.2rem; 
        }
        
        .header-nav .nav-link {
          color: #2c3e50;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 10px; 
          transition: all 0.2s ease;
          text-decoration: none; 
          display: inline-block; 
        }

        /* ✨ ĐÃ CHỈNH: Hover màu VÀNG cho NAV links */
        .header-nav .nav-link:hover,
        .header-nav .nav-link:focus { 
          background: #ffc107 !important; /* Đổi thành màu vàng Bootstrap */
          color: #2c3e50 !important;     /* Đổi thành màu đen/tối để dễ đọc */
          transform: translateY(-2px);
        }
        
        /* Hover màu đỏ cho nút Đăng xuất (GIỮ NGUYÊN MÀU ĐỎ CHO LOGOUT) */
        .dropdown-menu .text-danger-hover {
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .dropdown-menu .text-danger-hover:hover {
            color: #fff !important; 
            background-color: #dc3545 !important; 
        }
        
        .search-form {
          display: flex;
          align-items: stretch;
        }

        .search-input {
          width: 260px; 
          border-radius: 25px;
          border-top-right-radius: 0; 
          border-bottom-right-radius: 0;
          border-right: 1px solid #e6e6e6; 
          border-color: #e6e6e6;
          padding: 0.6rem 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #ffc107;
          box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
          position: relative; 
          z-index: 2;
        }

        .btn-search {
          margin-left: -1px; 
          border-radius: 0 25px 25px 0;
          width: 50px; 
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .user-toggle {
          background: transparent;
          border: none;
        }

        .cart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .cart-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          padding: 0.3em 0.6em;
          font-size: 0.8em;
          font-weight: 700;
          line-height: 1;
          z-index: 10;
          border: 3px solid #fff;
        }

        /* Responsive Adjustments */
        @media (max-width: 991px) {
          .header-nav {
            display: none;
          }
          .search-input {
            width: 180px; 
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
            width: 140px; 
            padding: 0.5rem 0.8rem;
          }
          .btn-search {
            width: 40px; 
            height: auto;
          }
          .hotline {
            display: none;
          }
          .header-right {
            gap: 0.8rem !important; 
          }
          .cart-btn {
             padding: 0.4rem 0.6rem;
          }
          .cart-badge {
             top: -5px; 
             right: -5px;
             font-size: 0.7em;
          }
        }
      `}</style>
    </>
  );
}