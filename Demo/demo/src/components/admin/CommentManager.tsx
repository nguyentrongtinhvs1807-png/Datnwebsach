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

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3003/comments")
      .then(res => res.json())
      .then(data => {
        console.log("DỮ LIỆU NHẬN ĐƯỢC (mới nhất):", data);
        setComments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (id: number, current: 0 | 1) => {
    const newStatus = current === 1 ? 0 : 1;
    await fetch(`http://localhost:3003/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trang_thai: newStatus })
    });
    setComments(prev => prev.map(c => 
      c.binh_luan_id === id ? { ...c, trang_thai: newStatus } : c
    ));
  };

  if (loading) return <div className="text-center py-5">Đang tải bình luận...</div>;

  return (
    <div className="container my-4">
      <h2 className="fw-bold mb-4">Quản lý bình luận ({comments.length})</h2>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-primary">
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
            {comments.map(c => (
              <tr key={c.binh_luan_id}>
                <td className="fw-bold">#{c.binh_luan_id}</td>
                <td>{c.ten_san_pham}</td>
                <td>
                  <span className="badge bg-info text-dark">{c.ten_nguoi_dung}</span>
                </td>
                <td style={{ maxWidth: 400 }}>{c.noi_dung}</td>
                <td>
                  <span className="badge bg-light text-dark border">{c.ngay}</span>
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(c.binh_luan_id, c.trang_thai)}
                    className={`btn btn-sm px-4 ${c.trang_thai === 1 ? "btn-outline-danger" : "btn-outline-success"}`}
                  >
                    {c.trang_thai === 1 ? "Ẩn" : "Hiện"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}