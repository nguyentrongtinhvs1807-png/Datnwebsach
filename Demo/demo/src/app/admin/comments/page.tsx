"use client";
import { useEffect, useState } from "react";

export default function CommentPage() {
  type Comment = {
    binh_luan_id: number;
    nguoi_dung_id: number;
    san_pham_id: number;
    nd_bl: string;
    ngay_bl: string;
    ten_nguoi_dung?: string;
    ten_san_pham?: string;
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Helper: tạo ký tự viết tắt từ tên user để làm avatar (loại bỏ icon)
  const getInitials = (name?: string) => {
    const target = (name || "").trim();
    if (!target) return "U"; // Unknown
    const parts = target.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3003/comments");
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:3003/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.binh_luan_id !== id));
      } else {
        alert("Lỗi khi xoá bình luận.");
      }
    } catch {
      alert("Lỗi khi xoá bình luận.");
    }
    setDeletingId(null);
  };

  const filtered = comments.filter(
    (c) =>
      (c.ten_nguoi_dung || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.ten_san_pham || "").toLowerCase().includes(search.toLowerCase()) ||
      c.nd_bl.toLowerCase().includes(search.toLowerCase())
  );

  // Đổi màu nền, card, hover, badge, nhấn mạnh ID, làm avatar hình tròn, chỉnh nút Xoá
  return (
    <div className="mx-auto py-4 px-2" style={{
      maxWidth: 1150,
      background: "#f7faff",
      minHeight: "100vh"
    }}>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div className="d-flex align-items-center gap-2">
          <h2 className="fw-bold mb-0" style={{ color: "#1f2937", letterSpacing: .5 }}>
            Quản lý bình luận
          </h2>
        </div>
        <span
          className="badge bg-light text-dark border"
          style={{
            fontWeight: 600,
            fontSize: 16,
            padding: "10px 18px",
            borderRadius: 12
          }}
        >
          Tổng: {comments.length}
        </span>
      </div>

      <div className="mb-4 row g-3 align-items-end">
        <div className="col-lg-6">
          <input
            type="text"
            className="form-control shadow-sm border-2"
            style={{
              borderRadius: 14,
              border: "2.5px solid #d1e0ff",
              fontSize: 17,
              padding: "13px 20px",
              background: "#f2f6ff"
            }}
            placeholder="Tìm kiếm tên, sản phẩm, nội dung bình luận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-lg-6 text-end d-none d-lg-block">
          <span className="text-muted">Bấm vào <b className="text-danger">Xoá</b> để gỡ bình luận vi phạm nội quy</span>
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
            background: "#1f6feb",
            color: "white"
          }}>
            <tr>
              <th style={{ fontWeight: 700, fontSize: 17, letterSpacing: .5 }}>ID</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Sản phẩm</th>
              <th style={{ fontWeight: 700, fontSize: 16, minWidth: 175 }}>Người dùng</th>
              <th style={{ fontWeight: 700, fontSize: 16, minWidth: 280 }}>Nội dung</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Ngày</th>
              <th style={{ fontWeight: 700, fontSize: 16 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted fs-5">
                  {search
                    ? "Không tìm thấy bình luận phù hợp."
                    : "Chưa có bình luận nào."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.binh_luan_id}
                  className="transition"
                  style={{
                    borderLeft: "6px solid #c7ddff",
                    background: "#ffffff",
                    boxShadow: "0 3px 6px #edf2ff20"
                  }}>
                  <td className="fw-bold fs-5 text-primary" style={{
                    background: "linear-gradient(90deg, #e9f3fe 60%, #d9f9fe 100%)",
                    borderRadius: 8
                  }}>
                    #{c.binh_luan_id}
                  </td>
                  <td className="fw-semibold" style={{whiteSpace:"nowrap", color: "#0f4aa1"}}>
                    {c.ten_san_pham || `SP #${c.san_pham_id}`}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width:40,height:40,
                        background:"#e7efff",
                        borderRadius:"50%",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        fontWeight:600,
                        fontSize:18,
                        color: "#2d5bd1",
                        border: "2.5px solid #d8eafd",
                      }}>
                        {getInitials(c.ten_nguoi_dung)}
                      </div>
                      <span className="fw-semibold" style={{ color:"#25497A",fontSize:16 }}>
                        {c.ten_nguoi_dung || `User #${c.nguoi_dung_id}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 350 }}>
                    <span className="text-body" style={{
                      wordBreak: "break-word",
                      background:"#f5f8ff",
                      borderRadius: 10,
                      padding:"8px 13px",
                      display:"inline-block",
                      fontSize: 15,
                      minWidth: 70,
                    }}>
                      {c.nd_bl.length > 90
                        ? (<span title={c.nd_bl}>{c.nd_bl.substring(0, 90)}...</span>)
                        : c.nd_bl}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border px-3 py-2" style={{
                      fontWeight: 500,
                      fontSize: 14,
                      borderRadius: 10,
                      minWidth: 95
                    }}>
                      {new Date(c.ngay_bl).toLocaleString("vi-VN")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn px-3 py-2 fw-bold shadow"
                      disabled={deletingId === c.binh_luan_id}
                      style={{
                        borderRadius: 15,
                        background: "#e11d48",
                        color: "#fff",
                        border: "none",
                        boxShadow: "0 3px 12px rgba(225,29,72,.18)",
                        opacity: deletingId === c.binh_luan_id ? .7 : 1,
                        fontSize: 15,
                        transition: "background .13s"
                      }}
                      onClick={() => deleteComment(c.binh_luan_id)}
                    >
                      {deletingId === c.binh_luan_id ? "Đang xoá..." : "Xoá"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="d-block d-lg-none mt-3 mb-1 text-end">
        <span className="text-muted" style={{ fontSize: 14 }}>
          Bấm vào <span className="text-danger fw-bold">Xoá</span> để gỡ bình luận vi phạm
        </span>
      </div>
    </div>
  );
}
