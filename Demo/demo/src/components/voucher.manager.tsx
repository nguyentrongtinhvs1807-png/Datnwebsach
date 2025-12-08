"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const todayISOString = new Date().toISOString().split("T")[0];

const DateDisplay = ({ date }: { date: string | null }) => {
  if (!date) return <span className="text-muted">-</span>;
  const d = new Date(date);
  return <>{isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN")}</>;
};

// Format an toàn, tự đoán loại từ dữ liệu
const formatDiscount = (v: any) => {
  const discount = Number(v.gia_tri_giam || v.discount || 0);
  const type = v.loai_giam || v.type || "fixed";
  
  // Nếu discount nhỏ (≤100) và có max_discount → có thể là percent
  const isPercent = (type === "percent" || (discount <= 100 && v.giam_toi_da > 0));
  
  return isPercent ? `${discount}%` : `${discount.toLocaleString("vi-VN")}đ`;
};

const formatMaxDiscount = (v: any) => {
  const max = Number(v.giam_toi_da || v.max_discount || 0);
  if (max > 0) {
    return `${max.toLocaleString("vi-VN")}đ`;
  }
  return "Không giới hạn";
};

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);

  const fetchVouchers = async () => {
    try {
      const res = await fetch("http://localhost:3003/api/voucher");
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");
      const data = await res.json();
      
      // DEBUG: In ra để xem cấu trúc thật
      console.log("=== DEBUG VOUCHER DATA ===");
      console.log("Raw data:", data);
      console.log("First item:", data[0] || "No data");
      console.log("=== END DEBUG ===");
      
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách voucher!");
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const getMaxAllowedDiscount = (): number => {
    if (!editingVoucher || (editingVoucher.loai_giam || editingVoucher.type) !== "percent") return 0;
    const minOrder = Number(editingVoucher.don_toi_thieu || editingVoucher.min_order || 0);
    return Math.floor(minOrder * 0.5);
  };

  const openAddModal = () => {
    setEditingVoucher({
      code: "",
      type: "percent",
      discount: 10,
      min_order: 0,
      max_discount: 0,
      start_date: todayISOString,
      end_date: null,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return toast.error("Lỗi hệ thống!");

    if (!editingVoucher.code?.trim()) return toast.error("Vui lòng nhập mã voucher!");
    const discount = Number(editingVoucher.discount || editingVoucher.gia_tri_giam || 0);
    if (discount <= 0) return toast.error("Giá trị giảm phải lớn hơn 0!");
    const type = editingVoucher.type || editingVoucher.loai_giam || "fixed";
    if (type === "percent" && discount > 100) return toast.error("Phần trăm giảm không được quá 100%!");

    const payload = {
      id: editingVoucher.id,
      code: editingVoucher.code?.trim().toUpperCase(),
      type: type,
      discount: discount,
      min_order: Number(editingVoucher.min_order || editingVoucher.don_toi_thieu || 0),
      max_discount: type === "percent" ? Number(editingVoucher.max_discount || editingVoucher.giam_toi_da || 0) : 0,
      start_date: editingVoucher.start_date || editingVoucher.ngay_bd,
      end_date: editingVoucher.end_date || editingVoucher.ngay_kt || null,
    };

    try {
      const res = await fetch("http://localhost:3003/api/voucher", {
        method: editingVoucher.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Lưu thất bại");
      toast.success(editingVoucher.id ? "Cập nhật thành công!" : "Thêm voucher thành công!");
      setShowModal(false);
      setEditingVoucher(null);
      fetchVouchers();
    } catch {
      toast.error("Lỗi khi lưu voucher!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
    try {
      const res = await fetch(`http://localhost:3003/api/voucher/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      toast.success("Đã xóa voucher!");
      fetchVouchers();
    } catch {
      toast.error("Lỗi khi xóa!");
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: "#21409A" }}>
          Quản lý Voucher
        </h2>
        <Button
          onClick={openAddModal}
          style={{
            background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)",
            border: "none",
            borderRadius: "12px",
            padding: "10px 30px",
            fontWeight: 600,
          }}
        >
          + Thêm Voucher
        </Button>
      </div>

      <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
        <Table hover className="mb-0">
          <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
            <tr>
              <th className="text-center">Mã</th>
              <th className="text-center">Giảm</th>
              <th className="text-center">Đơn tối thiểu</th>
              <th className="text-center">Giảm tối đa</th>
              <th className="text-center">Hiệu lực</th>
              <th className="text-center">Loại</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted fs-5">
                  Chưa có voucher nào
                </td>
              </tr>
            ) : (
              vouchers.map((v, index) => (
                <tr key={v.id || index}>
                  <td className="text-center fw-bold">
                    <span className="px-3 py-1 bg-primary text-white rounded-pill">
                      {v.code || v.ma_gg || `VOUCHER-${index + 1}`}
                    </span>
                  </td>
                  <td className="text-center fw-bold text-success">
                    {formatDiscount(v)}
                  </td>
                  <td className="text-center">
                    {(Number(v.min_order || v.don_toi_thieu || 0) || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="text-center fw-bold text-danger">
                    {formatMaxDiscount(v)}
                  </td>
                  <td className="text-center">
                    <DateDisplay date={v.start_date || v.ngay_bd} /> → <DateDisplay date={v.end_date || v.ngay_kt} />
                  </td>
                  <td className="text-center">
                    <span className={`badge ${
                      (v.type || v.loai_giam) === "percent" ? "bg-info" : "bg-warning"
                    }`}>
                      {(v.type || v.loai_giam) === "percent" ? "Phần trăm" : "Cố định"}
                    </span>
                  </td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="me-2"
                      onClick={() => {
                        setEditingVoucher({
                          ...v,
                          start_date: (v.start_date || v.ngay_bd)?.split("T")[0],
                          end_date: (v.end_date || v.ngay_kt)?.split("T")[0] || null,
                        });
                        setShowModal(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => (v.id || index) && handleDelete(v.id || index)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal - giữ nguyên cấu trúc cũ để an toàn */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}
        >
          <Modal.Title className="fw-bold">
            {editingVoucher?.id ? "Chỉnh sửa Voucher" : "Thêm Voucher Mới"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Mã voucher *</Form.Label>
                <Form.Control
                  type="text"
                  value={editingVoucher?.code || ""}
                  onChange={(e) =>
                    setEditingVoucher(editingVoucher ? { ...editingVoucher, code: e.target.value.toUpperCase() } : null)
                  }
                  placeholder="VD: SALE2025"
                  required
                />
              </Col>

              <Col md={4}>
                <Form.Label>Loại giảm giá *</Form.Label>
                <Form.Select
                  value={editingVoucher?.type || "percent"}
                  onChange={(e) =>
                    setEditingVoucher(editingVoucher ? { ...editingVoucher, type: e.target.value as "fixed" | "percent" } : null)
                  }
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label>Giá trị giảm *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={editingVoucher?.type === "percent" ? 100 : undefined}
                  value={editingVoucher?.discount || ""}
                  onChange={(e) =>
                    setEditingVoucher(editingVoucher ? { ...editingVoucher, discount: Number(e.target.value) || 0 } : null)
                  }
                  required
                />
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              <Col md={6}>
                <Form.Label>Đơn tối thiểu (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={editingVoucher?.min_order || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditingVoucher(
                      editingVoucher
                        ? {
                            ...editingVoucher,
                            min_order: val,
                            max_discount:
                              editingVoucher.type === "percent"
                                ? Math.min(editingVoucher.max_discount || 0, Math.floor(val * 0.5))
                                : editingVoucher.max_discount,
                          }
                        : null
                    );
                  }}
                />
              </Col>

              {editingVoucher?.type === "percent" && (
                <Col md={6}>
                  <Form.Label>
                    Giảm tối đa (VNĐ) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max={getMaxAllowedDiscount()}
                    value={editingVoucher?.max_discount || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const max = getMaxAllowedDiscount();
                      if (val > max) {
                        toast.error(`Chỉ được tối đa ${max.toLocaleString()}đ!`);
                        return;
                      }
                      setEditingVoucher(editingVoucher ? { ...editingVoucher, max_discount: val } : null);
                    }}
                    placeholder={`Tối đa: ${getMaxAllowedDiscount().toLocaleString()}đ`}
                    className="fw-bold border-danger"
                    required
                  />
                  <div className="text-danger fw-bold mt-2">
                    CHỈ ĐƯỢC NHẬP TỐI ĐA {getMaxAllowedDiscount().toLocaleString()}đ (50% đơn)
                  </div>
                </Col>
              )}
            </Row>

            <Row className="g-3 mt-3">
              <Col md={6}>
                <Form.Label>Ngày bắt đầu *</Form.Label>
                <Form.Control
                  type="date"
                  value={editingVoucher?.start_date || ""}
                  onChange={(e) =>
                    setEditingVoucher(editingVoucher ? { ...editingVoucher, start_date: e.target.value } : null)
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Ngày kết thúc</Form.Label>
                <Form.Control
                  type="date"
                  value={editingVoucher?.end_date || ""}
                  min={editingVoucher?.start_date}
                  onChange={(e) =>
                    setEditingVoucher(editingVoucher ? { ...editingVoucher, end_date: e.target.value || null } : null)
                  }
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", border: "none" }}
            >
              {editingVoucher?.id ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}