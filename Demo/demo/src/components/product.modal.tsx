"use client";
import { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { ISach, ILoaiSach } from "@/components/cautrucdata";


interface ModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  fetchSach: () => void;
  editSach: ISach | null;
}

const ProductModal = ({ showModal, setShowModal, fetchSach, editSach }: ModalProps) => {
  const [form, setForm] = useState<ISach>({
    sach_id: 0,
    loai_sach_id: 1,
    ten_tac_gia: "",
    ten_NXB: "",
    ten_sach: "",
    gia_sach: 0,
    ton_kho_sach: 0,
    mo_ta: "",
    gg_sach: 0,
    loai_bia: "",
  });

  useEffect(() => {
    if (editSach) setForm(editSach);
    else
      setForm({
        sach_id: 0,
        loai_sach_id: 1,
        ten_tac_gia: "",
        ten_NXB: "",
        ten_sach: "",
        gia_sach: 0,
        ton_kho_sach: 0,
        mo_ta: "",
        gg_sach: 0,
        loai_bia: "",
      });
  }, [editSach]);

  const handleChange = (key: keyof ISach, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const url = editSach
      ? `http://localhost:3003/sach/${form.sach_id}`
      : "http://localhost:3003/sach";
    const method = editSach ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(editSach ? "Cập nhật thành công!" : "Thêm sách thành công!");
      fetchSach();
      setShowModal(false);
    } catch {
      toast.error("❌ Lỗi khi lưu dữ liệu!");
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editSach ? "✏️ Chỉnh sửa sách" : "➕ Thêm sách mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Tên sách</Form.Label>
            <Form.Control
              type="text"
              value={form.ten_sach}
              onChange={(e) => handleChange("ten_sach", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tác giả</Form.Label>
            <Form.Control
              type="text"
              value={form.ten_tac_gia}
              onChange={(e) => handleChange("ten_tac_gia", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nhà xuất bản</Form.Label>
            <Form.Control
              type="text"
              value={form.ten_NXB}
              onChange={(e) => handleChange("ten_NXB", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá</Form.Label>
            <Form.Control
              type="number"
              value={form.gia_sach}
              onChange={(e) => handleChange("gia_sach", Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giảm giá</Form.Label>
            <Form.Control
              type="number"
              value={form.gg_sach}
              onChange={(e) => handleChange("gg_sach", Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tồn kho</Form.Label>
            <Form.Control
              type="number"
              value={form.ton_kho_sach}
              onChange={(e) => handleChange("ton_kho_sach", Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Loại bìa</Form.Label>
            <Form.Control
              type="text"
              value={form.loai_bia}
              onChange={(e) => handleChange("loai_bia", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.mo_ta}
              onChange={(e) => handleChange("mo_ta", e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editSach ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
