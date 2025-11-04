"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Table, Button, Image, Card, Badge } from "react-bootstrap";

interface Product {
  id: number;
  ten_sp: string;
  tac_gia: string;
  gia: number;
  hinh: string;
}

interface Category {
  id: number;
  ten_dm: string;
  mo_ta?: string;
}

export default function AdminDanhMucChiTietPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const resCat = await fetch(`${API_URL}/categories/${id}`);
        const catData = await resCat.json();
        setCategory(catData);

        const resProd = await fetch(`${API_URL}/categories/${id}/products`);
        const prodData = await resProd.json();
        setProducts(prodData);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_URL]);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#3A54C1", letterSpacing: "1px" }}>
            <i className="bi bi-layer me-2"></i>
            Danh mục: <span className="text-dark">{category ? category.ten_dm : "Đang tải..."}</span>
          </h2>
          {category?.mo_ta && (
            <div className="text-secondary fst-italic small mb-1">
              <i className="bi bi-info-circle me-1"></i>
              {category.mo_ta}
            </div>
          )}
        </div>
        <Link href="/admin/danhmuc" className="text-decoration-none">
          <Button variant="outline-primary" className="shadow-sm fw-semibold px-4 py-2" style={{borderRadius: "10px"}}>
            <i className="bi bi-arrow-left-short me-1"></i>
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Table or List Grid */}
      {loading ? (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
          <div className="fw-medium mt-2" style={{ fontSize: "18px" }}>Đang tải sản phẩm...</div>
        </div>
      ) : products.length > 0 ? (
        <div>
          <div className="mb-3 d-flex align-items-center justify-content-between">
            <h5 className="fw-semibold mb-0 text-secondary">
              <i className="bi bi-book-half me-1"></i>
              Số lượng sản phẩm: 
              <Badge bg="info" text="dark" className="ms-2 px-3 py-2 fs-6">
                {products.length}
              </Badge>
            </h5>
          </div>
          {/* Responsive Card Grid if width < lg, else Table */}
          <div className="d-none d-lg-block">
            {/* Table for desktop */}
            <Table bordered hover responsive className="shadow-sm rounded-3 overflow-hidden align-middle mb-0" style={{ background: "#fff" }}>
              <thead style={{ background: "linear-gradient(90deg, #3A54C1 0%, #4FDFFF 100%)", color: "white" }} className="text-center">
                <tr>
                  <th style={{fontWeight:700}}>ID</th>
                  <th style={{fontWeight:700}}>Ảnh</th>
                  <th style={{fontWeight:700, minWidth:160}}>Tên sản phẩm</th>
                  <th style={{fontWeight:700, minWidth:120}}>Tác giả</th>
                  <th style={{fontWeight:700, minWidth:120}}>Giá</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="text-center fw-semibold">{p.id}</td>
                    <td className="text-center">
                      <Image
                        src={p.hinh || "/image/default-book.jpg"}
                        alt={p.ten_sp}
                        width={60} height={60} rounded
                        style={{ objectFit: "cover", boxShadow: "0 3px 12px rgba(110,120,150,.1)" }}
                      />
                    </td>
                    <td className="fw-bold text-primary" style={{fontSize:"1.1rem"}}>
                      {p.ten_sp}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border border-1 px-3 py-2" style={{fontWeight:600}}>
                        {p.tac_gia || <span className="text-muted">—</span>}
                      </span>
                    </td>
                    <td className="text-end text-danger fw-bold" style={{fontSize:"1.1rem"}}>
                      {p.gia.toLocaleString("vi-VN")} <span className="text-black-50 fs-6">₫</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Card grid for mobile/tablet */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mt-1 d-block d-lg-none">
            {products.map(p => (
              <div className="col" key={p.id}>
                <Card className="h-100 shadow-sm border-0">
                  <div style={{background:"linear-gradient(90deg,#F4F7FD 0%,#E3F2FD 100%)", borderRadius:"1rem 1rem 0 0"}}>
                    <Card.Img
                      variant="top"
                      src={p.hinh || "/image/default-book.jpg"}
                      alt={p.ten_sp}
                      style={{
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "1rem 1rem 0 0"
                      }}
                    />
                  </div>
                  <Card.Body>
                    <Card.Title className="text-primary fw-bold mb-1">{p.ten_sp}</Card.Title>
                    <div className="mb-2">
                      <span className="badge bg-light text-dark border px-2 py-1 me-2">
                        <i className="bi bi-person"></i> {p.tac_gia || <span className="text-muted">—</span>}
                      </span>
                    </div>
                    <Card.Text className="fw-bold text-danger mb-0" style={{fontSize:"1.15rem"}}>
                      {p.gia.toLocaleString("vi-VN")} <span className="text-black-50 fs-6">₫</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <img
            src="/image/empty_box.svg"
            alt="empty"
            style={{ width: 92, marginBottom: 10, opacity: 0.75, filter: "grayscale(.6)" }}
          />
          <div style={{ fontSize: "1.2rem" }} className="mb-2">📭 Danh mục này hiện chưa có sản phẩm nào.</div>
          <p>Hãy thêm sản phẩm để làm phong phú danh mục này!</p>
        </div>
      )}
    </div>
  );
}
