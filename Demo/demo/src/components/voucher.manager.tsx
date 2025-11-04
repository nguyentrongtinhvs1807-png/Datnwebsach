"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

interface Voucher {
  id?: number;
  code: string;
  discount: number;
  min_order: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  description?: string;
}

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // 📦 Lấy danh sách voucher từ Node.js API
  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:3003/api/voucher");
      const data = await res.json();
      setVouchers(data);
    } catch (err) {
      toast.error("Lỗi khi tải voucher!");
      console.error("❌ Lỗi khi tải voucher:", err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // 💾 Lưu hoặc cập nhật voucher
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = editingVoucher?.id ? "PUT" : "POST";
    const url = editingVoucher?.id
      ? `http://localhost:5000/api/voucher?id=${editingVoucher.id}`
      : "http://localhost:5000/api/voucher";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVoucher),
      });
      toast.success(editingVoucher?.id ? "Cập nhật voucher thành công!" : "Thêm voucher thành công!");
      setShowModal(false);
      setEditingVoucher(null);
      fetchVouchers();
    } catch (err) {
      toast.error("Lỗi khi lưu voucher!");
    }
  };

  // 🗑️ Xoá voucher
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá voucher này?")) {
      try {
        await fetch(`http://localhost:5000/api/voucher?id=${id}`, { method: "DELETE" });
        toast.success("Đã xoá voucher!");
        fetchVouchers();
      } catch (err) {
        toast.error("Lỗi khi xoá voucher!");
      }
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: "#21409A", letterSpacing: ".5px" }}>
          🎟️ Danh mục Voucher
        </h2>
        <Button
          style={{
            background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            padding: "10px 28px",
            fontSize: "1.1em",
          }}
          onClick={() => {
            setEditingVoucher({
              code: "",
              discount: 0,
              min_order: 0,
              max_discount: 0,
              start_date: "",
              end_date: "",
              description: "",
            });
            setShowModal(true);
          }}
        >
          + Thêm Voucher
        </Button>
      </div>

      <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
        {/* Removed the invalid align="middle" prop from Table */}
        <Table hover className="mb-0" style={{ minWidth: "900px" }}>
          <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
            <tr>
              <th className="fw-semibold text-center">Mã</th>
              <th className="fw-semibold text-center">Giảm (VNĐ)</th>
              <th className="fw-semibold text-center">Đơn tối thiểu</th>
              <th className="fw-semibold text-center">Giảm tối đa</th>
              <th className="fw-semibold text-center">Hiệu lực</th>
              <th className="fw-semibold text-center">Mô tả</th>
              <th className="fw-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-5 fs-5">
                  Chưa có voucher nào.
                </td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id}>
                  <td className="fw-bold text-primary text-center" style={{ fontSize: "1.1em", letterSpacing: ".4px" }}>
                    <span className="px-3 py-1 rounded-pill" style={{ background: "#f1f6ff", fontSize: "1em" }}>{v.code}</span>
                  </td>
                  <td className="fw-bold text-success text-center">{v.discount.toLocaleString("vi-VN")}đ</td>
                  <td className="text-center">{v.min_order.toLocaleString("vi-VN")}đ</td>
                  <td className="text-center">{v.max_discount.toLocaleString("vi-VN")}đ</td>
                  <td className="text-center">
                    <span title="Ngày bắt đầu">{new Date(v.start_date).toLocaleDateString("vi-VN")}</span>
                    <span className="mx-1" style={{ fontWeight: "bold" }}>→</span>
                    <span title="Ngày kết thúc">{new Date(v.end_date).toLocaleDateString("vi-VN")}</span>
                  </td>
                  <td style={{ maxWidth: "220px" }}>
                    <span className="text-muted small" title={v.description}>
                      {v.description && v.description.length > 40
                        ? `${v.description.substring(0, 40)}...`
                        : v.description || "-"}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        size="sm"
                        variant="warning"
                        style={{ borderRadius: "8px", minWidth: "80px", fontWeight: 600 }}
                        onClick={() => {
                          setEditingVoucher(v);
                          setShowModal(true);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        style={{ borderRadius: "8px", minWidth: "80px", fontWeight: 600 }}
                        onClick={() => handleDelete(v.id!)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        style={{ backdropFilter: "blur(4px)" }}
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
            color: "white",
            borderBottom: "none"
          }}
        >
          <Modal.Title className="fw-bold">
            {editingVoucher?.id ? "✏️ Chỉnh sửa Voucher" : "➕ Thêm Voucher mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body style={{ padding: "2rem" }}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Mã voucher <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editingVoucher?.code || ""}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher!, code: e.target.value })
                  }
                  placeholder="Nhập mã voucher"
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Giá trị giảm <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={editingVoucher?.discount || 0}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      discount: Number(e.target.value)
                    })
                  }
                  placeholder="Số tiền giảm (VNĐ)"
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                  required
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Đơn tối thiểu
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={editingVoucher?.min_order || 0}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      min_order: Number(e.target.value),
                    })
                  }
                  placeholder="Đơn tối thiểu (VNĐ)"
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Giảm tối đa
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={editingVoucher?.max_discount || 0}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      max_discount: Number(e.target.value),
                    })
                  }
                  placeholder="Giảm tối đa (VNĐ)"
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Ngày bắt đầu
                </Form.Label>
                <Form.Control
                  type="date"
                  value={editingVoucher?.start_date?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      start_date: e.target.value,
                    })
                  }
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Ngày kết thúc
                </Form.Label>
                <Form.Control
                  type="date"
                  value={editingVoucher?.end_date?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      end_date: e.target.value,
                    })
                  }
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Mô tả
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editingVoucher?.description || ""}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher!,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả ngắn về voucher..."
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "10px" }}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "2px solid #e0e0e0", padding: "1.5rem" }}>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 fw-semibold"
              style={{ borderRadius: "10px" }}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="px-4 py-2 fw-semibold"
              style={{
                borderRadius: "10px",
                background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
                border: "none",
              }}
            >
              {editingVoucher?.id ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
