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
}

export default function BookDetail() {
  const { id } = useParams() as { id: string };
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("/image/default-book.jpg");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Comments and related books
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const formatPrice = (price: number) =>
    `${Math.round(price).toLocaleString("vi-VN")} ₫`;

  // Fetch book info
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

  // Fetch additional images
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3003/books/${id}/images`)
      .then((r) => r.json())
      .then((data) => setImages(data.map((i: any) => i.URL)))
      .catch(() => setImages([]));
  }, [id]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3003/comments/${id}?status=1`)
      .then((r) => r.json())
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi lấy bình luận:", err);
        setComments([]);
      });
  }, [id]);

  // Fetch related books
  useEffect(() => {
    if (!book || !book.Loai_sach_id) return;
    fetch(`http://localhost:3003/books/related/${book.Loai_sach_id}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRelatedBooks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi lấy sách liên quan:", err);
        setRelatedBooks([]);
      });
  }, [book, id]);

  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.warning("Vui lòng đăng nhập để bình luận!");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        toast.warning("Phiên đăng nhập không hợp lệ!");
        return;
      }

      setIsSubmittingComment(true);
      const res = await fetch("http://localhost:3003/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: id,
          userId: user.id,
          content: commentText.trim(),
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        toast.success("Đã thêm bình luận!");
      } else {
        toast.error("Không thể thêm bình luận!");
      }
    } catch (error) {
      console.error("Lỗi thêm bình luận:", error);
      toast.error("Có lỗi xảy ra khi thêm bình luận!");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ĐÃ CẬP NHẬT: Thêm stock vào giỏ hàng
  const addToCart = () => {
    if (!book) return;
  
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/dangnhap?return=${returnUrl}`;
      return;
    }
  
    if (quantity > book.ton_kho_sach) {
      toast.warning(`Chỉ còn ${book.ton_kho_sach} sản phẩm trong kho!`);
      return;
    }
  
    const cartItem = {
      id: book.sach_id,
      name: book.ten_sach,
      price: book.gia_sach - (book.gg_sach || 0),
      image: mainImage,
      quantity: quantity,
      stock: book.ton_kho_sach,
    };
  
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((i: any) => i.id === book.sach_id);
  
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > book.ton_kho_sach) {
        toast.warning(`Tổng số lượng không được vượt quá tồn kho (${book.ton_kho_sach})!`);
        return;
      }
      cart[existingIndex].quantity = newQty;
      cart[existingIndex].stock = book.ton_kho_sach;
    } else {
      cart.push(cartItem);
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng!");
    setQuantity(1);
    
    // Dispatch event để header cập nhật số lượng giỏ hàng
    window.dispatchEvent(new Event("cart-update"));
  };

  // ĐÃ CẬP NHẬT: Mua ngay cũng lưu stock
    // MUA NGAY – ĐÃ SỬA HOÀN HẢO
    // MUA NGAY – BẮT BUỘC ĐĂNG NHẬP (CHỈ DÁN THAY HÀM CŨ)
const buyNow = () => {
  if (!book) return;

  // KIỂM TRA ĐĂNG NHẬP
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.warning("Vui lòng đăng nhập để mua hàng!");
    // Chuyển về trang đăng nhập + lưu lại trang hiện tại để quay lại sau khi đăng nhập
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/dangnhap?return=${returnUrl}`;
    return;
  }

  // Kiểm tra tồn kho
  if (quantity > book.ton_kho_sach) {
    toast.warning(`Chỉ còn ${book.ton_kho_sach} sản phẩm trong kho!`);
    return;
  }

  const selectedItem = {
    id: book.sach_id,
    name: book.ten_sach,
    price: book.gia_sach - (book.gg_sach || 0),
    image: mainImage || book.image || "/image/default-book.jpg",
    quantity: quantity,
    stock: book.ton_kho_sach, // Giữ lại để checkout kiểm tra
  };

  // Lưu vào checkoutItems
  localStorage.setItem("checkoutItems", JSON.stringify([selectedItem]));
  localStorage.removeItem("checkoutItem"); // Xóa key cũ

  // Chuyển hướng đến checkout
  window.location.href = "/checkout";
};

  // Loading state
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-danger" role="status" style={{ width: 70, height: 70 }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );

  // Book not found
  if (!book)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="text-center fw-bold fs-4 text-secondary">Không tìm thấy sách.</div>
      </div>
    );

  const salePercent = Math.round((book.gg_sach / book.gia_sach) * 100);

  return (
    <div
      className="book-detail-outer py-5"
      style={{
        background: "linear-gradient(120deg, #fff6e3 60%, #f7efd8 100%)",
        minHeight: "100vh"
      }}
    >
      <style>{`
        /* Giữ nguyên toàn bộ CSS đẹp của bạn */
        .book-detail-card { box-shadow: 0 10px 32px #ffd17e55, 0 3px 14px #00000013; border: none; }
        .book-main-img:hover { transform: scale(1.06) rotate(-2deg); }
        .thumb-scroll::-webkit-scrollbar { height: 6px; }
        .thumb-scroll::-webkit-scrollbar-thumb { background: #ffe7c4; border-radius: 3px; }
        .custom-btn1 { border: 2px solid #d49421; color: #d49421; background: #fff4e0; border-radius: 10px; padding: 12px 26px; font-weight: 600; font-size: 1.07rem; transition: all 0.22s; }
        .custom-btn1:hover { background: #ffe5bb; color: #bc8a09; transform: translateY(-2px) scale(1.03); }
        .custom-btn2 { border: 2px solid #fd6b64; color: #fff; background: linear-gradient(90deg,#fd6b64,#fec670); border-radius: 10px; padding: 12px 26px; font-weight: 600; font-size: 1.07rem; transition: all 0.22s; box-shadow: 0 4px 14px #feceb549; }
        .custom-btn2:hover { background: linear-gradient(90deg,#fec670, #fd6b64); color: #fffde7; transform: translateY(-2px) scale(1.03); }
        .sale-badge { font-size: 1.08rem; font-weight: 600; background: linear-gradient(90deg, #fda680, #ff6f43 68%, #fd475a 100%); color: #fff; border-radius: 22px; padding: 3px 16px; margin-left: 12px; }
        .price-flash-sale { font-weight: bold; font-size: 2.2rem; background: linear-gradient(90deg, #ff9028, #fd4766 80%); color: #fff; padding: 9px 30px 9px 26px; border-radius: 12px 35px 18px 12px; border: 2px solid #fff1cb; margin-bottom: 6px; display: inline-block; box-shadow: 0 8px 18px #fcbb7b15; }
        .old-price { font-size: 1.15rem; text-decoration: line-through; color: #848484; margin-left: 24px; }
        .info-label { min-width: 110px; color: #986200; font-weight: 500; }
        .stock-progress-bar { background: #ffe4c7; border-radius: 9px; overflow: hidden; height: 10px; }
        .stock-progress-inner { background: linear-gradient(90deg, #fd6b64 40%, #ffd605 100%); height: 100%; }
        .product-desc { border-radius: 12px; background: #fffde8; padding: 20px 24px; font-size: 1.02rem; color: #555; margin-top: 14px; box-shadow: 0 3px 15px #fff4e4; }
        .policy-box { background: linear-gradient(105deg, #fdf5e8 70%, #fffadc 100%); border-radius: 12px; padding: 18px 20px; margin-top: 28px; box-shadow: 0 2px 6px #ffffd175; }
        .img-thumbnail:hover { box-shadow: 0 0 14px #febf6d99, 0 2px 12px #fea46417; transform: scale(1.15); z-index: 2; }
      `}</style>

      <div className="container" style={{ maxWidth: 1160 }}>
        <Link
          href="/home"
          className="mb-4 d-inline-block text-decoration-none"
          style={{
            fontWeight: 600,
            color: "#d89c28",
            background: "#fff",
            border: "2px solid #ffd17e",
            padding: "6px 24px",
            borderRadius: "18px",
            fontSize: "1rem",
            boxShadow: "0 1px 12px #ffe8b871",
          }}
        >
          ← Quay lại danh sách
        </Link>

        <div className="row g-4 align-items-start">
          {/* Ảnh sản phẩm */}
          <div className="col-md-5">
            <div className="p-4 bg-white rounded-4 shadow-sm text-center book-detail-card">
              <img
                src={mainImage}
                alt={book.ten_sach}
                className="img-fluid rounded mb-4 book-main-img"
                style={{
                  height: "340px",
                  objectFit: "contain",
                  background: "#fffbe6",
                  borderRadius: "14px",
                  boxShadow: "0 8px 32px #ffe8b7aa",
                  border: "1.5px solid #ffeab9"
                }}
              />
              <div className="d-flex gap-2 mb-4 thumb-scroll overflow-auto justify-content-center">
                {(images.length ? images : [book.image || "/image/default-book.jpg"]).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Hình ${i + 1}`}
                    className="img-thumbnail"
                    style={{
                      width: "62px",
                      height: "76px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: img === mainImage ? "2px solid #fd6b64" : "1.5px solid #ffe3ae",
                      boxShadow: img === mainImage ? "0 0 8px #fd6b6464" : "0 2px 8px #fdc78d22",
                    }}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>

              <div className="policy-box text-start mt-3">
                <div className="fw-bold text-warning mb-2">Chính sách ưu đãi</div>
                <ul className="mb-0 small">
                  <li>Giao hàng nhanh, đóng gói cẩn thận toàn quốc</li>
                  <li>Miễn phí đổi trả trong vòng 7 ngày</li>
                  <li>Giảm giá cho khách mua số lượng lớn</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="col-md-7">
            <div className="p-4 bg-white rounded-4 shadow-sm border book-detail-card">
              <h2 className="mb-3" style={{ fontWeight: 800, color: "#d57200", fontSize: "2.05rem" }}>
                {book.ten_sach}
              </h2>

              <div className="row mb-4">
                <div className="col-sm-6">
                  <div className="d-flex mb-2 align-items-center">
                    <span className="info-label">Tác giả:</span>
                    <span className="fw-semibold text-danger ms-2">{book.ten_tac_gia || "Chưa rõ"}</span>
                  </div>
                  <div className="d-flex mb-2 align-items-center">
                    <span className="info-label">Nhà xuất bản:</span>
                    <span className="fw-semibold text-warning ms-2">{book.ten_NXB}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex mb-2 align-items-center">
                    <span className="info-label">Nhà cung cấp:</span>
                    <span className="fw-semibold text-primary ms-2">Pibbok</span>
                  </div>
                  <div className="d-flex mb-2 align-items-center">
                    <span className="info-label">Loại bìa:</span>
                    <span className="fw-semibold text-success ms-2">{book.loai_bia}</span>
                  </div>
                </div>
              </div>

              {/* Giá */}
              <div className="mb-4">
                {book.gg_sach > 0 ? (
                  <>
                    <span className="price-flash-sale">{formatPrice(book.gia_sach - book.gg_sach)}</span>
                    <span className="sale-badge">-{salePercent}%</span>
                    <span className="old-price">{formatPrice(book.gia_sach)}</span>
                  </>
                ) : (
                  <span className="price-flash-sale" style={{ background: "linear-gradient(90deg, #ffbb49, #f87c5e 70%)" }}>
                    {formatPrice(book.gia_sach)}
                  </span>
                )}
              </div>

              {/* Số lượng + tồn kho */}
              <div className="d-flex align-items-center mb-4 flex-wrap gap-3">
                <label className="fw-semibold" style={{ color: "#c28f17" }}>Số lượng:</label>
                <input
                  type="number"
                  min={1}
                  max={book.ton_kho_sach}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) {
                      setQuantity(Math.max(1, Math.min(book.ton_kho_sach, val)));
                    }
                  }}
                  className="form-control text-center"
                  style={{ width: 120, fontWeight: 600 }}
                />
                <span className="text-muted small fw-medium">
                  Còn lại:{" "}
                  <span style={{
                    color: book.ton_kho_sach > 10 ? "#28a745" : book.ton_kho_sach > 0 ? "#ffc107" : "#dc3545",
                    fontWeight: 700
                  }}>
                    {book.ton_kho_sach > 0 ? `${book.ton_kho_sach} sản phẩm` : "Hết hàng"}
                  </span>
                </span>
              </div>

              {/* Nút hành động */}
              <div className="d-flex gap-3 mb-4">
                <button className="custom-btn1 flex-fill" onClick={addToCart} style={{ minWidth: 170 }}>
                  Thêm vào giỏ hàng
                </button>
                <button className="custom-btn2 flex-fill" onClick={buyNow} style={{ minWidth: 170 }}>
                  Mua ngay
                </button>
              </div>
              {/* Mô tả */}
              <div className="product-desc">
                <div className="fw-bold mb-2" style={{ color: "#cf7600" }}>
                  Mô tả sản phẩm
                </div>
                <div
                  style={{
                    whiteSpace: "pre-line",
                    textAlign: "justify",
                    background: "#fff6e7",
                    borderRadius: 7,
                    padding: 4,
                  }}
                >
                  {book.mo_ta || (
                    <span className="text-secondary">Chưa có mô tả cho sản phẩm này.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần Bình luận */}
        <div className="mt-5">
          <div className="card border-0 shadow-lg" style={{ borderRadius: "20px", background: "rgba(255,255,255,0.98)" }}>
            <div className="card-body p-4">
              <h3 className="fw-bold mb-4" style={{ color: "#d57200", fontSize: "1.8rem" }}>
                Bình luận ({comments.length})
              </h3>

              {/* Form thêm bình luận */}
              <div className="mb-4">
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Viết bình luận của bạn..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #ffe8b7",
                      fontSize: "1rem",
                      padding: "12px 16px",
                      resize: "vertical"
                    }}
                  />
                </div>
                <button
                  className="btn fw-bold"
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment}
                  style={{
                    borderRadius: "20px",
                    background: "linear-gradient(90deg, #f7ca57, #efb14e)",
                    border: "none",
                    color: "white",
                    padding: "10px 30px",
                    fontSize: "1rem"
                  }}
                >
                  {isSubmittingComment ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>

              {/* Danh sách bình luận */}
              <div className="mt-4">
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 rounded"
                        style={{
                          background: "#fffbe8",
                          border: "1px solid #ffe8b7",
                          borderRadius: "12px"
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="fw-bold" style={{ color: "#d57200", fontSize: "1rem" }}>
                              {comment.user || "Người dùng"}
                            </span>
                            <span className="text-muted small ms-2">
                              {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="mb-0" style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6 }}>
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phần Sản phẩm liên quan */}
        {relatedBooks.length > 0 && (
          <div className="mt-5">
            <div className="mb-4">
              <h3 className="fw-bold" style={{ color: "#d57200", fontSize: "1.8rem" }}>
                Sản phẩm liên quan
              </h3>
              <p className="text-muted">Các sách cùng thể loại bạn có thể quan tâm</p>
            </div>
            <div className="row g-4">
              {relatedBooks
                .filter((book, index, self) => 
                  index === self.findIndex((b) => b.sach_id === book.sach_id)
                )
                .slice(0, 4)
                .map((relatedBook, index) => (
                <div key={`related-${relatedBook.sach_id}-${index}`} className="col-sm-6 col-md-4 col-lg-3">
                  <Link
                    href={`/products/${relatedBook.sach_id}`}
                    className="card border-0 shadow-lg text-decoration-none h-100"
                    style={{
                      borderRadius: "20px",
                      background: "linear-gradient(120deg,#fffbe8 80%,#fff6e9 100%)",
                      transition: "all 0.25s cubic-bezier(.2,.68,.37,.98)",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 12px 40px #f7ca5749";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div
                      style={{
                        height: "200px",
                        background: "#fffbe6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopLeftRadius: "20px",
                        borderTopRightRadius: "20px",
                        padding: "16px"
                      }}
                    >
                      <img
                        src={relatedBook.image || "/image/default-book.jpg"}
                        alt={relatedBook.ten_sach}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain"
                        }}
                      />
                    </div>
                    <div className="card-body text-center d-flex flex-column">
                      <h6
                        className="fw-bold mb-2"
                        style={{
                          fontSize: "1rem",
                          color: "#222",
                          minHeight: "40px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {relatedBook.ten_sach}
                      </h6>
                      <p className="text-muted small mb-2" style={{ fontSize: "0.9rem" }}>
                        {relatedBook.ten_tac_gia}
                      </p>
                      <div className="mt-auto">
                        {relatedBook.gg_sach > 0 ? (
                          <div>
                            <span className="fw-bold text-danger fs-5">
                              {formatPrice(relatedBook.gia_sach - relatedBook.gg_sach)}
                            </span>
                            <div className="text-decoration-line-through text-muted small">
                              {formatPrice(relatedBook.gia_sach)}
                            </div>
                          </div>
                        ) : (
                          <span className="fw-bold text-danger fs-5">
                            {formatPrice(relatedBook.gia_sach)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
