"use client";

import { Button } from "react-bootstrap";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }: any) {
  return (
    <aside
      className="bg-dark text-white p-4 d-flex flex-column"
      style={{ 
        width: "260px", 
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
      }}
    >
      {/* Tiêu đề */}
      <div className="text-center border-bottom pb-3 mb-3">
        <h4 className="fw-bold mb-0" style={{ color: "#ffc107", letterSpacing: "0.5px" }}>Pibook Admin</h4>
        <small className="text-muted">Trang quản trị</small>
      </div>

      {/* Menu chính */}
      <nav className="flex-grow-1">
        <ul className="list-unstyled">
          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "dashboard" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("dashboard")}
          >
            Trang chủ
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "products" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("products")}
          >
            Quản lý sản phẩm
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "comments" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("comments")}
          >
            Quản lý bình luận
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "users" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("users")}
          >
            Người dùng
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "orders" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("orders")}
          >
            Đơn hàng
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "voucher" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("voucher")}
          >
            Quản lý Voucher
          </li>

          <li
            className={`py-2 px-3 rounded mb-2 ${
              activeTab === "danhmuc" ? "bg-warning text-dark" : "hover-bg-light"
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setActiveTab("danhmuc")}
          >
            Quản lý Danh Mục
          </li>
        </ul>
      </nav>

      {/* Đăng xuất */}
      <div className="mt-auto pt-3 border-top">
        <Button
          variant="outline-light"
          className="w-100 fw-semibold"
          onClick={handleLogout}
          style={{ borderRadius: "8px" }}
        >
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
