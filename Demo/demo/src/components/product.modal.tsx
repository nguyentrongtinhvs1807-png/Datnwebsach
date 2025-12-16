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

const ProductModal = ({
  showModal,
  setShowModal,
  fetchSach,
  editSach,
}: ModalProps) => {
  // ❌ KHÔNG CÓ hinh_anh
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

  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState<string>("");

  // Load dữ liệu khi edit
  useEffect(() => {
    if (!showModal) return;

    if (editSach) {
      setForm(editSach);
      setSelectedFile(null);

      // LẤY ẢNH TỪ BẢNG hinh
      fetch(`http://localhost:3003/sach/${editSach.sach_id}/hinh`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.URL) {
            setOldImageUrl(data.URL);
            setImagePreview(`http://localhost:3003${data.URL}`);
          } else {
            setOldImageUrl("");
            setImagePreview("");
          }
        });
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
      setSelectedFile(null);
      setOldImageUrl("");
      setImagePreview("");
    }
  }, [editSach, showModal]);

  const handleChange = (key: keyof ISach, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (
      !form.ten_sach ||
      !form.ten_tac_gia ||
      !form.ten_NXB ||
      form.gia_sach <= 0
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (!selectedFile && !oldImageUrl) {
      toast.error("Vui lòng chọn ảnh bìa");
      return;
    }

    try {
      let sachId = form.sach_id;

      // 1️⃣ THÊM / SỬA SÁCH
      const res = await fetch(
        editSach
          ? `http://localhost:3003/sach/${sachId}`
          : "http://localhost:3003/sach",
        {
          method: editSach ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (!editSach) sachId = data.insertId;

      // 2️⃣ UPLOAD ẢNH (NẾU CÓ)
      let imageUrl = oldImageUrl;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadRes = await fetch(
          "http://localhost:3003/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      // 3️⃣ UPDATE / INSERT BẢNG hinh
      await fetch(`http://localhost:3003/hinh/${sachId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ URL: imageUrl }),
      });

      toast.success(
        editSach ? "Cập nhật sách thành công" : "Thêm sách thành công"
      );
      fetchSach();
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi server");
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editSach ? "Sửa sách" : "Thêm sách mới"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Ảnh bìa *</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img
                src={imagePreview}
                className="img-fluid mt-3 rounded"
                style={{ maxHeight: 300 }}
              />
            )}
          </Form.Group>

          <Row className="g-3">
            <Col md={12}>
              <Form.Label>Tên sách *</Form.Label>
              <Form.Control
                value={form.ten_sach}
                onChange={(e) => handleChange("ten_sach", e.target.value)}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Tác giả *</Form.Label>
              <Form.Control
                value={form.ten_tac_gia}
                onChange={(e) => handleChange("ten_tac_gia", e.target.value)}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Nhà XB *</Form.Label>
              <Form.Control
                value={form.ten_NXB}
                onChange={(e) => handleChange("ten_NXB", e.target.value)}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Giá *</Form.Label>
              <Form.Control
                type="number"
                value={form.gia_sach}
                onChange={(e) =>
                  handleChange("gia_sach", Number(e.target.value))
                }
              />
            </Col>

            <Col md={4}>
              <Form.Label>Giảm giá</Form.Label>
              <Form.Control
                type="number"
                value={form.gg_sach}
                onChange={(e) =>
                  handleChange("gg_sach", Number(e.target.value))
                }
              />
            </Col>

            <Col md={4}>
              <Form.Label>Tồn kho *</Form.Label>
              <Form.Control
                type="number"
                value={form.ton_kho_sach}
                onChange={(e) =>
                  handleChange("ton_kho_sach", Number(e.target.value))
                }
              />
            </Col>

            <Col md={12}>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={form.mo_ta}
                onChange={(e) => handleChange("mo_ta", e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editSach ? "Lưu" : "Thêm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
