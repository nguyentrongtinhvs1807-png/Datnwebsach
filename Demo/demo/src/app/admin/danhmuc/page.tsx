"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Image, Row, Col, InputGroup } from "react-bootstrap";

interface LoaiSach {
  loai_sach_id?: number;
  ten_loai: string;
}

interface Sach {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  loai_bia: string;
  mo_ta: string;
  hinh_sach: string;
}

export default function AdminLoaiSachPage() {
  const [loaisach, setLoaiSach] = useState<LoaiSach[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LoaiSach | null>(null);
  const [form, setForm] = useState<LoaiSach>({ ten_loai: "" });
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedLoai, setSelectedLoai] = useState<LoaiSach | null>(null);
  const [books, setBooks] = useState<Sach[]>([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const API_URL = "http://localhost:3003";

  // 🟢 Lấy danh sách loại sách
  const fetchLoaiSach = async () => {
    try {
      const res = await fetch(`${API_URL}/loaisach`);
      if (!res.ok) throw new Error("Không thể tải danh sách loại sách");
      const data = await res.json();
      setLoaiSach(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải loại sách:", err);
    }
  };

  useEffect(() => {
    fetchLoaiSach();
  }, []);

  // 🟡 Mở modal thêm / sửa
  const handleShow = (item?: LoaiSach) => {
    if (item) {
      setEditing(item);
      setForm(item);
    } else {
      setEditing(null);
      setForm({ ten_loai: "" });
    }
    setShowModal(true);
  };

  // 🧩 Lưu loại sách (Thêm hoặc Sửa)
  const handleSave = async () => {
    if (!form.ten_loai.trim()) {
      alert("⚠️ Vui lòng nhập tên loại sách!");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/loaisach/${editing.loai_sach_id}`
      : `${API_URL}/loaisach`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Không thể lưu loại sách");

      alert(editing ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
      setShowModal(false);
      fetchLoaiSach();
    } catch (err) {
      console.error("❌ Lỗi khi lưu loại sách:", err);
      alert("❌ Có lỗi xảy ra khi lưu loại sách!");
    }
  };

  //  Xóa loại sách
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Bạn có chắc muốn xóa loại sách này không?")) return;

    try {
      const res = await fetch(`${API_URL}/loaisach/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa loại sách");

      alert("🗑️ Xóa thành công!");
      fetchLoaiSach();
    } catch (err) {
      console.error("❌ Lỗi khi xóa loại sách:", err);
      alert("❌ Không thể xóa loại sách!");
    }
  };

  // 📚 Xem danh sách sách thuộc loại
  const handleViewBooks = async (loai: LoaiSach) => {
    setSelectedLoai(loai);
    setShowBooksModal(true);
    try {
      const res = await fetch(`${API_URL}/loaisach/${loai.loai_sach_id}/sach`);
      if (!res.ok) throw new Error("Không thể tải danh sách sách");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải sách:", err);
      setBooks([]);
    }
  };

  // 💰 Hàm định dạng giá
  const formatPrice = (price: number) =>
    price?.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

  // Lọc & sắp xếp loại sách
  const filteredLoaiSach = loaisach
    .filter((ls) =>
      ls.ten_loai.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.ten_loai.localeCompare(b.ten_loai)
        : b.ten_loai.localeCompare(a.ten_loai)
    );

  return (
    <div className="container-fluid px-lg-5 px-2 mt-4">
      <div
        className="rounded shadow-sm px-4 py-4 mb-4"
        style={{
          background: "linear-gradient(90deg, #eaf1fb 0%, #f6f8ff 100%)",
          border: "2px solid #88b6f7",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-3">
          <h2 className="fw-bold mb-0" style={{ color: "#2154C5" }}>
            <i className="bi bi-collection me-2"></i>
            Quản lý Danh Mục Loại Sách
          </h2>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-md-0">
            <InputGroup style={{ minWidth: 250, maxWidth: 300 }}>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên loại sách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "#fff",
                  border: "2px solid #c3e0fc",
                  borderRadius: "8px 0 0 8px",
                  fontWeight: 500,
                  fontSize: "1rem",
                }}
              />
              <Button variant="outline-secondary" style={{ borderWidth: "2px" }}>
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
            <Button
              variant="primary"
              className="fw-semibold px-3 py-2"
              style={{ borderRadius: "8px" }}
              onClick={() => handleShow()}
            >
              <i className="bi bi-plus-circle me-1"></i>Thêm loại sách
            </Button>
          </div>
        </div>

        <div className="table-responsive shadow-sm rounded-3 overflow-hidden my-2 px-0">
          <Table hover borderless className="align-middle mb-0">
            <thead
              style={{
                background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
                color: "white",
              }}
              className="text-center"
            >
              <tr>
                <th style={{ width: "80px", fontWeight: 600 }}>ID</th>
                <th
                  className="pointer"
                  style={{ cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Tên loại sách{" "}
                  <i
                    className={`bi bi-sort-alpha-${sortAsc ? "down" : "up"}-alt ms-1`}
                  ></i>
                </th>
                <th style={{ width: "260px", fontWeight: 600 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoaiSach.length > 0 ? (
                filteredLoaiSach.map((ls, idx) => (
                  <tr
                    key={ls.loai_sach_id}
                    style={{
                      background: idx % 2 === 0 ? "#f4f9fd" : "#fafdff",
                      borderBottom: "1px solid #eaf1fb",
                    }}
                  >
                    <td className="text-center fw-semibold" style={{ color: "#4266e3" }}>
                      {ls.loai_sach_id}
                    </td>
                    <td className="fw-bold" style={{ fontSize: "1.08rem" }}>
                      {ls.ten_loai}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2 fw-semibold"
                        style={{ borderRadius: "6px", minWidth: 90 }}
                        onClick={() => handleViewBooks(ls)}
                      >
                        <i className="bi bi-book-half me-1"></i>
                        Xem sách
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 fw-semibold"
                        style={{ borderRadius: "6px", minWidth: 70, color: "#754C00" }}
                        onClick={() => handleShow(ls)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="fw-semibold"
                        style={{ borderRadius: "6px", minWidth: 70 }}
                        onClick={() => handleDelete(ls.loai_sach_id)}
                      >
                        <i className="bi bi-trash3 me-1"></i>Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4 fs-5">
                    <i className="bi bi-bookmark-x me-2 fs-4"></i>
                    Chưa có loại sách nào
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* 🟢 Modal thêm/sửa loại sách */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{ background: "#f4f7fc", borderBottom: "1px solid #dadce6" }}
        >
          <Modal.Title className="fw-bold" style={{ color: "#21409A" }}>
            {editing ? (
              <>
                <i className="bi bi-pencil-square me-2"></i>Sửa loại sách
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>Thêm loại sách
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: "#2154C5" }}>
                Tên loại sách <span className="text-danger fw-bolder">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên loại sách..."
                value={form.ten_loai}
                onChange={(e) => setForm({ ...form, ten_loai: e.target.value })}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e0e0e0",
                  padding: "10px",
                  fontSize: "1.1rem",
                }}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: "#f4f7fc", borderTop: "1px solid #dadce6" }}>
          <Button
            variant="secondary"
            className="px-4 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={() => setShowModal(false)}
          >
            <i className="bi bi-x-circle me-2"></i>Hủy
          </Button>
          <Button
            variant="primary"
            className="px-4 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={handleSave}
          >
            <i className="bi bi-check-circle me-2"></i>Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 📘 Modal xem sách thuộc loại */}
      <Modal
        show={showBooksModal}
        onHide={() => setShowBooksModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{ background: "#f4f7fc", borderBottom: "1px solid #dadce6" }}
        >
          <Modal.Title className="fw-bold" style={{ color: "#2154C5" }}>
            <i className="bi bi-book-half me-2"></i>
            Danh sách sách thuộc loại{" "}
            <span className="fw-bold" style={{ color: "#2452b5" }}>
              {selectedLoai?.ten_loai}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#fafbfe" }}>
          {books.length > 0 ? (
            <div className="table-responsive">
              <Table hover bordered className="align-middle mb-0">
                <thead className="text-center" style={{ background: "#eaf1fb" }}>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: 80 }}>Ảnh</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>NXB</th>
                    <th style={{ width: 100 }}>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b, idx) => (
                    <tr
                      key={b.sach_id}
                      style={{
                        background: idx % 2 ? "#fafdff" : "#f4f8fd"
                      }}
                    >
                      <td className="text-center fw-semibold">{b.sach_id}</td>
                      <td className="text-center align-middle">
                        <Image
                          src={b.hinh_sach || "/image/default-book.jpg"}
                          alt={b.ten_sach}
                          width={55}
                          height={70}
                          rounded
                          style={{
                            boxShadow: "0 1px 6px rgba(150,170,255,.13), 0 0px 0px #fff",
                            objectFit: 'cover',
                            background: "#fff"
                          }}
                        />
                      </td>
                      <td>
                        <span className="fw-bold" style={{ color: "#2255aa" }}>{b.ten_sach}</span>
                        <div className="text-secondary small" title={b.mo_ta}>
                          {b.mo_ta && b.mo_ta.length > 40
                            ? b.mo_ta.substring(0, 40) + "..."
                            : b.mo_ta
                          }
                        </div>
                      </td>
                      <td>{b.ten_tac_gia}</td>
                      <td>{b.ten_NXB}</td>
                      <td className="fw-semibold text-primary">
                        {formatPrice(b.gia_sach)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted mb-0 py-4 fs-5">
              <i className="bi bi-emoji-frown me-2"></i>
              Không có sách nào trong loại này.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
