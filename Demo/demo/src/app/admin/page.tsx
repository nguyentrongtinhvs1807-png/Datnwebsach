"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProduct from "@/components/admin.product";
import Sidebar from "@/components/sidebar";
import VoucherManager from "@/components/voucher.manager";
import OrdersPage from "@/app/admin/orders/page";
import AdminDanhMucPage from "@/app/admin/danhmuc/page";
import CommentPage from "./comments/page";

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

function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    topSelling: [],
    topStock: [],
    revenueData: [],
    filteredRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<"month" | "quarter" | "custom">("month");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Hiển thị thời gian đang lọc
  const getFilterLabel = () => {
    if (filterType === "month" && month) {
      const [y, m] = month.split("-");
      return `Tháng ${m}/${y}`;
    }
    if (filterType === "quarter") {
      return `Quý ${quarter} năm ${year}`;
    }
    if (filterType === "custom" && fromDate && toDate) {
      return `Từ ${new Date(fromDate).toLocaleDateString("vi-VN")} đến ${new Date(toDate).toLocaleDateString("vi-VN")}`;
    }
    return "Toàn bộ thời gian";
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [booksRes, usersRes, ordersRes, orderDetailsRes] = await Promise.all([
        fetch("http://localhost:3003/sach"),
        fetch("http://localhost:3003/nguoi_dung"),
        fetch("http://localhost:3003/orders"),
        fetch("http://localhost:3003/don-hang-ct"),
      ]);

      const books = await booksRes.json();
      const users = await usersRes.json();
      const orders = await ordersRes.json();
      const orderDetails = await orderDetailsRes.json();

      // Thống kê cơ bản
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.tong_tien || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = Array.isArray(books) ? books.length : 0;
      const totalUsers = Array.isArray(users)
        ? users.filter((u: any) => (u.role || u.vai_tro) !== "admin").length
        : 0;

      // Top 10 bán chạy (từ chi tiết đơn hàng)
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

      if (Array.isArray(orderDetails)) {
        orderDetails.forEach((ct: any) => {
          const sachId = String(ct.sach_id || ct.Sach_id || ct.book_id || "");
          const qty = Number(ct.so_luong || ct.So_luong || ct.quantity || 0);
          const price = Number(
            ct.gia || ct.Gia || ct.don_gia || ct.Don_gia || ct.price || ct.donGia || ct.gia_ban || ct.giaban || 0
          );
          if (!sachId || qty <= 0 || price <= 0) return;

          if (!productSales[sachId]) {
            const book = books.find((b: any) => String(b.sach_id || b.id) === sachId);
            productSales[sachId] = {
              name: book?.ten_sach || `Sách #${sachId}`,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[sachId].quantity += qty;
          productSales[sachId].revenue += price * qty;
        });
      }

      const topSelling = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Top 10 tồn kho
      const topStock = Array.isArray(books)
        ? books
            .map((b: any) => ({
              name: b.ten_sach || "Không tên",
              stock: Number(b.ton_kho_sach || 0),
            }))
            .sort((a: any, b: any) => b.stock - a.stock)
            .slice(0, 10)
        : [];

      // Lọc doanh thu theo thời gian
      let filteredOrders = orders;

      if (filterType === "month" && month) {
        const [yStr, mStr] = month.split("-");
        const y = Number(yStr);
        const m = Number(mStr);
        filteredOrders = orders.filter((o: any) => {
          const d = new Date(o.ngay_dat);
          return d.getFullYear() === y && d.getMonth() + 1 === m;
        });
      } else if (filterType === "quarter") {
        const startMonth = (quarter - 1) * 3;
        filteredOrders = orders.filter((o: any) => {
          const d = new Date(o.ngay_dat);
          return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() < startMonth + 3;
        });
      } else if (filterType === "custom" && fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filteredOrders = orders.filter((o: any) => {
          const d = new Date(o.ngay_dat);
          return d >= from && d <= to;
        });
      }

      const revenueByDay: Record<string, number> = {};
      filteredOrders.forEach((o: any) => {
        const date = new Date(o.ngay_dat).toLocaleDateString("vi-VN");
        revenueByDay[date] = (revenueByDay[date] || 0) + Number(o.tong_tien || 0);
      });

      const revenueData = Object.entries(revenueByDay)
        .map(([date, total]) => ({ date, total }))
        .sort((a: any, b: any) => {
          const [d1, m1, y1] = a.date.split("/").map(Number);
          const [d2, m2, y2] = b.date.split("/").map(Number);
          return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
        });

      const filteredRevenue = filteredOrders.reduce((s: number, o: any) => s + Number(o.tong_tien || 0), 0);

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        topSelling,
        topStock,
        revenueData,
        filteredRevenue,
      });
    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterType, month, quarter, year, fromDate, toDate]);

  const chartData = {
    labels: stats.revenueData.map((d: any) => d.date),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats.revenueData.map((d: any) => d.total),
        backgroundColor: "rgba(67, 105, 227, 0.8)",
        borderColor: "#4369e3",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} />
        <p className="mt-4 fs-4 text-muted">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: "#21409A" }}>
        Thống Kê Doanh Thu & Sản Phẩm
      </h4>

      {/* Bộ lọc + Doanh thu hiện tại */}
      <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold small">Loại thống kê</label>
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="custom">Tuỳ chọn ngày</option>
            </select>
          </div>

          {filterType === "month" && (
            <div className="col-md-3">
              <label className="form-label fw-bold small">Chọn tháng</label>
              <input type="month" className="form-control form-control-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          )}

          {filterType === "quarter" && (
            <>
              <div className="col-md-2">
                <label className="form-label fw-bold small">Quý</label>
                <select
                  className="form-select form-select-sm"
                  value={quarter}
                  onChange={(e) => setQuarter(Number(e.target.value))}
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-bold small">Năm</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min="2020"
                />
              </div>
            </>
          )}

          {filterType === "custom" && (
            <>
              <div className="col-md-3">
                <label className="form-label fw-bold small">Từ ngày</label>
                <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small">Đến ngày</label>
                <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}

          <div className="col-md-4 col-lg-3">
            <div className="alert alert-success py-3 mb-0 text-center border-0 rounded-3">
              <div className="small fw-bold">Doanh thu {getFilterLabel()}</div>
              <div className="fs-4 fw-bold text-success mt-1">{formatCurrency(stats.filteredRevenue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
        <h5 className="fw-bold mb-3">Biểu đồ doanh thu theo ngày ({getFilterLabel()})</h5>
        <div style={{ height: "380px" }}>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* 2 BẢNG TOP 10 – BẰNG NHAU HOÀN HẢO */}
      <div className="row g-4">
        {/* Top 10 bán chạy */}
        <div className="col-lg-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column">
            <h5 className="fw-bold mb-3 text-success">
              Top 10 Sản Phẩm Bán Chạy Nhất ({getFilterLabel()})
            </h5>
            <div className="table-responsive flex-grow-1">
              <table className="table table-sm table-hover align-middle mb-0 h-100">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "70px" }}>STT</th>
                    <th>Tên sách</th>
                    <th className="text-center" style={{ width: "130px" }}>Số lượng</th>
                    <th className="text-end" style={{ width: "160px" }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSelling.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted">
                        Chưa có dữ liệu bán hàng trong khoảng thời gian này
                      </td>
                    </tr>
                  ) : (
                    stats.topSelling.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="text-center">
                          <span className="badge rounded-pill bg-warning text-dark fw-bold px-3 py-2">
                            {i + 1}
                          </span>
                        </td>
                        <td className="fw-medium">{p.name}</td>
                        <td className="text-center fw-bold text-primary">{p.quantity.toLocaleString()}</td>
                        <td className="text-end fw-bold text-danger">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top 10 tồn kho */}
        <div className="col-lg-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column">
            <h5 className="fw-bold mb-3 text-info">Top 10 Sản Phẩm Tồn Kho Nhiều Nhất</h5>
            <div className="table-responsive flex-grow-1">
              <table className="table table-sm table-hover align-middle mb-0 h-100">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "70px" }}>STT</th>
                    <th>Tên sách</th>
                    <th className="text-center" style={{ width: "140px" }}>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topStock.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted">Không có dữ liệu</td>
                    </tr>
                  ) : (
                    stats.topStock.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="text-center">
                          <span className="badge rounded-pill bg-info text-dark fw-bold px-3 py-2">
                            {i + 1}
                          </span>
                        </td>
                        <td className="fw-medium">{p.name}</td>
                        <td className="text-center fw-bold text-primary">{p.stock.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== QUẢN LÝ NGƯỜI DÙNG ==========
function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  const hideUser = async (id: number) => {
    if (!confirm("Bạn có chắc muốn ẨN người dùng này (không xoá dữ liệu)?")) return;
    try {
      const res = await fetch(`http://localhost:3003/users/${id}/hide`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        alert(" " + data.message);
        setUsers((prev) => prev.map((u) => u.nguoi_dung_id === id ? { ...u, is_hidden: 1 } : u));
      } else {
        alert(" " + (data.error || "Lỗi khi ẩn người dùng"));
      }
    } catch (err) {
      alert("Không thể kết nối đến server!");
    }
  };

  const unhideUser = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3003/users/${id}/unhide`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        alert(" " + data.message);
        setUsers((prev) => prev.map((u) => u.nguoi_dung_id === id ? { ...u, is_hidden: 0 } : u));
      } else {
        alert(" " + (data.error || "Lỗi khi hiện lại người dùng"));
      }
    } catch (err) {
      alert("Không thể kết nối đến server!");
    }
  };

  const filtered = users
    .filter((u) => (showHidden ? true : u.is_hidden !== 1))
    .filter((u) => {
      const keyword = search.toLowerCase();
      const ten = (u.ho_ten || u.ten || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return ten.includes(keyword) || email.includes(keyword);
    });

  return (
    <div>
      <div className="mb-4 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "10px" }}
        />
        <button className="btn btn-outline-secondary" onClick={() => setShowHidden((p) => !p)}>
          {showHidden ? "Ẩn người bị ẩn" : "Hiện người bị ẩn"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Không có người dùng nào hiển thị.</p>
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
                <th style={{ fontWeight: 600 }}>Trạng thái</th>
                <th style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.nguoi_dung_id} style={{ opacity: u.is_hidden === 1 ? 0.5 : 1 }}>
                  <td className="fw-semibold">{u.nguoi_dung_id}</td>
                  <td>{u.ten || u.ho_ten}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`}
                      style={{ padding: "6px 12px", borderRadius: "8px" }}
                    >
                      {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td>
                    {u.is_hidden === 1 ? <span className="badge bg-secondary">Đã ẩn</span> : <span className="badge bg-success">Hiển thị</span>}
                  </td>
                  <td>
                    {u.is_hidden === 1 ? (
                      <button className="btn btn-sm btn-outline-success" onClick={() => unhideUser(u.nguoi_dung_id)}>
                        Hiện lại
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => hideUser(u.nguoi_dung_id)}>
                        Ẩn Người Dùng
                      </button>
                    )}
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
    Promise.all([
      fetch("http://localhost:3003/comments").then((r) => r.json()),
      fetch("http://localhost:3003/sach").then((r) => r.json()),
      fetch("http://localhost:3003/users").then((r) => r.json()),
    ]).then(([c, s, u]) => {
      setComments(Array.isArray(c) ? c : []);
      setSachs(Array.isArray(s) ? s : []);
      setUsers(Array.isArray(u) ? u : []);
    });
  }, []);

  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    await fetch(`http://localhost:3003/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.binh_luan_id !== id));
  };

  const getSachName = (id: number) => sachs.find((s) => s.sach_id === id)?.ten_sach || `Sách #${id}`;
  const getUserName = (id: number) => users.find((u) => u.nguoi_dung_id === id)?.ten || `User #${id}`;

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
                  <td className="fw-semibold">{c.binh_luan_id}</td>
                  <td>{getSachName(c.sach_id)}</td>
                  <td>{getUserName(c.nguoi_dung_id)}</td>
                  <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{c.nd_bl}</td>
                  <td>{new Date(c.ngay_bl).toLocaleString("vi-VN")}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteComment(c.binh_luan_id)}>
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

// ========== TRANG ADMIN CHÍNH ==========
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
      alert("Bạn không có quyền truy cập trang này!");
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: "2px solid #e0e0e0" }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#21409A" }}>Bảng điều khiển quản trị</h2>
            <p className="text-muted mb-0 small">Quản lý và theo dõi hệ thống</p>
          </div>
          {user && (
            <div className="text-end p-3 rounded-3" style={{ background: "linear-gradient(90deg, #fff9e6 0%, #ffeecf 100%)" }}>
              <div className="fw-semibold text-dark">Xin chào, {user.ten}</div>
              <small className="text-muted">{user.email}</small>
            </div>
          )}
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4">
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
              <CommentPage />
            </>
          )}
          {activeTab === "users" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý người dùng</h4>
              <UserManager />
            </>
          )}
          {activeTab === "orders" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý đơn hàng</h4>
              <OrdersPage />
            </>
          )}
          {activeTab === "voucher" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý Voucher</h4>
              <VoucherManager />
            </>
          )}
          {activeTab === "danhmuc" && (
            <>
              <h4 className="fw-bold text-primary mb-3">Quản lý Danh Mục</h4>
              <AdminDanhMucPage />
            </>
          )}
        </div>
      </main>
    </div>
  );
}