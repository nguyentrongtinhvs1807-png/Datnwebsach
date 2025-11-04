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
  const [search, setSearch] = useState("");

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

  // Lọc bình luận theo từ khoá tìm kiếm
  const filteredComments = Array.isArray(comments)
    ? comments.filter(
        (c) =>
          c.ten_nguoi_dung?.toLowerCase().includes(search.toLowerCase()) ||
          c.noi_dung?.toLowerCase().includes(search.toLowerCase()) ||
          c.binh_luan_id.toString().includes(search)
      )
    : [];

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div>
          <div className="spinner-border text-info" style={{ width: 48, height: 48 }} />
          <div className="text-muted mt-3 fs-5 text-center">Đang tải bình luận...</div>
        </div>
      </div>
    );

  return (
    <div className="container my-4 px-0 px-md-3">
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#2164bf", letterSpacing: "1px" }}>
            <i className="bi bi-chat-left-text me-2"></i>Quản lý bình luận
          </h2>
          <span className="badge rounded-pill shadow-sm"
                style={{
                  background: "linear-gradient(90deg,#6aafff,#4fdfff)",
                  color: "#173982",
                  fontWeight: 600,
                  fontSize: 18,
                  padding: "10px 25px",
                  borderRadius: 16,
                  border: "1.5px solid #d4eafd",
                  boxShadow: "0 2px 10px #bdd6ff30"
                }}>
            <i className="bi bi-chat-left-text me-2" />
            {comments.length} bình luận
          </span>
        </div>
        <div className="w-100 w-md-auto mt-3 mt-md-0" style={{ maxWidth: 350 }}>
          <input
            type="text"
            className="form-control shadow-sm border-2"
            style={{
              borderRadius: 14,
              border: "2px solid #d1e0ff",
              fontSize: 17,
              padding: "12px 17px",
              background: "#f2f6ff"
            }}
            placeholder="🔎 Tìm kiếm tên, nội dung, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div 
        className="table-responsive rounded-4 shadow"
        style={{
          border: "1.5px solid #dde8ff",
          overflowX: "auto",
          background: "#fcfcff",
          boxShadow: "0 4px 20px #bbdcfe22"
        }}
      >
        <table className="table align-middle mb-0 table-hover">
          <thead style={{
            background: "linear-gradient(90deg, #3a54c1 0%, #4fdfff 100%)",
            color: "white"
          }}>
            <tr>
              <th style={{ fontWeight: 700, fontSize: 17, letterSpacing: .5 }}>ID</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Tên người dùng</th>
              <th style={{ fontWeight: 700, fontSize: 16, minWidth: 270 }}>Nội dung</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Ngày</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-5">
                  <span className="text-muted fs-5">
                    {comments.length === 0
                      ? "Không có bình luận nào."
                      : "Không tìm thấy bình luận phù hợp."}
                  </span>
                </td>
              </tr>
            ) : (
              filteredComments.map((c, idx) => (
                <tr
                  key={c.binh_luan_id ?? idx}
                  style={{
                    borderLeft: "6px solid #88b9f8",
                    background: "#fcfdff",
                    boxShadow: "0 3px 6px #edf2ff20"
                  }}
                  className="transition"
                >
                  <td className="fw-bold fs-5 text-primary" style={{
                    background: "linear-gradient(90deg, #e9f3fe 60%, #d9f9fe 100%)",
                    borderRadius: 8
                  }}>
                    #{c.binh_luan_id}
                  </td>
                  <td className="fw-semibold" style={{
                    color: "#115193",
                    maxWidth: "170px"
                  }}>
                    <i className="bi bi-person-circle me-2 text-info"></i>
                    {c.ten_nguoi_dung}
                  </td>
                  <td style={{ maxWidth: "350px", wordBreak: "break-word" }}>
                    <span className="text-dark">
                      {c.noi_dung && c.noi_dung.length > 80
                        ? (
                            <>
                              {c.noi_dung.slice(0, 80) + "..."}
                              <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>rút gọn</span>
                            </>
                          )
                        : c.noi_dung || "-"}
                    </span>
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <span className="badge rounded-pill bg-light shadow-sm text-secondary border border-info px-3 py-2">
                      <i className="bi bi-calendar-check me-1"></i>
                      {c.ngay}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger px-3 py-2 fw-bold"
                      style={{
                        borderRadius: 10,
                        letterSpacing: .5,
                        fontSize: 16,
                        boxShadow: "0 2px 8px #ffdad710",
                        transition: "all 0.15s"
                      }}
                      onClick={() => deleteComment(c.binh_luan_id)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Xoá
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
