"use client";

import React, { useEffect, useState, useCallback } from "react";

interface User {
  nguoi_dung_id?: number;
  ho_ten?: string;
  email?: string;
  ngay_sinh?: string;
  dia_chi?: string;
  role?: string;
  is_hidden?: number;
}

const API_URL = "http://localhost:3003";

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/all`);
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải users:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hideUser = async (id?: number) => {
    if (!id) return;
    if (!confirm("Bạn có chắc muốn ẩn người dùng này không?")) return;

    const res = await fetch(`${API_URL}/users/${id}/hide`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchUsers();
    } else alert(data.error || "Lỗi khi ẩn người dùng");
  };

  const unhideUser = async (id?: number) => {
    if (!id) return;
    const res = await fetch(`${API_URL}/users/${id}/unhide`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchUsers();
    } else alert(data.error || "Lỗi khi hiện lại người dùng");
  };

  const filtered = users
    .filter((u) => (showHidden ? true : u.is_hidden !== 1))
    .filter((u) => {
      const keyword = search.toLowerCase();
      return (
        (u.ho_ten ?? "").toLowerCase().includes(keyword) ||
        (u.email ?? "").toLowerCase().includes(keyword)
      );
    });

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4 text-primary text-center">
        BẢNG QUẢN LÝ NGƯỜI DÙNG
      </h2>

      <div className="bg-white p-4 rounded-4 shadow-sm">
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

        <div className="table-responsive rounded-3 shadow-sm">
          <table className="table table-bordered text-center align-middle mb-0">
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
              {filtered.map((u) => (
                <tr key={u.nguoi_dung_id} style={{ opacity: u.is_hidden ? 0.5 : 1 }}>
                  <td>{u.nguoi_dung_id}</td>
                  <td>{u.ho_ten}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.ngay_sinh
                      ? new Date(u.ngay_sinh).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>{u.dia_chi}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin" ? "bg-danger" : "bg-primary"
                      }`}
                    >
                      {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td>
                    {u.is_hidden ? (
                      <span className="badge bg-secondary">Đã ẩn</span>
                    ) : (
                      <span className="badge bg-success">Hiển thị</span>
                    )}
                  </td>
                  <td>
                    {u.is_hidden ? (
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
      </div>
    </div>
  );
}
