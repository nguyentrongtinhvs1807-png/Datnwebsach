"use client";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

interface User {
  id: number;
  name: string;
  email: string;
  role: number; // 0 = user, 1 = admin
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Lỗi khi lấy user:", err));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    const res = await fetch(`http://localhost:3003/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
      alert("Xóa thành công!");
    } else alert("Xóa thất bại!");
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4 fw-bold">Quản lý người dùng</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Phân quyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user.id}>
              <td>{i + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className={user.role === 1 ? "text-danger fw-bold" : ""}>
                {user.role === 1 ? "Admin" : "Người dùng"}
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                  Ẩn
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
