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
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-15%</span>
            <Link href="/sach/1">
              <Card.Img
                variant="top"
                src="https://bookbuy.vn/Res/Images/Product/luat-hap-dan-tien-bac-cach-thu-hut-su-giau-co-va-thinh-vuong_139785_1.jpg"
                alt="Luật Hấp Dẫn Tiền Bạc"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/1" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Luật Hấp Dẫn Tiền Bạc</Card.Title>
              </Link>
              <p className="text-success">Joseph Murphy</p>
              <h5 className="text-danger fw-bold">84,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">99,000đ</p>
            </Card.Body>
          </Card>
        </Col>

        {/* sản phẩm 2 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-10%</span>
            <Link href="/sach/2">
              <Card.Img
                variant="top"
                src="https://bookbuy.vn/Res/Images/Product/muon-trung-xu-so_139784_1.jpg"
                alt="Muôn Trùng Xứ Sở"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/2" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Muôn Trùng Xứ Sở</Card.Title>
              </Link>
              <p className="text-success">Thỏong Đành Kể Chuyện</p>
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
                src="https://bookbuy.vn/Res/Images/Product/di-tim-le-song-tai-ban-2016-_9581_1.jpg"
                alt="Đi Tìm Lẽ Sống"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/3" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Đi Tìm Lẽ Sống</Card.Title>
              </Link>
              <p className="text-success">Victor Frankl</p>
              <h5 className="text-danger fw-bold">72,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">90,000đ</p>
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
                src="https://bookbuy.vn/Res/Images/Product/dac-nhan-tam-bia-mem_76375_1.jpg"
                alt="Đắc Nhân Tâm"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/4" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Đắc Nhân Tâm</Card.Title>
              </Link>
              <p className="text-success">Dale Carnegie</p>
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
                src="https://bookbuy.vn/Res/Images/Product/nha-gia-kim-tai-ban-2020-_107793_1.jpg"
                alt="Nhà Giả Kim"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/5" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Nhà Giả Kim</Card.Title>
              </Link>
              <p className="text-success">Paulo Coelho</p>
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
                <Card.Title className="fs-6">Harry Potter Tập 1</Card.Title>
              </Link>
              <p className="text-success">J.K. Rowling</p>
              <h5 className="text-danger fw-bold">150,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">200,000đ</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
