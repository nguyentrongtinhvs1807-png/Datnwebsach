"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "react-bootstrap";

type Product = {
  id: number;
  ten_sp: string;
  gia: number;
  gia_km: number;
  hinh: string;
  mo_ta?: string;
};

type Comment = {
  id: number;
  productId: number;
  user: string;
  content: string;
  createdAt: string;
};

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);

  // Lấy sản phẩm
  useEffect(() => {
    fetch(`http://localhost:3003/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        return res.json();
      })
      .then((data) =>
        setProduct({
          id: Number(data.id),
          ten_sp: data.ten_sp,
          gia: Number(data.gia),
          gia_km: Number(data.gia_km),
          hinh: data.hinh,
          mo_ta: data.mo_ta,
        })
      )
      .catch((err) => console.error("Lỗi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Lấy user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser({ id: u.id, name: u.ho_ten });
    }
  }, []);

  // Lấy bình luận
  useEffect(() => {
    fetch(`http://localhost:3003/comments/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Lỗi tải bình luận:", err));
  }, [id]);

  // Thêm vào giỏ
  const addToCart = () => {
    if (!product) return;
    let cart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.ten_sp,
        price: product.gia_km > 0 ? product.gia_km : product.gia,
        image: product.hinh,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  // Gửi bình luận
  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !user) return;

    const newComment = {
      productId: Number(id),
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
    } catch (error) {
      console.error(error);
      alert("❌ Không gửi được bình luận");
    }
  };

  if (loading) return <p className="text-center mt-4">⏳ Đang tải...</p>;
  if (!product) return <p className="text-center mt-4">❌ Không tìm thấy sản phẩm</p>;

  return (
    <div className="container mt-4">
      <Link href="/products" className="btn btn-outline-secondary mb-4">
        ← Quay lại
      </Link>

      <div className="row g-5">
        {/* Ảnh */}
        <div className="col-md-5 col-12 text-center">
          <div className="p-3 bg-white rounded shadow-sm">
            <img
              src={product.hinh}
              alt={product.ten_sp}
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

        {/* Thông tin */}
        <div className="col-md-7 col-12">
          <h2 className="fw-bold">{product.ten_sp}</h2>

          {product.gia_km > 0 ? (
            <>
              <p className="text-muted text-decoration-line-through mb-1">
                {product.gia.toLocaleString()}đ
              </p>
              <p className="text-danger fs-3 fw-bold mb-1">
                {product.gia_km.toLocaleString()}đ{" "}
                <Badge bg="success">
                  -{Math.round(((product.gia - product.gia_km) / product.gia) * 100)}%
                </Badge>
              </p>
              <p className="text-success fw-semibold">
                Tiết kiệm: {(product.gia - product.gia_km).toLocaleString()}đ
              </p>
            </>
          ) : (
            <p className="text-danger fs-3 fw-bold">{product.gia.toLocaleString()}đ</p>
          )}

          <p className="mt-3">{product.mo_ta || "📖 Chưa có mô tả cho sách này."}</p>

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
                onChange={(e) => setQuantity(Number(e.target.value))}
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

          {/* Nút thêm giỏ */}
        <button
          className="btn px-4 py-2 fw-bold w-100 w-md-auto"
          style={{
          borderRadius: "30px",
           background: "linear-gradient(45deg, #f1c40f, #f39c12)", // vàng sáng -> vàng cam
          border: "none", 
          color: "white",
          }}
          onClick={addToCart}>
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
            <button className="btn btn-primary w-25" onClick={handleCommentSubmit}>
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
                  ({new Date(cmt.createdAt).toLocaleString()})
                </small>
                <p className="mb-0 mt-2">{cmt.content}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-muted">Chưa có bình luận nào cho sản phẩm này.</p>
        )}
      </div>
    </div>
  );
}
