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
  image?: string; // ✅ thêm để nhận URL ảnh
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  // ✅ Import Bootstrap JS khi mount
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  // ✅ Lấy dữ liệu từ API server.js
  useEffect(() => {
    fetch("http://localhost:3003/books")
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]));
  }, []);

  // ✅ Lọc theo từ khóa
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
                  src="/image/z7124556721378_d0b1e93464381adf72fe03e78d1e91ba.jpg"
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
        <Row className="gx-3">
          {/* Sidebar (2 banner nhỏ dọc) */}
          <Col xs={12} md={3} className="mb-3">
            <div className="d-flex flex-column gap-3">
              <div className="shadow-sm rounded overflow-hidden banner-small">
                <img
                  src="/image/abc.jpg"
                  alt="Banner nhỏ 1"
                  className="w-100 rounded"
                  style={{
                    objectFit: "cover",
                    height: "190px",
                    borderRadius: "12px",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
              <div className="shadow-sm rounded overflow-hidden banner-small">
                <img
                  src="/image/abcd.jpg"
                  alt="Banner nhỏ 2"
                  className="w-100 rounded"
                  style={{
                    objectFit: "cover",
                    height: "190px",
                    borderRadius: "12px",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
            </div>
          </Col>

          {/* Banner chính (carousel) */}
          <Col xs={12} md={9} className="mb-3">
            <div
              className="rounded shadow overflow-hidden banner"
              style={{ height: "395px" }}
            >
              <div
                id="mainBanner"
                className="carousel slide h-100"
                data-bs-ride="carousel"
                data-bs-interval="3000"
              >
                <div className="carousel-inner h-100">
                  <div className="carousel-item active h-100">
                    <img
                      src="/image/b9690ac7ec4b7c94d44d9e519b6c30e7.jpg"
                      className="d-block w-100 h-100 banner-img"
                      alt="Banner 1"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src="/image/0f342e41bb8009c013ee9435f249b3d7.jpg"
                      className="d-block w-100 h-100 banner-img"
                      alt="Banner 2"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src="/image/abcde.jpg"
                      className="d-block w-100 h-100 banner-img"
                      alt="Banner 3"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

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

        <style jsx>{`
          .banner-small img:hover,
          .banner-small-horizontal img:hover {
            transform: scale(1.05);
          }
        `}</style>

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


      {/* ================ Danh mục ================ */}
      <Container className="mt-4">
        <Row className="justify-content-center text-center g-2">
          {[
            { src: "https://nhasachphuongnam.com/images/promo/274/lego.png", label: "Lego", id: 1 },
            { src: "https://nhasachphuongnam.com/images/promo/274/puzzlr.png", label: "Jigsaw/Puzzle", id: 2 },
            { src: "https://nhasachphuongnam.com/images/promo/274/manga.png", label: "Manga", id: 3 },
            { src: "https://nhasachphuongnam.com/images/promo/274/gift.png", label: "Gift Books For You", id: 4 },
            { src: "https://nhasachphuongnam.com/images/promo/274/teen.png", label: "Tiệc Sách Tuổi Teen", id: 5 },
            { src: "https://nhasachphuongnam.com/images/promo/274/s%C3%A1ch_c%C5%A9.png", label: "Phiên Chợ Sách Cũ", id: 6 },
          ].map((cat, index) => (
            <Col
              key={index}
              xs={6}
              sm={4}
              md={3}
              lg={2}
              className="d-flex flex-column align-items-center mb-3"
              style={{ padding: "4px" }}
            >
              <Link
                href={`/category/${cat.id}`}
                className="text-decoration-none text-dark"
                style={{ transition: "transform 0.25s ease" }}
              >
                <div className="d-flex justify-content-center align-items-center" style={{ width: "130px", height: "130px" }}>
                  <img src={cat.src} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <small className="mt-2 fw-semibold d-block">{cat.label}</small>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================ Danh sách Sách ================ */}
      <Container className="mt-5">
        <h2 className="section-title">📚 Danh Sách Sách</h2>
        <Row>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <Col key={book.sach_id} xs={6} sm={6} md={4} lg={3} className="mb-4">
                <Card className="product-card h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={
                      book.image && book.image.trim() !== ""
                        ? book.image
                        : "/image/default-book.jpg"
                    }
                    alt={book.ten_sach}
                    className="p-3"
                    style={{
                      height: "250px",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                  />

                  <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                    <div className="text-center w-100">
                      <Card.Title className="text-truncate fw-bold">
                        {book.ten_sach}
                      </Card.Title>

                      <Card.Text className="text-success fw-semibold">
                        {book.ten_tac_gia}
                      </Card.Text>

                      <Card.Text className="text-primary">
                        Loại bìa: {book.loai_bia}
                      </Card.Text>

                      <h5 className="text-danger mb-0">
                        {formatPrice(book.gia_sach)}
                      </h5>
                    </div>

                    <Button
                      variant="warning"
                      className="w-100 mt-3"
                      onClick={() => router.push(`/products/${book.sach_id}`)}
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
      </Container>

      <AboutBookbuy />
    </>
  );
}
