"use client";
import React, { useEffect, useState } from "react";

interface Comment {
  binh_luan_id: number;
  ten_nguoi_dung: string;
  noi_dung: string;
  ngay: string;
}

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3003/comments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    await fetch(`http://localhost:3003/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.binh_luan_id !== id));
  };

  if (loading)
    return <p className="text-center text-muted mt-3">Đang tải bình luận...</p>;

  return (
    <div className="p-3">
      <h3 className="fw-bold mb-3">💬 Quản lý bình luận</h3>

      {comments.length === 0 ? (
        <p className="text-center text-muted">Không có bình luận nào.</p>
      ) : (
        <table className="table table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tên người dùng</th>
              <th>Nội dung</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c, index) => (
              <tr key={c.binh_luan_id ?? index}>
                <td>{c.binh_luan_id}</td>
                <td>{c.ten_nguoi_dung}</td>
                <td>{c.noi_dung}</td>
                <td>{c.ngay}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteComment(c.binh_luan_id)}
                  >
                    ❌ Xóa
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
