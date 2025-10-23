"use client";

import { Button } from "react-bootstrap";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }: any) {
  return (
    <aside
      className="bg-dark text-white p-3 d-flex flex-column"
      style={{ width: "250px" }}
    >
      <h4 className="fw-bold text-center border-bottom pb-2">📚 Pibook Admin</h4>

      <nav className="flex-grow-1 mt-4">
        <ul className="list-unstyled">
          <li
            className={`py-2 px-3 rounded ${
              activeTab === "dashboard" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("dashboard")}
          >
            🏠 Trang chủ
          </li>

          <li
            className={`py-2 px-3 rounded ${
              activeTab === "products" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("products")}
          >
            📦 Quản lý sản phẩm
          </li>

          <li
            className={`py-2 px-3 rounded ${
              activeTab === "comments" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("comments")}
          >
            💬 Quản lý bình luận
          </li>

          <li
            className={`py-2 px-3 rounded ${
              activeTab === "users" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("users")}
          >
            👤 Người dùng
          </li>

          <li
            className={`py-2 px-3 rounded ${
              activeTab === "orders" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("orders")}
          >
            🧾 Đơn hàng
          </li>

          {/* ✅ Thêm mục Quản lý Voucher */}
          <li
            className={`py-2 px-3 rounded ${
              activeTab === "voucher" ? "bg-secondary" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("voucher")}
          >
            🎟️ Quản lý Voucher
          </li>
        </ul>
      </nav>

      <div className="mt-auto">
        <Button
          variant="outline-light"
          className="w-100 fw-semibold"
          onClick={handleLogout}
        >
          🚪 Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
