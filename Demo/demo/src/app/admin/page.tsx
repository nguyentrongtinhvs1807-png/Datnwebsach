"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProduct from "@/components/admin.product";
import Sidebar from "@/components/sidebar";
import VoucherManager from "@/components/voucher.manager";
import OrdersPage from "@/app/admin/orders/page"; 
import AdminDanhMucPage from "@/app/admin/danhmuc/page"; // ✅ Gọi đúng trang quản lý danh mục
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ========== QUẢN LÝ NGƯỜI DÙNG ==========
function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    await fetch(`http://localhost:3003/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.nguoi_dung_id !== id));
  };

  const filtered = users.filter((u) => {
    const ten = (u?.ten || u?.ho_ten || "").toString().toLowerCase();
    const email = (u?.email || "").toString().toLowerCase();
    const keyword = search.toLowerCase();
    return ten.includes(keyword) || email.includes(keyword);
  });

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "10px" }}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Không có người dùng nào.</p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
              <tr>
                <th style={{ fontWeight: 600 }}>ID</th>
                <th style={{ fontWeight: 600 }}>Tên</th>
                <th style={{ fontWeight: 600 }}>Email</th>
                <th style={{ fontWeight: 600 }}>Vai trò</th>
                <th style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.nguoi_dung_id} style={{ transition: "background 0.2s" }}>
                  <td className="fw-semibold">{u.nguoi_dung_id}</td>
                  <td>{u.ten || u.ho_ten}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`} style={{ padding: "6px 12px", borderRadius: "8px" }}>
                      {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteUser(u.nguoi_dung_id)}
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                    >
                      Ẩn Người Dùng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ========== QUẢN LÝ BÌNH LUẬN ==========
function CommentManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [sachs, setSachs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/comments")
      .then((res) => res.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));

    fetch("http://localhost:3003/sach")
      .then((res) => res.json())
      .then((data) => setSachs(Array.isArray(data) ? data : []))
      .catch(() => setSachs([]));

    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    await fetch(`http://localhost:3003/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.binh_luan_id !== id));
  };

  const getSachName = (id: number) =>
    sachs.find((s) => s.sach_id === id)?.ten_sach || `Sách #${id}`;
  const getUserName = (id: number) =>
    users.find((u) => u.nguoi_dung_id === id)?.ten || `User #${id}`;

  const filtered = comments.filter((c) => {
    const userName = getUserName(c.nguoi_dung_id).toLowerCase();
    const content = (c.nd_bl || "").toLowerCase();
    const keyword = search.toLowerCase();
    return userName.includes(keyword) || content.includes(keyword);
  });

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo người dùng hoặc nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "10px" }}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Không có bình luận nào.</p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
              <tr>
                <th style={{ fontWeight: 600 }}>ID</th>
                <th style={{ fontWeight: 600 }}>Sách</th>
                <th style={{ fontWeight: 600 }}>Người dùng</th>
                <th style={{ fontWeight: 600 }}>Nội dung</th>
                <th style={{ fontWeight: 600 }}>Ngày bình luận</th>
                <th style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.binh_luan_id} style={{ transition: "background 0.2s" }}>
                  <td className="fw-semibold">{c.binh_luan_id}</td>
                  <td>{getSachName(c.sach_id)}</td>
                  <td>{getUserName(c.nguoi_dung_id)}</td>
                  <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{c.nd_bl}</td>
                  <td>{new Date(c.ngay_bl).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteComment(c.binh_luan_id)}
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                    >
                      Ẩn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ========== DASHBOARD ==========
function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        products: 32,
        users: 105,
        orders: 57,
        revenue: [
          { month: "Tháng 1", total: 4200000 },
          { month: "Tháng 2", total: 5800000 },
          { month: "Tháng 3", total: 6500000 },
          { month: "Tháng 4", total: 7200000 },
          { month: "Tháng 5", total: 6900000 },
        ],
      });
    }, 1000);
  }, []);

  if (!stats) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="mt-3 text-muted">Đang tải dữ liệu thống kê...</p>
    </div>
  );

  const chartData = {
    labels: stats.revenue.map((r: any) => r.month),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats.revenue.map((r: any) => r.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: "#21409A" }}>Thống kê tổng quan</h4>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-4 rounded-4 shadow-sm" style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}>
            <h5 className="mb-2" style={{ opacity: 0.9 }}>Sản phẩm</h5>
            <p className="fs-1 fw-bold mb-0">{stats.products}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 shadow-sm" style={{ 
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white"
          }}>
            <h5 className="mb-2" style={{ opacity: 0.9 }}>Đơn hàng</h5>
            <p className="fs-1 fw-bold mb-0">{stats.orders}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 shadow-sm" style={{ 
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white"
          }}>
            <h5 className="mb-2" style={{ opacity: 0.9 }}>Người dùng</h5>
            <p className="fs-1 fw-bold mb-0">{stats.users}</p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm p-4 rounded-4" style={{ border: "1px solid #e0e0e0" }}>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

// ========== TRANG ADMIN ==========
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/dangnhap");
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "admin") {
      alert("⚠️ Bạn không có quyền truy cập trang này!");
      router.push("/");
    } else {
      setUser(parsed);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/dangnhap");
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: "#f5f7fa" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: "2px solid #e0e0e0" }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#21409A", letterSpacing: "0.5px" }}>Bảng điều khiển quản trị</h2>
            <p className="text-muted mb-0 small">Quản lý và theo dõi hệ thống</p>
          </div>
          {user && (
            <div className="text-end p-3 rounded-3" style={{ background: "linear-gradient(90deg, #fff9e6 0%, #ffeecf 100%)", minWidth: "200px" }}>
              <div className="fw-semibold text-dark">Xin chào, {user.ten}</div>
              <small className="text-muted">{user.email}</small>
            </div>
          )}
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: "1px solid #e8e8e8" }}>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "products" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý sản phẩm</h4>
              <AdminProduct />
            </>
          )}
          {activeTab === "comments" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý bình luận</h4>
              <CommentManager />
            </>
          )}
          {activeTab === "users" && (
            <>
              <h4 className="fw-bold text-primary mb-3"> Quản lý người dùng</h4>
              <UserManager />
            </>
          )}
          {activeTab === "orders" && (
            <>
              <h4 className="fw-bold text-primary mb-3"> Quản lý đơn hàng</h4>
              <OrdersPage />
            </>
          )}
          {activeTab === "voucher" && (
            <>
              <h4 className="fw-bold text-primary mb-3"> Quản lý Voucher</h4>
              <VoucherManager />
            </>
          )}
          {activeTab === "danhmuc" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý Danh Mục</h4>
              <AdminDanhMucPage /> {/* ✅ Gọi đúng trang danh mục */}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
