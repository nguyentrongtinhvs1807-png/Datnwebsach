"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Book {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number;
  loai_bia: string;
  Loai_sach_id: number;
  image?: string | null;
}

interface Comment {
  id: number;
  bookId: number;
  user: string;
  content: string;
  createdAt: string;
}

export default function BookDetail() {
  const { id } = useParams() as { id: string };
  const [book, setBook] = useState<Book | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // ✅ Lấy thông tin sách theo ID
  useEffect(() => {
    fetch(`http://localhost:3003/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sách");
        return res.json();
      })
      .then((data) => {
        console.log("📘 Chi tiết sách:", data);
        setBook(data);
      })
      .catch((err) => console.error("❌ Lỗi tải sách:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Lấy user đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser({ id: Number(u.id), name: u.ho_ten || "Người dùng" });
      } catch {
        console.warn("Không parse được user từ localStorage");
      }
    }
  }, []);

  // ✅ Lấy bình luận
  useEffect(() => {
    fetch(`http://localhost:3003/comments/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải bình luận:", err));
  }, [id]);

  // ✅ Thêm vào giỏ hàng
  const addToCart = () => {
    if (!book) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item: any) => item.id === book.sach_id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: book.sach_id,
        name: book.ten_sach,
        price: book.gia_sach - (book.gg_sach || 0),
        image: book.image,
        quantity,
        loai_bia: book.loai_bia,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`🛒 Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  // ✅ Gửi bình luận
  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !user) return;

    const newComment = {
      bookId: Number(id),
      userId: user.id,
      content: commentContent.trim(),
    };

    try {
      const res = await fetch("http://localhost:3003/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) throw new Error("Lỗi khi gửi bình luận");

      const added = await res.json();
      setComments([added, ...comments]);
      setCommentContent("");
      toast.success("💬 Bình luận của bạn đã được gửi!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Không gửi được bình luận");
    }
  };

  if (loading)
    return <p className="text-center mt-4">⏳ Đang tải thông tin sách...</p>;
  if (!book) return <p className="text-center mt-4">❌ Không tìm thấy sách</p>;

  return (
    <div className="container mt-4">
      <Link href="/home" className="btn btn-outline-secondary mb-4">
        ← Quay lại danh sách
      </Link>

      <div className="row g-5">
        {/* Ảnh sách */}
        <div className="col-md-5 text-center">
          <div className="p-3 bg-white rounded shadow-sm">
            <img
              src={book.image || "/image/default-book.jpg"}
              alt={book.ten_sach}
              className="img-fluid rounded"
              style={{
                maxHeight: "420px",
                objectFit: "contain",
                transition: "transform 0.4s ease",
                cursor: "zoom-in",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1.15)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1)")
              }
            />
          </div>
        </div>

        {/* Thông tin sách */}
        <div className="col-md-7">
          <h2 className="fw-bold mb-2">{book.ten_sach}</h2>
          <p className="text-muted mb-1">✍️ Tác giả: {book.ten_tac_gia}</p>
          <p className="text-muted mb-3">🏢 NXB: {book.ten_NXB}</p>

          <div className="mb-3">
            {book.gg_sach > 0 ? (
              <>
                <p className="text-muted text-decoration-line-through mb-1">
                  {book.gia_sach.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-danger fs-3 fw-bold mb-1">
                  {(book.gia_sach - book.gg_sach).toLocaleString("vi-VN")}đ{" "}
                  <Badge bg="success">
                    -
                    {Math.round(
                      (book.gg_sach / book.gia_sach) * 100
                    )}
                    %
                  </Badge>
                </p>
                <p className="text-success fw-semibold">
                  Tiết kiệm: {book.gg_sach.toLocaleString("vi-VN")}đ
                </p>
              </>
            ) : (
              <p className="text-danger fs-3 fw-bold">
                {book.gia_sach.toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>

          <p className="text-muted">📖 Loại bìa: {book.loai_bia}</p>

          <p className="mt-3">{book.mo_ta || "Chưa có mô tả cho sách này."}</p>

          {/* Số lượng */}
          <div className="d-flex align-items-center mt-4 mb-4">
            <label className="me-3 fw-semibold">Số lượng:</label>
            <div className="input-group" style={{ maxWidth: "160px" }}>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
                className="form-control text-center"
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="btn px-4 py-2 fw-bold w-100"
            style={{
              borderRadius: "30px",
              background: "linear-gradient(45deg, #f1c40f, #f39c12)",
              border: "none",
              color: "white",
            }}
            onClick={addToCart}
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Bình luận */}
      <div className="mt-5">
        <h4 className="mb-3">💬 Bình luận ({comments.length})</h4>

        {user ? (
          <div className="card p-3 mb-4 shadow-sm border-0">
            <textarea
              className="form-control mb-3"
              placeholder="Viết cảm nhận của bạn..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
            />
            <button
              className="btn btn-primary w-25"
              onClick={handleCommentSubmit}
            >
              Gửi bình luận
            </button>
          </div>
        ) : (
          <p>
            Vui lòng <Link href="/auth/login">đăng nhập</Link> để bình luận.
          </p>
        )}

        {comments.map((cmt) => (
          <div key={cmt.id} className="card mb-3 shadow-sm border-0">
            <div className="card-body d-flex">
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: "40px", height: "40px" }}
              >
                {cmt.user.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{cmt.user}</strong>{" "}
                <small className="text-muted">
                  ({new Date(cmt.createdAt).toLocaleString("vi-VN")})
                </small>
                <p className="mb-0 mt-2">{cmt.content}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-muted">Chưa có bình luận nào cho sách này.</p>
        )}
      </div>
    </div>
  );
}
