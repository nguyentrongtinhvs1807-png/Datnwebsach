"use client";

import AboutBookbuy from "@/components/AboutBookbuy";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  hot?: number;
}

export default function Home() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const filteredSaleProducts = saleProducts.filter((p) =>
    p.name?.toLowerCase().includes(keyword.toLowerCase())
  );
  const filteredHotProducts = hotProducts.filter((p) =>
    p.name?.toLowerCase().includes(keyword.toLowerCase())
  );

  useEffect(() => {
    fetch("http://localhost:3003/saleProducts")
      .then((res) => res.json())
      .then((data) => setSaleProducts(Array.isArray(data) ? data : []))
      .catch(() => setSaleProducts([]));

    fetch("http://localhost:3003/hotProducts")
      .then((res) => res.json())
      .then((data) => setHotProducts(Array.isArray(data) ? data : []))
      .catch(() => setHotProducts([]));
  }, []);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "Liên hệ";
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
                  src="https://png.pngtree.com/png-clipart/20200727/original/pngtree-book-store-logo-template-sale-learning-logo-designs-vector-png-image_5272617.jpg"
                  alt="Logo"
                  style={{ height: "50px" }}
                  className="rounded-circle shadow-sm"
                />
                <span className="ms-2 fw-bold text-white fs-6 d-none d-md-inline">
                  BookStore <small className="text-light opacity-75">- Sách hay mỗi ngày</small>
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

      {/* ================ Sidebar + Banner ================ */}
      <Container fluid className="mt-3">
        <Row className="gx-3">
          {/* Sidebar */}
          <Col xs={12} md={3} className="mb-3">
            <div className="sidebar shadow-sm rounded bg-white h-100">
              <h6 className="p-3 border-bottom d-flex align-items-center justify-content-between fw-bold">
                Tất Cả Danh Mục <FaChevronDown />
              </h6>
              <ul className="list-unstyled m-0 p-3 categories-list">
                <li><Link href="./home/sach">📚 Sách - Truyện Tranh</Link></li>
                <li><Link href="./home/dung-cu-ve">🎨 Dụng Cụ Vẽ - VPP</Link></li>
                <li><Link href="./home/bang-ve">💻 Bảng Vẽ - Phụ Kiện Số</Link></li>
                <li><Link href="./home/bach-hoa">🛒 Bách Hóa Online</Link></li>
                <li><Link href="./home/qua-tang">🎁 Quà Tặng - Đồ Chơi</Link></li>
                <li><Link href="/category/cong-nghe">⚙️ Công Nghệ</Link></li>
                <li><Link href="/category/dung-cu-hoc-sinh">✏️ Dụng Cụ Học Sinh</Link></li>
              </ul>
            </div>
          </Col>

          {/* Banner */}
          <Col xs={12} md={9} className="mb-3">
            <div className="rounded shadow overflow-hidden banner">
              <div
                id="mainBanner"
                className="carousel slide"
                data-bs-ride="carousel"
                data-bs-interval="2000"
              >
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img
                      src="https://bookbuy.vn/Res/Images/Album/d2454ade-31db-41b6-80c6-80694f91080c.jpg"
                      className="d-block w-100 banner-img"
                      alt="Banner 1"
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src="https://bookbuy.vn/Res/Images/Album/bdc99479-f8af-499a-b726-b39b2d7e8f37.jpg"
                      className="d-block w-100 banner-img"
                      alt="Banner 2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ================ Category Icons ================ */}
      <Container className="mt-5">
        <Row className="justify-content-center text-center g-4">
          {[
            { icon: "⚡", label: "Flashsale", color: "bg-danger" },
            { icon: "🔥", label: "Hot deal", color: "bg-warning" },
            { icon: "📖", label: "Văn học", color: "bg-primary" },
            { icon: "📚", label: "Blog sách hay", color: "bg-success" },
            { icon: "👶", label: "Thiếu nhi", color: "bg-warning" },
            { icon: "💵", label: "Kinh tế", color: "bg-success" },
          ].map((cat, index) => (
            <Col
              key={index}
              xs={6} sm={4} md={3} lg={2}
              className="d-flex flex-column align-items-center"
            >
              <div className={`category-icon rounded-circle shadow ${cat.color}`}>
                {cat.icon}
              </div>
              <small className="mt-2 fw-semibold">{cat.label}</small>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================ Sale Products ================ */}
      <Container className="mt-5">
        <h2 className="section-title">🔥 Sản phẩm Mới</h2>
        <Row>
          {filteredSaleProducts.length > 0 ? (
            filteredSaleProducts.map((product) => (
              <Col key={product.id} xs={6} sm={6} md={4} lg={3} className="mb-4">
                <Card className="product-card h-100">
                  <span className="badge bg-success position-absolute top-0 start-0 m-2">Sale</span>
                  <Card.Img variant="top" src={product.image} alt={product.name} className="p-3 product-image" />
                  <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                    <div className="w-100 text-center mb-2">
                      <Card.Title className="text-truncate">{product.name}</Card.Title>
                      <h5 className="text-danger">{formatPrice(product.price)}</h5>
                      {product.originalPrice && (
                        <p className="text-muted text-decoration-line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <Button variant="warning" className="w-100" onClick={() => router.push(`/products/${product.id}`)}>Xem chi tiết</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">Không tìm thấy sản phẩm nào</p>
          )}
        </Row>
      </Container>

      {/* ================ Hot Products ================ */}
      <Container className="mt-5">
        <h2 className="section-title">⭐ Sản phẩm Nổi Bật</h2>
        <Row>
          {filteredHotProducts.length > 0 ? (
            filteredHotProducts.map((product) => (
              <Col key={product.id} xs={6} sm={6} md={4} lg={3} className="mb-4">
                <Card className="product-card h-100">
                  <span className="badge bg-warning position-absolute top-0 start-0 m-2">Hot</span>
                  <Card.Img variant="top" src={product.image} alt={product.name} className="p-3 product-image" />
                  <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                    <div className="w-100 text-center mb-2">
                      <Card.Title className="text-truncate">{product.name}</Card.Title>
                      <h5 className="text-danger">{formatPrice(product.price)}</h5>
                      {product.originalPrice && (
                        <p className="text-muted text-decoration-line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <Button variant="warning" className="w-100" onClick={() => router.push(`/products/${product.id}`)}>Xem chi tiết</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">Không tìm thấy sản phẩm nào</p>
          )}
        </Row>
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
        image: "/image/ket-qua-chung-ket-the-gioi-2_b474288dc1154ec0834cc89aa1f966eb_1024x1024.jpg",
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
