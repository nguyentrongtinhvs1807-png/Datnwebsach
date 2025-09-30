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

      <h3 className="mb-4">📚 QÙA TẶNG - ĐỒ CHƠI</h3>
      <Row>
        {/* sản phẩm 1 */}
        <Col md={3} className="mb-4">
          <Card className="h-100 shadow-sm position-relative">
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">-15%</span>
            <Link href="/sach/1">
              <Card.Img
                variant="top"
                src="https://bookbuy.vn/Res/Images/Product/mat-na-haloween-hinh-canh-buom-danh-cho-phai-nu-_47138_2.jpg?w=135&scale=canvas&h=135"
                alt="Mặt Nạ Hóa Trang Vũ Hội Halloween Hình Cánh Bướm Dành Cho Phái Nữ"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/1" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Mặt Nạ Hóa Trang Vũ Hội Halloween Hình Cánh Bướm Dành Cho Phái Nữ</Card.Title>
              </Link>
              <p className="text-success"></p>
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
                src="https://bookbuy.vn/Res/Images/Product/non-qua-bi-halloween_47178_2.jpg"
                alt="Nón Quả Bí Halloween Vải Nỉ"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/2" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Nón Quả Bí Halloween Vải Nỉ</Card.Title>
              </Link>
              <p className="text-success">Sản pHẩm Cho Ngày Lễ Halloween</p>
              <h5 className="text-danger fw-bold">209,500đ</h5>
              <p className="text-muted text-decoration-line-through m-0">330,000đ</p>
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
                src="https://thewowbox.net/home/wp-content/uploads/2021/07/IMG_7899.jpg"
                alt="[Quà tặng bé] THE BALANCE BOX – Bộ đồ chơi xếp gỗ cân bằng"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/3" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">[Quà tặng bé] THE BALANCE BOX – Bộ đồ chơi xếp gỗ cân bằng</Card.Title>
              </Link>
              <p className="text-success"> Quà tặng bé, Quà tặng bé 1-5 tuổi</p>
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
                src="https://cdn.tgdd.vn/Files/2015/11/17/741791/10-qua-tang-cho-game-thu-01.jpg"
                alt="Đắc Nhân Tâm"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/4" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">10 món quà 'nhìn là mê' dành cho người ghiền game</Card.Title>
              </Link>
              <p className="text-success">Minecraft Toys</p>
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
                src="https://sarahpaulsonfan.com/wp-content/uploads/2024/11/Do-Choi-Qua-Tang-Sinh-Nhat-1.jpg"
                alt="Nhà Giả Kim"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/5" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Đồ Chơi Quà Tặng Sinh Nhật - sarahpaulsonfan.com
                </Card.Title>
              </Link>
              <p className="text-success">Quà Tặng Sinh Nhật</p>
              <h5 className="text-danger fw-bold">120,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">200,000đ</p>
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
                src="https://cdn1.fahasa.com/media/catalog/product/c/o/combo-1604202500.jpg"
                alt="Harry Potter Tập 1"
                className="p-3"
                style={{ height: "250px", objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Card.Body>
              <Link href="/sach/6" className="text-decoration-none text-dark">
                <Card.Title className="fs-6">Combo Quà Tặng Đồ Chơi Bé Trai - Combo 1 - FAHASA.COM</Card.Title>
              </Link>
              <p className="text-success">	
              CÔNG TY CỔ PHẦN THẾ GIỚI ĐỒ CHƠI MEGATOYS</p>
              <h5 className="text-danger fw-bold">150,000đ</h5>
              <p className="text-muted text-decoration-line-through m-0">200,000đ</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
