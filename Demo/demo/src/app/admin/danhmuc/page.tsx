"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Image,
  InputGroup,
} from "react-bootstrap";

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

  const [deleteError, setDeleteError] = useState("");

  const API_URL = "http://localhost:3003";

  const fetchLoaiSach = async () => {
    try {
      const res = await fetch(`${API_URL}/loaisach`);
      const data = await res.json();
      setLoaiSach(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLoaiSach();
  }, []);

  const handleShow = (item?: LoaiSach) => {
    if (item) {
      setEditing(item);
      setForm({ ten_loai: item.ten_loai });
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

      if (!res.ok) throw new Error();

      alert(editing ? "Cập nhật thành công!" : "Thêm mới thành công!");
      setShowModal(false);
      fetchLoaiSach();
    } catch {
      alert("Lỗi khi lưu loại sách");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const loai = loaisach.find((l) => l.loai_sach_id === id);
    if (!loai) return;

    if (!confirm(`Bạn có chắc muốn xóa "${loai.ten_loai}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/loaisach/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDeleteError(err.error || "Không thể xóa do có sách đang sử dụng");
        setSelectedLoai(loai);
        return;
      }

      fetchLoaiSach();
    } catch {
      setDeleteError("Có lỗi xảy ra khi xóa");
      setSelectedLoai(loai);
    }
  };

  const handleViewBooks = async (loai: LoaiSach) => {
    setSelectedLoai(loai);
    setShowBooksModal(true);
    try {
      const res = await fetch(`${API_URL}/loaisach/${loai.loai_sach_id}/sach`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    }
  };

  const filteredLoaiSach = loaisach
    .filter((ls) =>
      ls.ten_loai.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.ten_loai.localeCompare(b.ten_loai)
        : b.ten_loai.localeCompare(a.ten_loai)
    );

  const formatPrice = (p: number) =>
    p.toLocaleString("vi-VN") + " ₫";

  return (
    <>
      {/* MODAL LỖI XÓA */}
      <Modal show={!!deleteError} onHide={() => setDeleteError("")} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Không thể xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h5>{selectedLoai?.ten_loai}</h5>
          <p className="text-muted">{deleteError}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setDeleteError("")}>Đã hiểu</Button>
        </Modal.Footer>
      </Modal>

      <div className="container-fluid px-4 mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h2 className="fw-bold text-primary">Quản lý loại sách</h2>
          <Button onClick={() => handleShow()}>Thêm loại sách</Button>
        </div>

        <InputGroup className="mb-3" style={{ maxWidth: 300 }}>
          <Form.Control
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Table hover bordered>
          <thead className="text-center">
            <tr>
              <th>ID</th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => setSortAsc(!sortAsc)}
              >
                Tên loại
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoaiSach.map((ls) => (
              <tr key={ls.loai_sach_id}>
                <td className="text-center">{ls.loai_sach_id}</td>
                <td>{ls.ten_loai}</td>
                <td className="text-center">
                  <Button size="sm" onClick={() => handleViewBooks(ls)}>
                    Xem sách
                  </Button>{" "}
                  <Button size="sm" variant="warning" onClick={() => handleShow(ls)}>
                    Sửa
                  </Button>{" "}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(ls.loai_sach_id)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* MODAL THÊM / SỬA */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? "Sửa loại sách" : "Thêm loại sách"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              placeholder="Tên loại sách"
              value={form.ten_loai}
              onChange={(e) => setForm({ ten_loai: e.target.value })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL XEM SÁCH */}
        <Modal show={showBooksModal} onHide={() => setShowBooksModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              Sách thuộc loại: {selectedLoai?.ten_loai}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {books.length > 0 ? (
              <Table bordered>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.sach_id}>
                      <td>{b.sach_id}</td>
                      <td>
                        <Image src={b.hinh_sach} width={50} />
                      </td>
                      <td>{b.ten_sach}</td>
                      <td className="text-danger fw-bold">
                        {formatPrice(b.gia_sach)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-center text-muted">Không có sách</p>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
