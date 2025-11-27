"use client";

import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, handleLogout }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { key: "dashboard", label: "Trang chủ", icon: "fas fa-home" },
    { key: "products", label: "Quản lý sản phẩm", icon: "fas fa-book-open" },
    { key: "comments", label: "Quản lý bình luận", icon: "fas fa-comments" },
    { key: "users", label: "Người dùng", icon: "fas fa-users" },
    { key: "orders", label: "Đơn hàng", icon: "fas fa-shopping-cart", highlight: true },
    { key: "voucher", label: "Quản lý Voucher", icon: "fas fa-ticket-alt" },
    { key: "danhmuc", label: "Quản lý Danh Mục", icon: "fas fa-th-list" },
  ];

  const handleNavigate = (key: string) => {
    setActiveTab(key);
    // Nếu dùng Next.js App Router thì có thể route như này (tuỳ cấu trúc dự án)
    // router.push(`/admin/${key === "dashboard" ? "" : key}`);
  };

  return (
    <>
      {/* SIDEBAR CỨNG + ĐẸP TUYỆT ĐỐI */}
      <aside
        className="position-fixed start-0 top-0 h-100 d-flex flex-column text-white overflow-hidden"
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #1e1e2e 0%, #16213e 70%, #0f172a 100%)",
          zIndex: 1050,
          boxShadow: "6px 0 30px rgba(0,0,0,0.5)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header - Logo */}
        <div className="p-4 text-center border-bottom border-secondary border-opacity-30">
          <h1 className="mb-1 fw-bold" style={{ fontSize: "2.3rem" }}>
            <span style={{
              background: "linear-gradient(90deg, #FFD700, #FFB800, #FF8C00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Pibook
            </span>
          </h1>
          <p className="mb-0 fw-medium text-warning">Admin Panel</p>
          <small className="text-muted">Trung tâm quản trị</small>
        </div>

        {/* Menu */}
        <nav className="flex-grow-1 px-3 py-4">
          <ul className="list-unstyled mb-0">
            {menuItems.map((item) => (
              <li key={item.key} className="mb-2">
                <div
                  onClick={() => handleNavigate(item.key)}
                  className={`d-flex align-items-center gap-3 px-4 py-3 rounded-3 cursor-pointer transition-all ${
                    activeTab === item.key
                      ? item.highlight
                        ? "bg-warning text-dark fw-bold shadow-lg"
                        : "bg-primary bg-opacity-20 text-white border border-primary border-opacity-50"
                      : "hover-bg-white hover-bg-opacity-10"
                  }`}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.05rem",
                    fontWeight: activeTab === item.key ? "600" : "500",
                    background: item.highlight && activeTab === item.key ? "#FFC107" : "transparent",
                    color: item.highlight && activeTab === item.key ? "#212529" : "#e2e8f0",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== item.key) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "translateX(6px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== item.key) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  <i className={`${item.icon} fa-fw`} style={{ width: "20px", fontSize: "1.1rem" }}></i>
                  <span>{item.label}</span>
                  {item.highlight && activeTab === item.key && (
                    <span className="ms-auto fw-bold">HOT</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-top border-secondary border-opacity-30">
          <Button
            variant="outline-danger"
            className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
            style={{
              borderRadius: "12px",
              padding: "12px",
              fontSize: "1.05rem",
              borderWidth: "2px",
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Đăng xuất
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center py-3 border-top border-secondary border-opacity-10">
          <small className="text-muted">© 2025 Pibook Admin v2.0</small>
        </div>
      </aside>

      {/* Đẩy nội dung chính sang phải */}
      <style jsx global>{`
        .hover-bg-white:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .hover-bg-opacity-10:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .transition-all {
          transition: all 0.25s ease;
        }
        body {
          padding-left: 280px !important;
        }
        @media (max-width: 992px) {
          aside {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          body {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}