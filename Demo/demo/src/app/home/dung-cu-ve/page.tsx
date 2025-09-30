"use client";

import Link from "next/link";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function SachPage() {
  return (
    <Container className="mt-4">
      {/* Nút quay lại */}
      <div className="mb-3">
        <Link href="/home" passHref>
          <Button variant="secondary">⬅ Quay lại Trang chủ</Button>
        </Link>
      </div>

      <h3 className="mb-4">📚 Dụng Cụ Vẽ - VPP</h3>
      <Row>
        {/* sản phẩm 1 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-5%</span>
            <Link href="/sach/1">
              <Card.Img
                variant="top"
                src="https://cdn1.fahasa.com/media/catalog/product/i/m/image_234877.jpg"
                alt="Bộ Dụng Cụ Vẽ DOMS Wow Kit 7902"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/1" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Bộ Dụng Cụ Vẽ DOMS Wow Kit 7902</Card.Title>
              </Link>
              <p className="text-success">Thương hiệu:DOMS</p>
              <h5 className="text-danger fw-bold">23,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">28,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 2 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-5%</span>
            <Link href="/sach/2">
              <Card.Img
                variant="top"
                src="https://cdn1.fahasa.com/media/catalog/product/i/m/image_235542.jpg"
                alt="Bộ Dụng Cụ Vẽ DOMS Painting Kit 7254"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/2" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Bộ Dụng Cụ Vẽ DOMS Painting Kit 7254</Card.Title>
              </Link>
              <p className="text-success">Thương hiệu:DOMS Xuất xứ:Thương Hiệu Ấn Độ</p>
              <h5 className="text-danger fw-bold">109,500đ</h5>
              <p className="text-muted text-decoration-line-through m-0">129,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 3 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-20%</span>
            <Link href="/sach/3">
              <Card.Img
                variant="top"
                src="https://cdn1.fahasa.com/media/catalog/product/8/9/8906073776670-1.jpg"
                alt="Đi Tìm Lẽ Sống"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/3" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Bộ Dụng Cụ Vẽ DOMS Junior Art Kit 7667</Card.Title>
              </Link>
              <p className="text-success">Thương hiệu:DOMS Xuất xứ:Thương Hiệu Ấn Độ</p>
              <h5 className="text-danger fw-bold">184,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">200,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 4 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-5%</span>
            <Link href="/sach/4">
              <Card.Img
                variant="top"
                src="https://cdn1.fahasa.com/media/catalog/product/8/9/8935088534234.jpg"
                alt="Đắc Nhân Tâm"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/4" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Vẽ Truyện Tranh Phong Cách Nhật Bản - Vũ Khí Và Đạo Cụ Trong Xây Dựng Bối Cảnh</Card.Title>
              </Link>
              <p className="text-success">Tác giả:Nhiều Tác Giả
              Nhà xuất bản:Hồng Đức Hình thức bìa:Bìa Mềm</p>
              <h5 className="text-danger fw-bold">142,500đ</h5>
              <p className="text-muted text-decoration-line-through m-0">150,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 5 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-30%</span>
            <Link href="/sach/5">
              <Card.Img
                variant="top"
                src="https://cdn1.fahasa.com/media/catalog/product/c/o/combo-8935212360388-8935212360395.jpg"
                alt="Nhà Giả Kim"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/5" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Combo Sách Những Người Bạn Rau Củ: Những "Vệ Sĩ" Của Môi Trường + Con Yêu, Đừng Sợ Rau Xanh! (Bộ 2 Cuốn)</Card.Title>
              </Link>
              <p className="text-success">Nhà cung cấp:Đinh TịTác giả:Claudio Gobbetti, Diyana Nikolova</p>
              <h5 className="text-danger fw-bold">70,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">100,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 6 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-25%</span>
            <Link href="/sach/6">
              <Card.Img
                variant="top"
                src="https://bookbuy.vn/Res/Images/Product/sach-to-mau-harry-potter_48914_1.jpg"
                alt="Harry Potter Tập 1"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/6" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Cùng Con Chống Nạn Bắt Nạt - Các Công Cụ Thiết Thực Để Bảo Vệ Và Xây Dựng Sự Mạnh Mẽ Cho Con Bạn</Card.Title>
              </Link>
              <p className="text-success">Nhà cung cấp:Minh Long Tác giả:Stella O'Malley</p>
              <h5 className="text-danger fw-bold">108,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">200,000đ</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
