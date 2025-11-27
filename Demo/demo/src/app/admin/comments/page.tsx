"use client";
import React, { useEffect, useState } from "react";

interface Comment {
  binh_luan_id: number;
  ten_san_pham: string;
  ten_nguoi_dung: string;
  noi_dung: string;
  ngay: string;
  trang_thai: 0 | 1;
}

export default function CommentPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3003/comments", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        console.log("DỮ LIỆU BÌNH LUẬN (ĐÃ ĐÚNG):", data);
        setComments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối backend:", err);
        setLoading(false);
      });
  }, []);

  // Hàm đổi trạng thái Ẩn ↔ Hiện (có thể thêm route PUT sau)
  const toggleStatus = async (id: number, current: 0 | 1) => {
    const newStatus = current === 1 ? 0 : 1;
    try {
      await fetch(`http://localhost:3003/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: newStatus }),
      });
      setComments(prev =>
        prev.map(c => (c.binh_luan_id === id ? { ...c, trang_thai: newStatus } : c))
      );
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  if (loading) {
    return <div className="text-center py-5">Đang tải bình luận...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="fw-bold mb-4 text-primary">Quản lý bình luận ({comments.length})</h2>

      <div className="table-responsive rounded shadow-sm border">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-primary text-white">
            <tr>
              <th className="fw-bold">ID</th>
              <th className="fw-bold">Sách</th>
              <th className="fw-bold">Người dùng</th>
              <th className="fw-bold">Nội dung</th>
              <th className="fw-bold">Ngày bình luận</th>
              <th className="fw-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Chưa có bình luận nào
                </td>
              </tr>
            ) : (
              comments.map(c => (
                <tr
                  key={c.binh_luan_id}
                  className={c.trang_thai === 0 ? "table-secondary" : ""}
                >
                  <td className="fw-bold text-primary">#{c.binh_luan_id}</td>
                  <td className="fw-semibold">{c.ten_san_pham}</td>
                  <td>
                    <span className="badge bg-info text-dark px-3 py-2">
                      {c.ten_nguoi_dung}
                    </span>
                  </td>
                  <td style={{ maxWidth: "400px" }} className="text-break">
                    {c.noi_dung}
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      {c.ngay}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => toggleStatus(c.binh_luan_id, c.trang_thai)}
                      className={`btn btn-sm px-4 fw-bold ${
                        c.trang_thai === 1
                          ? "btn-outline-danger"
                          : "btn-outline-success"
                      }`}
                    >
                      {c.trang_thai === 1 ? "Ẩn" : "Hiện"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}