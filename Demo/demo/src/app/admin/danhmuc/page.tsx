"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Image } from "react-bootstrap";
import Link from "next/link";

interface Category {
  id?: number;
  ten_dm: string;
  mo_ta: string;
}

interface Product {
  id: number;
  ten_sp: string;
  tac_gia: string;
  gia: number;
  hinh: string;
}

export default function AdminDanhMucPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<Category>({ ten_dm: "", mo_ta: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

  // ✅ Lấy danh sách danh mục
  const fetchCategories = () => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi khi lấy danh mục:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Mở modal thêm / sửa
  const handleShow = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm(category);
    } else {
      setEditingCategory(null);
      setForm({ ten_dm: "", mo_ta: "" });
    }
    setShowModal(true);
  };

  // ✅ Lưu (Thêm hoặc Cập nhật)
  const handleSave = () => {
    const method = editingCategory ? "PUT" : "POST";
    const url = editingCategory
      ? `${API_URL}/categories/${editingCategory.id}`
      : `${API_URL}/categories`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        setShowModal(false);
        fetchCategories();
      })
      .catch((err) => console.error("Lỗi khi lưu danh mục:", err));
  };

  // ✅ Xóa danh mục
  const handleDelete = (id?: number) => {
    if (!id) return;
    if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
      fetch(`${API_URL}/categories/${id}`, { method: "DELETE" })
        .then(() => fetchCategories())
        .catch((err) => console.error("Lỗi khi xóa danh mục:", err));
    }
  };

  // ✅ Xem sản phẩm thuộc danh mục
  const handleViewProducts = (category: Category) => {
    setSelectedCategory(category);
    setShowProductModal(true);

    fetch(`${API_URL}/categories/${category.id}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi khi lấy sản phẩm:", err));
  };

  // ✅ Xóa sản phẩm trong danh mục
  const handleDeleteProduct = (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

    fetch(`${API_URL}/products/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        alert("🗑️ Xóa sản phẩm thành công!");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((err) => console.error("Lỗi khi xóa sản phẩm:", err));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📚 Quản lý Danh Mục</h2>

      <div className="text-end mb-3">
        <Button variant="success" onClick={() => handleShow()}>
          ➕ Thêm danh mục
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr className="text-center">
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.ten_dm}</td>
                <td>{cat.mo_ta}</td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewProducts(cat)}
                  >
                    🛒 Xem sản phẩm
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShow(cat)}
                  >
                    ✏️ Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(cat.id)}
                  >
                    🗑️ Xóa
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Chưa có danh mục nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* 🧩 Modal thêm/sửa danh mục */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "✏️ Sửa Danh Mục" : "➕ Thêm Danh Mục"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control
                type="text"
                value={form.ten_dm}
                onChange={(e) => setForm({ ...form, ten_dm: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.mo_ta}
                onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🧩 Modal xem sản phẩm */}
      <Modal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            🛍️ Sản phẩm thuộc danh mục:{" "}
            <strong>{selectedCategory?.ten_dm}</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {products.length > 0 ? (
            <Table bordered hover responsive>
              <thead>
                <tr className="text-center">
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Tác giả</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <Image
                        src={p.hinh}
                        alt={p.ten_sp}
                        width={60}
                        height={60}
                        rounded
                      />
                    </td>
                    <td>{p.ten_sp}</td>
                    <td>{p.tac_gia}</td>
                    <td>{p.gia.toLocaleString()}₫</td>
                    <td className="text-center">
                      <Link
                        href={`/admin/products/edit/${p.id}`}
                        className="btn btn-warning btn-sm me-2 text-white"
                      >
                        ✏️ Sửa
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        🗑️ Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              Không có sản phẩm nào trong danh mục này.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
