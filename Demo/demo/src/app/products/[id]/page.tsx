"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  book_id: number;
  content: string;
  created_at: string;
  user: string;
}

interface RelatedBook {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  gia_sach: number;
  gg_sach: number;
  image?: string | null;
  ton_kho_sach?: number;
}

export default function BookDetail() {
  const { id } = useParams() as { id: string };

  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("/image/default-book.jpg");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const formatPrice = (price: number) =>
    `${Math.round(price).toLocaleString("vi-VN")}đ`;

  // ========================= FETCH SÁCH =========================
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3003/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBook(data);
        setMainImage(data.image || "/image/default-book.jpg");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ===================== FETCH ẢNH PHỤ =====================
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3003/books/${id}/images`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data.map((i: any) => i.URL));
        } else setImages([]);
      })
      .catch(() => setImages([]));
  }, [id]);

  // ===================== FETCH BÌNH LUẬN =====================
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3003/comments/${id}?status=1`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [id]);

  // ===================== FETCH SẢN PHẨM LIÊN QUAN =====================
  useEffect(() => {
    if (!book || !book.Loai_sach_id) return;
    fetch(`http://localhost:3003/books/related/${book.Loai_sach_id}/${id}`)
      .then((r) => r.json())
      .then((data) => setRelatedBooks(Array.isArray(data) ? data : []))
      .catch(() => setRelatedBooks([]));
  }, [book, id]);

  // ===================== THÊM BÌNH LUẬN =====================
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return toast.warning("Vui lòng nhập nội dung bình luận!");
    const userStr = localStorage.getItem("user");
    if (!userStr) return toast.warning("Vui lòng đăng nhập để bình luận!");

    try {
      const user = JSON.parse(userStr);
      setIsSubmittingComment(true);
      const res = await fetch("http://localhost:3003/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id, userId: user.id, content: commentText.trim() }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        toast.success("Đã thêm bình luận!");
      } else toast.error("Không thể thêm bình luận!");
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const addToCart = () => {
    if (!book) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.warning("Vui lòng đăng nhập!");
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/dangnhap?return=${returnUrl}`;
      return;
    }

    if (quantity > book.ton_kho_sach) return toast.warning(`Chỉ còn ${book.ton_kho_sach} sản phẩm!`);

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: any) => i.id === book.sach_id);
    const newQty = existing ? existing.quantity + quantity : quantity;

    if (newQty > book.ton_kho_sach) return toast.warning("Vượt quá tồn kho!");

    if (existing) existing.quantity = newQty;
    else cart.push({
      id: book.sach_id,
      name: book.ten_sach,
      price: book.gia_sach - (book.gg_sach || 0),
      image: mainImage,
      quantity,
      stock: book.ton_kho_sach,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng!");
    setQuantity(1);
    window.dispatchEvent(new Event("cart-update"));
  };

  const buyNow = () => {
    if (!book) return;

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.warning("Vui lòng đăng nhập!");
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/dangnhap?return=${returnUrl}`;
      return;
    }

    if (quantity > book.ton_kho_sach) return toast.warning("Vượt quá tồn kho!");

    const item = {
      id: book.sach_id,
      name: book.ten_sach,
      price: book.gia_sach - (book.gg_sach || 0),
      image: mainImage,
      quantity,
      stock: book.ton_kho_sach,
    };

    localStorage.setItem("checkoutItems", JSON.stringify([item]));
    window.location.href = "/checkout";
  };

  const handleQuickBuy = (b: RelatedBook) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return toast.warning("Vui lòng đăng nhập!");

    const item = {
      id: b.sach_id,
      name: b.ten_sach,
      price: b.gia_sach - (b.gg_sach || 0),
      image: b.image || "/image/default-book.jpg",
      quantity: 1,
      stock: b.ton_kho_sach || 999,
    };

    localStorage.setItem("checkoutItems", JSON.stringify([item]));
    window.location.href = "/checkout";
  };

  const handleAddToCartRelated = (b: RelatedBook) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return toast.warning("Vui lòng đăng nhập!");

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: any) => i.id === b.sach_id);

    if (existing) existing.quantity++;
    else cart.push({
      id: b.sach_id,
      name: b.ten_sach,
      price: b.gia_sach - (b.gg_sach || 0),
      image: b.image || "/image/default-book.jpg",
      quantity: 1,
      stock: b.ton_kho_sach || 999,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ!");
    window.dispatchEvent(new Event("cart-update"));
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-danger" style={{ width: 70, height: 70 }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );

  if (!book) return <div className="text-center py-5 fs-3 text-secondary">Không tìm thấy sách.</div>;

  const salePercent = book.gg_sach > 0 ? Math.round((book.gg_sach / book.gia_sach) * 100) : 0;

  return (
    <div className="py-5" style={{ background: "linear-gradient(120deg, #fff6e3 60%, #f7efd8 100%)", minHeight: "100vh" }}>
      <style>{`
        .custom-btn1 { border: 2px solid #d49421; color: #d49421; background: #fff4e0; border-radius: 12px; padding: 12px 28px; font-weight: 600; transition: all .3s; }
        .custom-btn1:hover { background: #ffe5bb; transform: translateY(-3px); }
        .custom-btn2 { background: linear-gradient(90deg,#fd6b64,#fec670); color: white; border: none; border-radius: 12px; padding: 12px 28px; font-weight: 600; box-shadow: 0 4px 15px #feceb588; }
        .custom-btn2:hover { background: linear-gradient(90deg,#fec670,#fd6b64); transform: translateY(-3px); }
        .price-flash-sale { font-size: 2.3rem; font-weight: bold; background: linear-gradient(90deg,#ff9028,#fd4766); color: white; padding: 10px 32px; border-radius: 16px; display: inline-block; }
        .sale-badge { background: linear-gradient(135deg,#ef4444,#dc2626); color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; }
      `}</style>

      <div className="container" style={{ maxWidth: 1180 }}>
        <Link href="/home" className="btn btn-outline-warning rounded-pill mb-4">← Quay lại danh sách</Link>

        {/* 2 CỘT CHÍNH - CÂN BẰNG KHI CHƯA MỞ RỘNG */}
        <div className="row g-5">
          {/* CỘT TRÁI - ẢNH + CHÍNH SÁCH */}
          <div className="col-lg-5">
            <div className="bg-white rounded-4 shadow-lg p-4 h-100 d-flex flex-column">
              <img src={mainImage} alt={book.ten_sach} className="img-fluid rounded mb-4" style={{ height: 380, objectFit: "contain", background: "#fffbe6" }} />
              <div className="d-flex gap-2 justify-content-center overflow-auto pb-3">
                {(images.length ? images : [book.image || "/image/default-book.jpg"]).map((img, i) => (
                  <img key={i} src={img} className="img-thumbnail cursor-pointer" style={{ width: 66, height: 80, border: mainImage === img ? "3px solid #fd6b64" : "2px solid #ffe3ae" }} onClick={() => setMainImage(img)} />
                ))}
              </div>
              <div className="mt-auto pt-3">
                <div className="p-4 rounded-4 text-start" style={{ background: "linear-gradient(105deg,#fdf5e8,#fffadc)", boxShadow: "0 4px 16px #ffecb388" }}>
                  <h5 className="fw-bold text-warning mb-3">Chính sách ưu đãi</h5>
                  <ul className="small mb-0">
                    <li className="text-success">Giao hàng nhanh toàn quốc</li>
                    <li className="text-primary">Miễn phí đổi trả 7 ngày</li>
                    <li className="text-danger">Giảm thêm khi mua số lượng lớn</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - THÔNG TIN + MÔ TẢ */}
          <div className="col-lg-7">
            <div className="bg-white rounded-4 shadow-lg p-4">
              <h1 className="fw-bold mb-3" style={{ color: "#d57200", fontSize: "2.1rem" }}>{book.ten_sach}</h1>

              <div className="row mb-4 text-muted">
                <div className="col-sm-6">
                  <div className="d-flex mb-2"><span className="fw-bold me-3 text-dark">Tác giả:</span> <span className="text-danger">{book.ten_tac_gia}</span></div>
                  <div className="d-flex mb-2"><span className="fw-bold me-3 text-dark">NXB:</span> <span>{book.ten_NXB}</span></div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex mb-2"><span className="fw-bold me-3 text-dark">Nhà cung cấp:</span> <span className="text-primary">Pibbok</span></div>
                  <div className="d-flex mb-2"><span className="fw-bold me-3 text-dark">Loại bìa:</span> <span className="text-success">{book.loai_bia}</span></div>
                </div>
              </div>

              <div className="mb-4">
                {book.gg_sach > 0 ? (
                  <>
                    <span className="price-flash-sale me-3">{formatPrice(book.gia_sach - book.gg_sach)}</span>
                    <span className="sale-badge">-{salePercent}%</span>
                    <del className="ms-3 text-muted">{formatPrice(book.gia_sach)}</del>
                  </>
                ) : (
                  <span className="price-flash-sale">{formatPrice(book.gia_sach)}</span>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="fw-bold text-dark">Số lượng:</span>
                <input type="number" min={1} max={book.ton_kho_sach} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(book.ton_kho_sach, Number(e.target.value) || 1)))} className="form-control text-center" style={{ width: 120 }} />
                <span className="text-muted">Còn <strong style={{ color: book.ton_kho_sach > 10 ? "green" : book.ton_kho_sach > 0 ? "orange" : "red" }}>{book.ton_kho_sach}</strong> sản phẩm</span>
              </div>

              <div className="d-flex gap-3 mb-5">
                <button className="custom-btn1 flex-fill" onClick={addToCart}>Thêm vào giỏ hàng</button>
                <button className="custom-btn2 flex-fill" onClick={buyNow}>Mua ngay</button>
              </div>

              {/* MÔ TẢ - CÓ XEM THÊM */}
              <div>
                <h4 className="fw-bold mb-3" style={{ color: "#cf7600" }}>Mô tả sản phẩm</h4>
                <div id="desc-content" style={{ fontSize: "1.02rem", lineHeight: "1.8", color: "#444", maxHeight: "240px", overflow: "hidden", position: "relative", transition: "max-height .6s ease" }}>
                  {book.mo_ta ? <div style={{ whiteSpace: "pre-line" }}>{book.mo_ta}</div> : <i className="text-muted">Chưa có mô tả.</i>}
                  <div id="fade" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(transparent, white 90%)", pointerEvents: "none", opacity: 1, transition: "opacity .4s" }} />
                </div>
                <div className="text-center mt-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById("desc-content");
                      const fade = document.getElementById("fade");
                      const btn = document.getElementById("toggle-btn");
                      if (el && fade && btn) {
                        if (el.style.maxHeight === "240px" || !el.style.maxHeight) {
                          el.style.maxHeight = el.scrollHeight + 100 + "px";
                          fade.style.opacity = "0";
                          btn.innerHTML = "Thu gọn ↑";
                        } else {
                          el.style.maxHeight = "240px";
                          fade.style.opacity = "1";
                          btn.innerHTML = "Xem thêm ↓";
                        }
                      }
                    }}
                    id="toggle-btn"
                    className="btn btn-warning rounded-pill px-5 shadow"
                  >
                    Xem thêm ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BÌNH LUẬN */}
        <div className="mt-5 card border-0 shadow-lg rounded-4">
          <div className="card-body p-5">
            <h3 className="fw-bold mb-4" style={{ color: "#d57200" }}>Bình luận ({comments.length})</h3>
            <textarea className="form-control mb-3" rows={4} placeholder="Viết bình luận..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ borderRadius: 12 }} />
            <button onClick={handleSubmitComment} disabled={isSubmittingComment} className="btn btn-warning rounded-pill px-5">{isSubmittingComment ? "Đang gửi..." : "Gửi bình luận"}</button>
            <div className="mt-4">
              {comments.length === 0 ? <p className="text-muted text-center">Chưa có bình luận nào.</p> : comments.map((c) => (
                <div key={c.id} className="bg-light p-3 rounded mb-3">
                  <strong style={{ color: "#d57200" }}>{c.user}</strong> <small className="text-muted">{new Date(c.created_at).toLocaleString("vi-VN")}</small>
                  <p className="mb-0 mt-1">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SẢN PHẨM LIÊN QUAN - CÓ ICON */}
        {relatedBooks.length > 0 && (
          <div className="mt-5">
            <h3 className="fw-bold mb-4" style={{ color: "#d57200", fontSize: "1.9rem" }}>Sản phẩm liên quan</h3>
            <div className="row g-4">
              {relatedBooks
                .filter((b, i, a) => i === a.findIndex(x => x.sach_id === b.sach_id))
                .slice(0, 8)
                .map((b) => {
                  const price = b.gia_sach - (b.gg_sach || 0);
                  const percent = b.gg_sach ? Math.round((b.gg_sach / b.gia_sach) * 100) : 0;
                  return (
                    <div key={b.sach_id} className="col-6 col-sm-4 col-md-3 col-lg-3">
                      <div className="card border-0 shadow rounded-4 overflow-hidden h-100 position-relative" style={{ transition: ".4s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-12px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                        <Link href={`/products/${b.sach_id}`}>
                          <img src={b.image || "/image/default-book.jpg"} className="card-img-top" style={{ height: 240, objectFit: "contain", background: "white", padding: 12 }} />
                        </Link>
                        {percent > 0 && <span className="position-absolute top-0 end-0 m-2 badge bg-danger rounded-pill">-{percent}%</span>}
                        <div className="card-body d-flex flex-column">
                          <Link href={`/products/${b.sach_id}`} className="text-decoration-none">
                            <h6 className="fw-bold mb-1" style={{ height: 48, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{b.ten_sach}</h6>
                          </Link>
                          <small className="text-success">{b.ten_tac_gia}</small>
                          <div className="mt-2">
                            <strong className="text-danger fs-5">{formatPrice(price)}</strong>
                            {b.gg_sach > 0 && <del className="text-muted small ms-2">{formatPrice(b.gia_sach)}</del>}
                          </div>
                          <div className="d-flex justify-content-center gap-2 mt-3">
                            <button className="btn btn-outline-info rounded-circle" style={{ width: 44, height: 44 }} onClick={() => window.location.href = `/products/${b.sach_id}`} title="Xem chi tiết">
                              <i className="bi bi-eye-fill"></i>
                            </button>
                            <button className="btn btn-warning rounded-circle" style={{ width: 44, height: 44 }} onClick={() => handleQuickBuy(b)} title="Mua nhanh">
                              <i className="bi bi-lightning-charge-fill text-white"></i>
                            </button>
                            <button className="btn btn-success rounded-circle" style={{ width: 44, height: 44 }} onClick={() => handleAddToCartRelated(b)} title="Thêm vào giỏ">
                              <i className="bi bi-cart-plus-fill text-white"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}