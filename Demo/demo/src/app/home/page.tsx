"use client";

import AboutBookbuy from "@/components/AboutBookbuy";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ Interface đầy đủ
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
  image?: string;
}

interface Category {
  loai_sach_id: number;
  ten_loai: string;
}

interface Discount {
  ma_gg: string;
  loai_giam: string;
  gia_tri_giam: number;
  giam_toi_da: number;
  don_toi_thieu: number;
  ngay_bd: string;
  ngay_kt: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  //  Import Bootstrap JS
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  //  Lấy danh sách sách
  useEffect(() => {
    fetch("http://localhost:3003/books")
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]));
  }, []);

  //  Lấy danh mục
  useEffect(() => {
    fetch("http://localhost:3003/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  //  Lấy mã giảm giá
  useEffect(() => {
    fetch("http://localhost:3003/api/ma-giam-gia")
      .then((res) => res.json())
      .then((data) => setDiscounts(Array.isArray(data) ? data : []))
      .catch(() => setDiscounts([]));
  }, []);

  //  Lọc theo từ khóa
  const filteredBooks = books.filter((b) =>
    b.ten_sach?.toLowerCase().includes(keyword.toLowerCase())
  );

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return Number(price).toLocaleString("vi-VN") + "đ";
  };

  return (
    <>
      {/* ================= Header ================= */}
      <header className="header shadow-sm border-bottom sticky-top bg-warning">
        <Container>
          <Row className="align-items-center py-2 g-2">
            <Col xs={6} sm={4} md={3} className="d-flex align-items-center">
              <Link href="/" className="d-flex align-items-center text-decoration-none">
                <img
                  src="/image/Grace.png"
                  alt="Logo"
                  style={{ height: "90px", width: "90px" }}
                  className="rounded-circle shadow-sm"
                />
                <span className="ms-2 fw-bold text-white fs-6 d-none d-md-inline">
                  Pibook
                </span>
              </Link>
            </Col>

            <Col xs={12} sm={6} md={6}>
              <input
                type="text"
                placeholder="🔍 Tìm sách, truyện, dụng cụ..."
                className="form-control search-bar"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Col>

            <Col
              xs={6}
              sm={2}
              md={3}
              className="d-flex justify-content-end align-items-center gap-2 text-white"
            >
              <i className="bi bi-telephone-fill fs-6"></i>
              <small className="d-none d-sm-inline">Hotline:</small>
              <span className="fw-bold">0857 226 757</span>
            </Col>
          </Row>
        </Container>
      </header>

      {/* ================ Banner ================ */}
      <Container fluid className="mt-3">
        <Row className="gx-3">
          {/* Sidebar */}
          <Col xs={12} md={3} className="mb-3">
            <div className="d-flex flex-column gap-3">
              {["abc.jpg", "abcd.jpg"].map((img, i) => (
                <div key={i} className="shadow-sm rounded overflow-hidden banner-small">
                  <img
                    src={`/image/${img}`}
                    alt={`Banner nhỏ ${i + 1}`}
                    className="w-100 rounded"
                    style={{
                      objectFit: "cover",
                      height: "190px",
                      borderRadius: "12px",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* Banner chính */}
          <Col xs={12} md={9} className="mb-3">
            <div className="rounded shadow overflow-hidden banner" style={{ height: "395px" }}>
              <div
                id="mainBanner"
                className="carousel slide h-100"
                data-bs-ride="carousel"
                data-bs-interval="3000"
              >
                <div className="carousel-inner h-100">
                  {[
                    "b9690ac7ec4b7c94d44d9e519b6c30e7.jpg",
                    "0f342e41bb8009c013ee9435f249b3d7.jpg",
                    "abcde.jpg",
                  ].map((img, i) => (
                    <div key={i} className={`carousel-item ${i === 0 ? "active" : ""} h-100`}>
                      <img
                        src={`/image/${img}`}
                        className="d-block w-100 h-100 banner-img"
                        alt={`Banner ${i + 1}`}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <Container fluid className="mt-3">
        {/* === 4 Banner nhỏ ngang phía dưới === */}
        <Row className="mt-3 gx-3">
          {[
            "banner-ngang-1.jpg",
            "banner-ngang-2.jpg",
            "banner-ngang-3.jpg",
            "banner-ngang-4.jpg",
          ].map((img, i) => (
            <Col key={i} xs={6} md={3} className="mb-3">
              <div className="shadow-sm rounded overflow-hidden banner-small-horizontal">
                <img
                  src={`/image/${img}`}
                  alt={`Banner ngang ${i + 1}`}
                  className="w-100 rounded"
                  style={{
                    objectFit: "cover",
                    height: "182px",
                    borderRadius: "12px",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
            </Col>
          ))}
        </Row>
        {/* === 2 banner ngang to phía dưới === */}
        <Row className="mt-3 g-3">
          {["banner-ngang-1.jpg", "banner-ngang-2.jpg"].map((b, i) => (
            <Col xs={12} md={6} key={i}>
              <div className="shadow-sm rounded overflow-hidden">
                <img
                  src="/image/block_1.jpg"
                  alt={`Banner ngang ${i + 1}`}
                  className="w-100 rounded"
                  style={{
                    objectFit: "cover",
                    height: "70px",
                    borderRadius: "12px",
                  }}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Container>
      
      {/* ✅ Danh mục */}
      <Container className="mt-5">
        {categories.length > 0 ? (
          <Row className="justify-content-center text-center g-4">
            {categories.map((cat) => {
              let iconClass = "bi-book";
              switch (cat.ten_loai) {
                case "Văn học Việt Nam":
                  iconClass = "bi-journal-bookmark-fill";
                  break;
                case "Văn học nước ngoài":
                  iconClass = "bi-globe2";
                  break;
                case "Kỹ năng sống":
                  iconClass = "bi-lightbulb-fill";
                  break;
                case "Thiếu nhi":
                  iconClass = "bi-balloon-heart-fill";
                  break;
                case "Truyện tranh":
                  iconClass = "bi-emoji-smile-fill";
                  break;
              }

              return (
                <Col
                  key={cat.loai_sach_id}
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2}
                  className="d-flex justify-content-center"
                >
                  <div
                    onClick={() => router.push(`/category/${cat.loai_sach_id}`)}
                    className="category-card shadow-sm bg-white rounded-4 p-4 w-100 text-center fw-semibold text-dark"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "2px solid #f1f1f1",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.07)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,193,7,0.4)";
                      e.currentTarget.style.borderColor = "#ffc107";
                      const icon = e.currentTarget.querySelector("i");
                      if (icon) icon.style.color = "#ffc107";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "#f1f1f1";
                      const icon = e.currentTarget.querySelector("i");
                      if (icon) icon.style.color = "#333";
                    }}
                  >
                    <i
                      className={`bi ${iconClass} mb-3`}
                      style={{ fontSize: "2.8rem", color: "#333", transition: "color 0.3s ease" }}
                    ></i>
                    <div className="text-truncate">{cat.ten_loai}</div>
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className="text-center text-muted">Không có danh mục nào để hiển thị.</p>
        )}
      </Container>


      {/* ✅ ================ MÃ GIẢM GIÁ ================ */}
      <Container className="mt-5 mb-5">
        <h2 className="section-title mb-4 text-center">🎟️ Mã Giảm Giá Hấp Dẫn</h2>

        {discounts.length > 0 ? (
          <Row className="g-4 justify-content-center">
            {discounts.map((d, i) => (
              <Col key={i} xs={12} sm={6} md={4} lg={3}>
                <Card className="shadow-lg border-0 h-100 discount-card">
                  <Card.Body className="text-center d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold text-warning mb-2">{d.ma_gg}</h5>
                      <p className="text-muted mb-1">
                        {d.loai_giam === "percent"
                          ? `Giảm ${d.gia_tri_giam}% (Tối đa ${Number(
                              d.giam_toi_da
                            ).toLocaleString("vi-VN")}đ)`
                          : `Giảm ${Number(d.gia_tri_giam).toLocaleString("vi-VN")}đ`}
                      </p>
                      <p className="text-muted small mb-2">
                        Đơn tối thiểu:{" "}
                        <span className="fw-semibold">
                          {Number(d.don_toi_thieu).toLocaleString("vi-VN")}đ
                        </span>
                      </p>
                      <p className="text-secondary small mb-2">
                        HSD: {new Date(d.ngay_kt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <div>
                      <Button
                        variant="warning"
                        className="mt-2 fw-semibold"
                        onClick={() => {
                          navigator.clipboard.writeText(d.ma_gg);
                          alert(`🎉 Đã sao chép mã: ${d.ma_gg}`);
                        }}
                      >
                        Sao chép mã
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center text-muted">Hiện chưa có mã giảm giá nào.</p>
        )}
      </Container>
      
      {/* ✅ Danh sách sách */}
<Container className="mt-5">
  <h2 className="section-title mb-4">Sách Mới</h2>

  {/* ⚡ Lọc bỏ sách trùng nhau theo sach_id */}
  {(() => {
    const uniqueBooks: any[] = [];
    const seen = new Set();

    for (const book of filteredBooks) {
      if (!seen.has(book.sach_id)) {
        seen.add(book.sach_id);
        uniqueBooks.push(book);
      }
    }

    return (
      <Row>
        {uniqueBooks.length > 0 ? (
          uniqueBooks.slice(0, 12).map((book) => (
            <Col
              key={book.sach_id}
              xs={6}
              sm={6}
              md={4}
              lg={3}
              className="mb-4"
            >
              <Card
                className="product-card h-100 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/products/${book.sach_id}`)}
              >
                <Card.Img
                  variant="top"
                  src={book.image || "/image/default-book.jpg"}
                  alt={book.ten_sach}
                  className="p-2"
                  style={{
                    height: "230px",
                    objectFit: "contain",
                    borderRadius: "10px",
                  }}
                />
                <Card.Body className="text-center">
                  <Card.Title className="fw-bold mb-1 text-danger">
                    {book.ten_sach}
                  </Card.Title>
                  <Card.Text className="text-success mb-1">
                    {book.ten_tac_gia}
                  </Card.Text>
                  <Card.Text className="text-primary mb-1">
                    Loại bìa: {book.loai_bia}
                  </Card.Text>
                  <h6 className="text-danger">{formatPrice(book.gia_sach)}</h6>
                  <Button
                    variant="warning"
                    className="w-100 mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products/${book.sach_id}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">Không có sách nào để hiển thị</p>
        )}
      </Row>
    );
  })()}
</Container>


      <AboutBookbuy />
      {/* ================ News Section ================ */}
      <Container className="mt-5">
        <h2 className="section-title">📰 Tin Tức & Blog</h2>
        <Row>
          {[
            {
              id: 1,
              title: "LMHT: Top 5 tuyển thủ Đường Giữa tại CKTG 2022",
              image: "/image/Tong-quan-20.jpg",
              desc: "Danh sách những cuốn sách hay, được nhiều độc giả bình chọn.",
            },
            {
              id: 2,
              title: "Lịch thi đấu Chung kết thế giới LMHT 2025",
              image:
                "/image/ket-qua-chung-ket-the-gioi-2_b474288dc1154ec0834cc89aa1f966eb_1024x1024.jpg",
              desc: "Khám phá cách sử dụng bảng vẽ để học tập sáng tạo hơn.",
            },
            {
              id: 3,
              title: "Bắt cóc con nít người chơi Yasuo xuất sắc nhất",
              image: "/image/1735121535_Yasuonhba.png",
              desc: "Khuyến khích sinh viên đọc sách mỗi ngày để nâng cao kiến thức.",
            },
          ].map((news) => (
            <Col key={news.id} xs={12} md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={news.image}
                  alt={news.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{news.title}</Card.Title>
                  <Card.Text>{news.desc}</Card.Text>
                  <Button variant="link" className="p-0 text-warning">
                    Đọc tiếp →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
