"use client";

import React, { useEffect, useState } from "react";

interface User {
  nguoi_dung_id?: number;
  ho_ten?: string;
  email?: string;
  ngay_sinh?: string;
  dia_chi?: string;
  role?: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Dữ liệu từ API /users:", data);
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải users:", err);
        setUsers([]);
      });
  }, []);

  const deleteUser = async (id?: number) => {
    if (!id) return alert("Không có ID hợp lệ!");
    if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;

    try {
      await fetch(`http://localhost:3003/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.nguoi_dung_id !== id));
      alert("🗑️ Đã xoá người dùng!");
    } catch (err) {
      console.error("❌ Lỗi xoá người dùng:", err);
      alert("Xoá thất bại!");
    }
  };

  // ✅ Lọc danh sách an toàn tuyệt đối
  const filtered = Array.isArray(users)
    ? users
        .filter((u) => u && typeof u === "object")
        .filter((u) => {
          const ten = String(u?.ho_ten || "").toLowerCase();
          const email = String(u?.email || "").toLowerCase();
          const keyword = String(search || "").toLowerCase();
          return ten.includes(keyword) || email.includes(keyword);
        })
    : [];

  return (
    <div className="p-3">
      <h3 className="fw-bold mb-3">👥 Quản lý người dùng</h3>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Tìm theo tên hoặc email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-muted text-center mt-3">Không có người dùng nào.</p>
      ) : (
        <table className="table table-striped align-middle shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Ngày sinh</th>
              <th>Địa chỉ</th>
              <th>Quyền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.nguoi_dung_id ?? crypto.randomUUID()}>
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
                        : "bg-secondary"
                    }`}
                  >
                    {u.role ?? "user"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteUser(u.nguoi_dung_id)}
                  >
                    ❌ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
