"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Table, Button } from "react-bootstrap";

// 👉 Khai báo kiểu dữ liệu cho sản phẩm và danh mục
type Product = {
  id: number;
  ten_sp: string;
  tac_gia: string;
  gia: number;
  hinh: string;
};

type Category = {
  id: number;
  ten_danh_muc: string;
};

export default function DanhMucSanPham() {
  // Ép kiểu rõ ràng cho id
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!id) return;

    // 🧭 Lấy danh sách sản phẩm theo danh mục
    fetch(`http://localhost:3003/categories/${id}/products`)
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch((err) => console.error("Lỗi tải sản phẩm:", err));

    // 🧭 Lấy thông tin danh mục
    fetch(`http://localhost:3003/categories`)
      .then((res) => res.json())
      .then((data: Category[]) => {
        const found = data.find((c: Category) => c.id === Number(id));
        setCategory(found || null);
      })
      .catch((err) => console.error("Lỗi tải danh mục:", err));
  }, [id]);

  return (
    <div className="container mt-4">
      <h3>
        Quản lý sản phẩm thuộc danh mục{" "}
        <span className="text-primary">
          {category ? category.ten_danh_muc : "(đang tải...)"}
        </span>
      </h3>

      <Link href="/admin/danhmuc">
        <Button variant="secondary" className="mb-3">
          ← Quay lại
        </Button>
      </Link>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Tác giả</th>
            <th>Giá</th>
            <th>Hình</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.ten_sp}</td>
                <td>{p.tac_gia}</td>
                <td>{p.gia.toLocaleString()}₫</td>
                <td>
                  <img
                    src={p.hinh}
                    alt={p.ten_sp}
                    width="60"
                    style={{ borderRadius: "6px" }}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                {products.length === 0
                  ? "Chưa có sản phẩm trong danh mục này"
                  : "Đang tải..."}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
