"use client";
import { useEffect, useState } from "react";

type Comment = {
  id: number;
  productId: number;
  user: string;
  content: string;
  createdAt: string;
};

type Product = {
  id: number;
  name: string;
};

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // Lấy tất cả bình luận + sản phẩm
  useEffect(() => {
    fetch("http://localhost:3003/comments")
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("❌ Lỗi tải bình luận:", err));

    fetch("http://localhost:3003/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("❌ Lỗi tải sản phẩm:", err));
  }, []);

  // Xoá bình luận
  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;

    await fetch(`http://localhost:3003/comments/${id}`, {
      method: "DELETE",
    });

    setComments(comments.filter((c) => c.id !== id));
  };

  // Tìm tên sản phẩm theo productId
  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `SP #${productId}`;
  };

  // Lọc theo tìm kiếm
  const filteredComments = comments.filter(
    (c) =>
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📝 Quản lý bình luận</h2>

      {/* Ô tìm kiếm */}
      <div className="mb-3 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="🔍 Tìm theo người dùng hoặc nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredComments.length === 0 ? (
        <p className="text-muted">Không có bình luận nào.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Người dùng</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Xoá</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((cmt) => (
                <tr key={cmt.id}>
                  <td>{cmt.id}</td>
                  <td>{getProductName(cmt.productId)}</td>
                  <td>
                    <span className="fw-semibold">{cmt.user}</span>
                  </td>
                  <td>{cmt.content}</td>
                  <td>{new Date(cmt.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteComment(cmt.id)}
                    >
                      ❌ Xoá Bình Luận 
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
