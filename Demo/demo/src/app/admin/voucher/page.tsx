"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container } from "react-bootstrap";

interface Voucher {
  giam_gia_id?: number;
  ma_gg: string;
  loai_giam: "percent" | "fixed";
  gia_tri_giam: number;
  giam_toi_da: number;
  don_toi_thieu: number;
  ngay_bd: string;
  ngay_kt: string;
  gioi_han_sd: number;
  trang_thai: number;
}

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Lấy danh sách voucher từ API Node.js
  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:3003/voucher");
      const data = await res.json();
      setVouchers(data);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách voucher:", error);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Lưu hoặc cập nhật voucher
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = editingVoucher?.giam_gia_id ? "PUT" : "POST";
    const url = editingVoucher?.giam_gia_id
      ? `http://localhost:3003/voucher/${editingVoucher.giam_gia_id}`
      : "http://localhost:3003/voucher";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingVoucher),
    });

    setShowModal(false);
    setEditingVoucher(null);
    fetchVouchers();
  };

  // Xoá voucher
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá voucher này?")) {
      await fetch(`http://localhost:3003/voucher/${id}`, { method: "DELETE" });
      fetchVouchers();
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary text-center">
         Quản lý Mã Giảm Giá
      </h2>

      <div className="text-end mb-3">
        <Button
          onClick={() => {
            setEditingVoucher({
              ma_gg: "",
              loai_giam: "percent",
              gia_tri_giam: 0,
              giam_toi_da: 0,
              don_toi_thieu: 0,
              ngay_bd: "",
              ngay_kt: "",
              gioi_han_sd: 0,
              trang_thai: 1,
            });
            setShowModal(true);
          }}
        >
          + Thêm Mã Giảm Giá
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead className="table-light text-center">
          <tr>
            <th>Mã</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Giảm tối đa</th>
            <th>Đơn tối thiểu</th>
            <th>Giới hạn SD</th>
            <th>Ngày hiệu lực</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.giam_gia_id}>
              <td>
                <strong>{v.ma_gg}</strong>
              </td>
              <td>{v.loai_giam === "percent" ? "Phần trăm" : "Cố định"}</td>
              <td>
                {v.loai_giam === "percent"
                  ? `${v.gia_tri_giam}%`
                  : `${v.gia_tri_giam.toLocaleString()}đ`}
              </td>
              <td>{v.giam_toi_da.toLocaleString()}đ</td>
              <td>{v.don_toi_thieu.toLocaleString()}đ</td>
              <td>{v.gioi_han_sd}</td>
              <td>
                {new Date(v.ngay_bd).toLocaleDateString("vi-VN")} →{" "}
                {new Date(v.ngay_kt).toLocaleDateString("vi-VN")}
              </td>
              <td>
                {v.trang_thai === 1 ? (
                  <span className="text-success fw-semibold">Hoạt động</span>
                ) : (
                  <span className="text-danger fw-semibold">Ngừng</span>
                )}
              </td>
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
                  onClick={() => handleDelete(v.giam_gia_id!)}
                >
                  Xoá
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Thêm/Sửa Voucher */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVoucher?.giam_gia_id
              ? "✏️ Chỉnh sửa Voucher"
              : " Thêm Voucher mới"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Mã Giảm Giá</Form.Label>
              <Form.Control
                type="text"
                value={editingVoucher?.ma_gg || ""}
                onChange={(e) =>
                  setEditingVoucher({ ...editingVoucher!, ma_gg: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại giảm</Form.Label>
              <Form.Select
                value={editingVoucher?.loai_giam || "percent"}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    loai_giam: e.target.value as "percent" | "fixed",
                  })
                }
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Cố định (VNĐ)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá trị giảm</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.gia_tri_giam || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    gia_tri_giam: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giảm tối đa</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.giam_toi_da || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    giam_toi_da: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đơn tối thiểu</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.don_toi_thieu || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    don_toi_thieu: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giới hạn sử dụng</Form.Label>
              <Form.Control
                type="number"
                value={editingVoucher?.gioi_han_sd || 0}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    gioi_han_sd: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày bắt đầu</Form.Label>
              <Form.Control
                type="date"
                value={editingVoucher?.ngay_bd?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    ngay_bd: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày kết thúc</Form.Label>
              <Form.Control
                type="date"
                value={editingVoucher?.ngay_kt?.split("T")[0] || ""}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    ngay_kt: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={editingVoucher?.trang_thai || 1}
                onChange={(e) =>
                  setEditingVoucher({
                    ...editingVoucher!,
                    trang_thai: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ngừng</option>
              </Form.Select>
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
