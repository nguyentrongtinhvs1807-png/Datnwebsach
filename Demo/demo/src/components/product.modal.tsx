"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { ISach } from "@/components/cautrucdata";

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

  // Tự động điền dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (editSach) {
      setForm(editSach);
    } else {
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
    }
  }, [editSach, showModal]);

  const handleChange = (key: keyof ISach, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Kiểm tra bắt buộc
    if (!form.ten_sach || !form.ten_tac_gia || !form.ten_NXB || form.gia_sach <= 0 || form.ton_kho_sach < 0) {
      toast.error("Vui lòng điền đầy đủ các trường có dấu (*)");
      return;
    }

    // ĐÚNG 100% THEO BACKEND CỦA BẠN
    const url = editSach
      ? `http://localhost:3003/sach/${form.sach_id}`   // PUT: sửa sách
      : `http://localhost:3003/sach`;                  // POST: thêm mới

    const method = editSach ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          loai_sach_id: form.loai_sach_id || 1,
          gg_sach: form.gg_sach || 0,
          ton_kho_sach: form.ton_kho_sach || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi server");
      }

      toast.success(editSach ? "Cập nhật sách thành công!" : "Thêm sách mới thành công!");
      fetchSach();        // Reload lại danh sách
      setShowModal(false); // Đóng modal
    } catch (err: any) {
      console.error("Lỗi khi lưu sách:", err);
      toast.error(err.message || "Không thể kết nối đến server!");
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
          color: "white",
          borderBottom: "none",
        }}
      >
        <Modal.Title className="fw-bold">
          {editSach ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "2rem" }}>
        <Form>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Tên sách <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={form.ten_sach}
                onChange={(e) => handleChange("ten_sach", e.target.value)}
                placeholder="Nhập tên sách"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Tác giả <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={form.ten_tac_gia}
                onChange={(e) => handleChange("ten_tac_gia", e.target.value)}
                placeholder="VD: Nguyễn Nhật Ánh"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Nhà xuất bản <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={form.ten_NXB}
                onChange={(e) => handleChange("ten_NXB", e.target.value)}
                placeholder="VD: Kim Đồng"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Giá bán (đ) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={form.gia_sach}
                onChange={(e) => handleChange("gia_sach", Number(e.target.value) || 0)}
                min="1000"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Giảm giá (đ)
              </Form.Label>
              <Form.Control
                type="number"
                value={form.gg_sach}
                onChange={(e) => handleChange("gg_sach", Number(e.target.value) || 0)}
                min="0"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Tồn kho <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={form.ton_kho_sach}
                onChange={(e) => handleChange("ton_kho_sach", Number(e.target.value) || 0)}
                min="0"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Loại bìa
              </Form.Label>
              <Form.Control
                type="text"
                value={form.loai_bia}
                onChange={(e) => handleChange("loai_bia", e.target.value)}
                placeholder="VD: Bìa mềm, Bìa cứng"
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                Mô tả
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={form.mo_ta}
                onChange={(e) => handleChange("mo_ta", e.target.value)}
                placeholder="Giới thiệu ngắn về nội dung sách..."
                style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "12px" }}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "2px solid #e0e0e0", padding: "1.5rem" }}>
        <Button
          variant="secondary"
          onClick={() => setShowModal(false)}
          className="px-5 py-2 fw-bold"
          style={{ borderRadius: "10px" }}
        >
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="px-5 py-2 fw-bold"
          style={{
            borderRadius: "10px",
            background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
            border: "none",
          }}
        >
          {editSach ? "Lưu thay đổi" : "Thêm sách mới"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;