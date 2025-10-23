"use client";
import { useEffect, useState } from "react";

export default function CommentPage() {
  type Comment = {
    binh_luan_id: number;
    nguoi_dung_id: number;
    san_pham_id: number;
    nd_bl: string;
    ngay_bl: string;
  };

  type Product = {
    san_pham_id: number;
    ten_san_pham: string;
  };

  type User = {
    nguoi_dung_id: number;
    ten: string;
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/comments")
      .then((res) => res.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));

    fetch("http://localhost:3003/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));

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

  const getProductName = (id: number) =>
    products.find((p) => p.san_pham_id === id)?.ten_san_pham || `SP #${id}`;
  const getUserName = (id: number) =>
    users.find((u) => u.nguoi_dung_id === id)?.ten || `User #${id}`;

  const filtered = comments.filter(
    (c) =>
      getUserName(c.nguoi_dung_id).toLowerCase().includes(search.toLowerCase()) ||
      c.nd_bl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-primary mb-4">💬 Quản lý bình luận</h2>

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
                <th>Sản phẩm</th>
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
                  <td>{getProductName(c.san_pham_id)}</td>
                  <td>{getUserName(c.nguoi_dung_id)}</td>
                  <td>{c.nd_bl}</td>
                  <td>{new Date(c.ngay_bl).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteComment(c.binh_luan_id)}
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
