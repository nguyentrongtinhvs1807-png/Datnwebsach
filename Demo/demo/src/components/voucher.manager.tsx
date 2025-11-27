"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

interface Voucher {
  id?: number;
  code: string;
  type: 'fixed' | 'percent'; 
  discount: number;
  min_order: number;
  max_discount: number;
  start_date: string; 
  end_date: string;  
  description?: string; 
}

// ==============================================================================
// 🛠️ HÀM XỬ LÝ DỮ LIỆU (GIỮ NGUYÊN)
// ==============================================================================
const cleanNumericString = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : value;
    }
    let numericString = String(value).trim();
    if (numericString === '') return 0;
    numericString = numericString.replace(/[.,]/g, ''); 
    numericString = numericString.replace(/[^0-9\-]/g, '');
    numericString = numericString.replace(/00$/, ''); 
    const num = Number(numericString);
    return isNaN(num) ? 0 : num;
};

const toMysqlDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  try {
    const dateInput = dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00'; 
    const d = new Date(dateInput);

    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return null;
  }
};

const DateDisplay = ({ date }: { date: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (date && date.length >= 10) { 
        const d = new Date(date.split('T')[0] + 'T00:00:00');
        
        if (isNaN(d.getTime())) {
             setFormattedDate("-");
        } else {
             setFormattedDate(d.toLocaleDateString("vi-VN"));
        }
      } else {
         setFormattedDate("-");
      }
    } catch (e) {
      setFormattedDate("-");
    }
  }, [date]);

  return formattedDate || "-";
};

const formatDiscount = (v: Voucher) => {
    const value = v.discount || 0;
    if (v.type === 'percent') {
        return `${value.toLocaleString('vi-VN')}%`;
    }
    return `${value.toLocaleString('vi-VN')}đ`;
};

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // 📦 Lấy danh sách voucher
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

  // 💾 Lưu hoặc cập nhật voucher (Giữ nguyên)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVoucher) return;
    // ... (logic handleSave giữ nguyên) ...
    const method = editingVoucher.id ? "PUT" : "POST";
    const url = "http://localhost:3003/api/voucher"; 

    const { code, type, discount, min_order, max_discount, start_date, end_date, id, description } = editingVoucher;

    const voucherDataToSend: any = {
        id, code, type, description,
        discount: Number(discount) || 0,
        min_order: Number(min_order) || 0,
        max_discount: Number(max_discount) || 0,
        start_date: toMysqlDate(start_date),
        end_date: toMysqlDate(end_date),
    };

    if (!editingVoucher.id) delete voucherDataToSend.id;
    if (!description) delete voucherDataToSend.description;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherDataToSend),
      });

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Lưu voucher thất bại với mã ${res.status}`);
      }

      toast.success(
        editingVoucher.id
          ? "Cập nhật voucher thành công!"
          : "Thêm voucher thành công!"
      );

      setShowModal(false);
      setEditingVoucher(null);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu voucher!");
      console.error(err);
    }
  };

  // 🗑️ Xoá voucher (Giữ nguyên)
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá voucher này?")) {
      try {
        await fetch(`http://localhost:3003/api/voucher/${id}`, { method: "DELETE" });
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
          🎟️ Quản lý Voucher
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
              type: "percent", 
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
        <Table hover className="mb-0" style={{ minWidth: "900px" }}>
          <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
            <tr>
              <th className="fw-semibold text-center">Mã</th>
              <th className="fw-semibold text-center">Giảm</th> 
              <th className="fw-semibold text-center">Đơn tối thiểu</th>
              <th className="fw-semibold text-center">Giảm tối đa</th>
              <th className="fw-semibold text-center">Hiệu lực</th>
              <th className="fw-semibold text-center">Loại / Mô tả</th> 
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
                <tr key={v.id || v.code}> 
                  <td className="fw-bold text-primary text-center" style={{ fontSize: "1.1em", letterSpacing: ".4px" }}>
                    <span className="px-3 py-1 rounded-pill" style={{ background: "#f1f6ff", fontSize: "1em" }}>{v.code}</span>
                  </td>
                  
                  <td className="fw-bold text-success text-center">
                    {formatDiscount(v)}
                  </td>
                  
                  <td className="text-center">{(v.min_order || 0).toLocaleString('vi-VN')}đ</td>
                  <td className="text-center">{(v.max_discount || 0).toLocaleString('vi-VN')}đ</td>
                  
                  <td className="text-center">
                    <DateDisplay date={v.start_date} /> →{' '}
                    <DateDisplay date={v.end_date} />
                  </td>
                  
                  <td className="text-center text-muted small" style={{ maxWidth: "220px" }}>
                    <span className="fw-bold">{(v.type || 'N/A').toUpperCase()}</span>
                    {v.description && v.description !== v.type && <div className="text-wrap">{v.description}</div>}
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

      {/* MODAL */}
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
              <Col md={4}>
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
              
              <Col md={4}>
                <Form.Label className="fw-semibold mb-2" style={{ color: "#21409A" }}>
                  Loại Giảm Giá <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={editingVoucher?.type || 'percent'}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher!, type: e.target.value as 'fixed' | 'percent' })
                  }
                  style={{ borderRadius: "10px", border: "2px solid #e0e0e0" }}
                  required
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Cố định (VNĐ)</option>
                </Form.Select>
              </Col>

              <Col md={4}>
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
                  placeholder="Giá trị giảm"
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