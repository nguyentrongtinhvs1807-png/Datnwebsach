"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProduct from "@/components/admin.product";
import Sidebar from "@/components/sidebar";
import VoucherManager from "@/components/voucher.manager"; // ✅ Thêm dòng này
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
      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Tìm kiếm theo tên hoặc email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-muted text-center">Không có người dùng nào.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.nguoi_dung_id}>
                  <td>{u.nguoi_dung_id}</td>
                  <td>{u.ten || u.ho_ten}</td>
                  <td>{u.email}</td>
                  <td>{u.role === "admin" ? "Quản trị viên" : "Người dùng"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteUser(u.nguoi_dung_id)}
                    >
                      ❌ Ẩn Người Dùng
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
      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Tìm kiếm theo người dùng hoặc nội dung..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-muted text-center">Không có bình luận nào.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Sách</th>
                <th>Người dùng</th>
                <th>Nội dung</th>
                <th>Ngày bình luận</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.binh_luan_id}>
                  <td>{c.binh_luan_id}</td>
                  <td>{getSachName(c.sach_id)}</td>
                  <td>{getUserName(c.nguoi_dung_id)}</td>
                  <td>{c.nd_bl}</td>
                  <td>{new Date(c.ngay_bl).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteComment(c.binh_luan_id)}
                    >
                      ❌ Ẩn
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

// ========== QUẢN LÝ ĐƠN HÀNG ==========
function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));

    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  const getUserName = (id: number) =>
    users.find((u) => u.nguoi_dung_id === id)?.ten || `User #${id}`;

  const deleteOrder = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá đơn hàng này?")) return;
    await fetch(`http://localhost:3003/orders/${id}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.don_hang_id !== id));
  };

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch(`http://localhost:3003/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: newStatus }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.don_hang_id === id ? { ...o, trang_thai: newStatus } : o))
    );
  };

  const filtered = orders.filter((o) => {
    const userName = getUserName(o.nguoi_dung_id).toLowerCase();
    const keyword = search.toLowerCase();
    return userName.includes(keyword) || o.trang_thai.toLowerCase().includes(keyword);
  });

  return (
    <div>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Tìm kiếm theo người dùng hoặc trạng thái..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-muted text-center">Không có đơn hàng nào.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.don_hang_id}>
                  <td>{o.don_hang_id}</td>
                  <td>{getUserName(o.nguoi_dung_id)}</td>
                  <td>{o.tong_tien.toLocaleString("vi-VN")} ₫</td>
                  <td>{new Date(o.ngay_dat).toLocaleString("vi-VN")}</td>
                  <td>
                    <select
                      value={o.trang_thai}
                      onChange={(e) => updateStatus(o.don_hang_id, e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteOrder(o.don_hang_id)}
                    >
                      ❌ Xoá
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

  if (!stats) return <p>⏳ Đang tải dữ liệu thống kê...</p>;

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
      <h4 className="fw-bold text-primary mb-4">📊 Thống kê tổng quan</h4>
      <div className="row text-center mb-4">
        <div className="col-md-4">
          <div className="bg-primary bg-opacity-25 p-3 rounded">
            <h5>Sản phẩm</h5>
            <p className="fs-3 fw-bold">{stats.products}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-success bg-opacity-25 p-3 rounded">
            <h5>Đơn hàng</h5>
            <p className="fs-3 fw-bold">{stats.orders}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-warning bg-opacity-25 p-3 rounded">
            <h5>Người dùng</h5>
            <p className="fs-3 fw-bold">{stats.users}</p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow p-4 rounded-3">
        <Bar data={chartData} />
      </div>
    </div>
  );
}

// ========== TRANG QUẢN TRỊ ==========
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
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h2 className="fw-bold text-uppercase">Bảng điều khiển quản trị</h2>
          {user && (
            <div className="text-end">
              <div className="fw-semibold">👋 Xin chào, {user.ten}</div>
              <small className="text-muted">{user.email}</small>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3 shadow-sm p-4">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "products" && (
            <>
              <h4 className="fw-bold text-primary mb-3">📦 Quản lý sản phẩm</h4>
              <AdminProduct />
            </>
          )}
          {activeTab === "comments" && (
            <>
              <h4 className="fw-bold text-primary mb-3">💬 Quản lý bình luận</h4>
              <CommentManager />
            </>
          )}
          {activeTab === "users" && (
            <>
              <h4 className="fw-bold text-primary mb-3">👤 Quản lý người dùng</h4>
              <UserManager />
            </>
          )}
          {activeTab === "orders" && (
            <>
              <h4 className="fw-bold text-primary mb-3">🧾 Quản lý đơn hàng</h4>
              <OrderManager />
            </>
          )}
          {activeTab === "voucher" && (
            <>
              <h4 className="fw-bold text-primary mb-3">🎟️ Quản lý Voucher</h4>
              <VoucherManager /> {/* ✅ Gọi component VoucherManager */}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
