"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Image, InputGroup } from "react-bootstrap";

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

  const fetchLoaiSach = async () => {
    try {
      const res = await fetch(`${API_URL}/loaisach`);
      if (!res.ok) throw new Error("Không thể tải danh sách loại sách");
      const data = await res.json();
      setLoaiSach(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải loại sách:", err);
    }
  };

  useEffect(() => {
    fetchLoaiSach();
  }, []);

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

  const handleSave = async () => {
    if (!form.ten_loai.trim()) {
      alert("Vui lòng nhập tên loại sách!");
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

      alert(editing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      setShowModal(false);
      fetchLoaiSach();
    } catch (err) {
      console.error("Lỗi khi lưu loại sách:", err);
      alert("Có lỗi xảy ra khi lưu loại sách!");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Bạn có chắc muốn xóa loại sách này không?")) return;

    try {
      const res = await fetch(`${API_URL}/loaisach/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa loại sách");

      alert("Xóa thành công!");
      fetchLoaiSach();
    } catch (err) {
      console.error("Lỗi khi xóa loại sách:", err);
      alert("Không thể xóa loại sách!");
    }
  };

  const handleViewBooks = async (loai: LoaiSach) => {
    setSelectedLoai(loai);
    setShowBooksModal(true);
    try {
      const res = await fetch(`${API_URL}/loaisach/${loai.loai_sach_id}/sach`);
      if (!res.ok) throw new Error("Không thể tải danh sách sách");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải sách:", err);
      setBooks([]);
    }
  };

  const formatPrice = (price: number) =>
    price?.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

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
                Search
              </Button>
            </InputGroup>
            <Button
              variant="primary"
              className="fw-semibold px-3 py-2"
              style={{ borderRadius: "8px" }}
              onClick={() => handleShow()}
            >
              Thêm loại sách
            </Button>
          </div>
        </div>

        <div className="table-responsive shadow-sm rounded-3 overflow-hidden my-2">
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
                  <i className={`bi bi-sort-alpha-${sortAsc ? "down" : "up"}-alt ms-1`}></i>
                </th>
                <th style={{ width: "380px", fontWeight: 600 }}>Hành động</th>
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

                    {/* 3 NÚT NGANG HÀNG ĐẸP TUYỆT ĐỐI */}
                    <td className="text-center py-4">
                      <div className="d-flex justify-content-center align-items-center gap-4">

                        {/* XEM SÁCH */}
                        <button
                          onClick={() => handleViewBooks(ls)}
                          className="btn btn-outline-info d-flex align-items-center gap-2 fw-bold shadow-sm border-2"
                          style={{
                            borderRadius: "16px",
                            padding: "10px 20px",
                            minWidth: "130px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#d1ecf1";
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(13,110,199,0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          Xem sách
                        </button>

                        {/* SỬA */}
                        <button
                          onClick={() => handleShow(ls)}
                          className="btn btn-outline-warning d-flex align-items-center gap-2 fw-bold shadow-sm border-2"
                          style={{
                            borderRadius: "16px",
                            padding: "10px 20px",
                            minWidth: "110px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                            color: "#a06b00",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff3cd";
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,193,7,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          Sửa
                        </button>

                        {/* XÓA */}
                        <button
                          onClick={() => handleDelete(ls.loai_sach_id)}
                          className="btn btn-outline-danger d-flex align-items-center gap-2 fw-bold shadow-sm border-2"
                          style={{
                            borderRadius: "16px",
                            padding: "10px 20px",
                            minWidth: "110px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8d7da";
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(220,53,69,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          Xóa
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-5 fs-4">
                    Chưa có loại sách nào
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal thêm/sửa loại sách */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton style={{ background: "#f4f7fc", borderBottom: "1px solid #dadce6" }}>
          <Modal.Title className="fw-bold" style={{ color: "#21409A" }}>
            {editing ? "Sửa loại sách" : "Thêm loại sách"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: "#2154C5" }}>
                Tên loại sách <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên loại sách..."
                value={form.ten_loai}
                onChange={(e) => setForm({ ...form, ten_loai: e.target.value })}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e0e0e0",
                  padding: "12px",
                  fontSize: "1.1rem",
                }}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: "#f4f7fc", borderTop: "1px solid #dadce6" }}>
          <Button variant="secondary" className="px-4 fw-semibold" style={{ borderRadius: "8px" }} onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" className="px-4 fw-semibold" style={{ borderRadius: "8px" }} onClick={handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xem sách thuộc loại */}
      <Modal show={showBooksModal} onHide={() => setShowBooksModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: "#f4f7fc", borderBottom: "1px solid #dadce6" }}>
          <Modal.Title className="fw-bold" style={{ color: "#2154C5" }}>
            Danh sách sách thuộc loại: <span className="text-primary">{selectedLoai?.ten_loai}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#fafbfe" }}>
          {books.length > 0 ? (
            <div className="table-responsive">
              <Table hover bordered className="align-middle">
                <thead className="text-center" style={{ background: "#eaf1fb" }}>
                  <tr>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>NXB</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b, idx) => (
                    <tr key={b.sach_id} style={{ background: idx % 2 ? "#fafdff" : "#f4f8fd" }}>
                      <td className="text-center fw-semibold">{b.sach_id}</td>
                      <td className="text-center">
                        <Image
                          src={b.hinh_sach || "/image/default-book.jpg"}
                          alt={b.ten_sach}
                          width={55}
                          height={70}
                          rounded
                          style={{ objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-primary">{b.ten_sach}</div>
                        <small className="text-muted">{b.mo_ta?.substring(0, 50)}...</small>
                      </td>
                      <td>{b.ten_tac_gia}</td>
                      <td>{b.ten_NXB}</td>
                      <td className="fw-bold text-danger">{formatPrice(b.gia_sach)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted py-5 fs-4">
              Không có sách nào trong loại này
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}