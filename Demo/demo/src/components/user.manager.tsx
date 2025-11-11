"use client";

import React, { useEffect, useState, useCallback } from "react";

interface User {
  nguoi_dung_id?: number;
  ho_ten?: string;
  email?: string;
  ngay_sinh?: string;
  dia_chi?: string;
  role?: string;
  is_hidden?: number; // 0 = hiện, 1 = ẩn
}

// 🔹 Hàm fetch người dùng từ server
const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch("http://localhost:3003/users");
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("❌ Lỗi khi tải users:", err);
    return [];
  }
};

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  // 🔹 Lấy danh sách người dùng
  const loadUsers = useCallback(async () => {
    const data = await fetchUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 🔹 Ẩn người dùng
  const hideUser = async (id?: number) => {
    if (!id) return alert("Không có ID hợp lệ!");
    if (!confirm("Bạn có chắc muốn ẩn người dùng này không?")) return;

    try {
      const res = await fetch(`http://localhost:3003/users/${id}/hide`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        alert("👻 " + data.message);
        await loadUsers();
      } else {
        alert("❌ " + (data.error || "Lỗi khi ẩn người dùng"));
      }
    } catch (err) {
      console.error("Lỗi khi gọi API hide:", err);
      alert("Không thể kết nối đến server!");
    }
  };

  // 🔹 Hiện lại người dùng
  const unhideUser = async (id?: number) => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3003/users/${id}/unhide`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        alert("👁️ " + data.message);
        await loadUsers();
      } else {
        alert("❌ " + (data.error || "Lỗi khi hiện lại người dùng"));
      }
    } catch (err) {
      console.error("Lỗi khi gọi API unhide:", err);
      alert("Không thể kết nối đến server!");
    }
  };

  // 🔹 Lọc danh sách hiển thị
  const filtered = users
    .filter((u) => (showHidden ? true : u.is_hidden !== 1))
    .filter((u) => {
      const keyword = search.toLowerCase();
      const ten = (u.ho_ten ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return ten.includes(keyword) || email.includes(keyword);
    });

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4 text-primary text-center">
        BẢNG ĐIỀU KHIỂN QUẢN TRỊ
      </h2>

      <div className="bg-white p-4 rounded-4 shadow-sm">
        <h4 className="fw-bold text-primary mb-3">Quản lý người dùng</h4>

        <div className="d-flex gap-2 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowHidden((p) => !p)}
          >
            {showHidden ? "Ẩn người bị ẩn" : "Hiện người bị ẩn"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted text-center mt-4">
            Không có người dùng nào hiển thị.
          </p>
        ) : (
          <div className="table-responsive rounded-3 shadow-sm">
            <table className="table table-bordered align-middle text-center mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Ngày sinh</th>
                  <th>Địa chỉ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, index) => (
                  <tr
                    key={u.nguoi_dung_id ?? index}
                    style={{
                      opacity: u.is_hidden === 1 ? 0.5 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <td>{u.nguoi_dung_id ?? "-"}</td>
                    <td>{u.ho_ten ?? "-"}</td>
                    <td>{u.email ?? "-"}</td>
                    <td>
                      {u.ngay_sinh
                        ? new Date(u.ngay_sinh).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>{u.dia_chi ?? "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          (u.role ?? "").toLowerCase() === "admin"
                            ? "bg-danger"
                            : "bg-primary"
                        }`}
                      >
                        {(u.role ?? "user")
                          .replace("user", "Người dùng")
                          .replace("admin", "Quản trị viên")}
                      </span>
                    </td>
                    <td>
                      {u.is_hidden === 1 ? (
                        <span className="badge bg-secondary">Đã ẩn</span>
                      ) : (
                        <span className="badge bg-success">Hiển thị</span>
                      )}
                    </td>
                    <td>
                      {u.is_hidden === 1 ? (
                        <button
                          className="btn btn-sm btn-outline-success rounded-pill px-3"
                          onClick={() => unhideUser(u.nguoi_dung_id)}
                        >
                          👁️ Hiện lại
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          onClick={() => hideUser(u.nguoi_dung_id)}
                        >
                          👻 Ẩn
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

      <style jsx global>{`
        body {
          background: linear-gradient(90deg, #f0f4ff, #e6ecff);
        }
        .table th {
          font-weight: bold;
          text-transform: uppercase;
          background-color: #2d3436 !important;
          color: white !important;
        }
        .badge {
          padding: 6px 12px;
          font-size: 0.9rem;
          border-radius: 12px;
        }
        .btn-outline-danger,
        .btn-outline-success {
          transition: all 0.2s ease;
        }
        .btn-outline-danger:hover {
          background-color: #dc3545;
          color: white;
        }
        .btn-outline-success:hover {
          background-color: #198754;
          color: white;
        }
      `}</style>
    </div>
  );
}
