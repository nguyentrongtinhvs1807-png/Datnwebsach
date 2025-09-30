"use client";

import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

interface User {
  id: number;
  name: string;
  email: string;
  role: number; // role là số (0 = user, 1 = admin)
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);

  // Lấy danh sách user
  useEffect(() => {
    fetch("http://localhost:3003/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) =>
        console.error("Lỗi khi lấy dữ liệu người dùng:", error)
      );
  }, []);

  // Xóa user
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:3003/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers(users.filter((user) => user.id !== id));
      alert("Xóa thành công!");
    } else {
      alert("Xóa thất bại!");
    }
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
          {users.map((user: User, index: number) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className={user.role === 1 ? "text-danger fw-bold" : ""}>
                {user.role === 1 ? "Admin" : "Người dùng"}
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
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
