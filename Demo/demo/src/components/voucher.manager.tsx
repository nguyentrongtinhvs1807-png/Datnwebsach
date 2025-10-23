"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container } from "react-bootstrap";

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

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingVoucher),
    });

    setShowModal(false);
    setEditingVoucher(null);
    fetchVouchers();
  };

  // 🗑️ Xoá voucher
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá voucher này?")) {
      await fetch(`http://localhost:5000/api/voucher?id=${id}`, { method: "DELETE" });
      fetchVouchers();
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary text-center">🎟️ Quản lý Voucher</h2>

      <div className="text-end mb-3">
        <Button
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

      <Table bordered hover responsive>
        <thead className="table-light text-center">
          <tr>
            <th>Mã</th>
            <th>Giảm (VNĐ)</th>
            <th>Đơn tối thiểu</th>
            <th>Giảm tối đa</th>
            <th>Thời gian hiệu lực</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id}>
              <td><strong>{v.code}</strong></td>
              <td>{v.discount.toLocaleString()}đ</td>
              <td>{v.min_order.toLocaleString()}đ</td>
              <td>{v.max_discount.toLocaleString()}đ</td>
              <td>
                {new Date(v.start_date).toLocaleDateString("vi-VN")} →{" "}
                {new Date(v.end_date).toLocaleDateString("vi-VN")}
              </td>
              <td>{v.description || "-"}</td>
              <td className="text-center">
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => {
                    setEditingVoucher(v);
                    setShowModal(true);
                  }}
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleDelete(v.id!)}
                >
                  Xoá
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 🧾 Modal Thêm/Sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVoucher?.id ? "✏️ Chỉnh sửa Voucher" : "➕ Thêm Voucher mới"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Mã Voucher</Form.Label>
              <Form.Control
                type="text"
                value={editingVoucher?.code || ""}
                onChange={(e) =>
                  setEditingVoucher({ ...editingVoucher!, code: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá trị giảm (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.discount || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    discount: Number(e.target.value),
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đơn tối thiểu (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.min_order || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    min_order: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giảm tối đa (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.max_discount || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    max_discount: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày bắt đầu</Form.Label>
              <Form.Control
                type="date"
                value={editingVoucher?.start_date?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    start_date: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày kết thúc</Form.Label>
              <Form.Control
                type="date"
                value={editingVoucher?.end_date?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    end_date: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
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
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Huỷ
            </Button>
            <Button variant="primary" type="submit">
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
