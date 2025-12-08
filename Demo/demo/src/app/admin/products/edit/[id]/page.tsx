"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner, Form, Button, Card } from "react-bootstrap";

interface Sach {
  sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number;
  loai_bia: string;
}

export default function EditSachPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [sach, setSach] = useState<Sach | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu theo ID
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3003/sachs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sách");
        return res.json();
      })
      .then((data) => setSach(data))
      .catch((err) => {
        console.error("❌ Lỗi fetch:", err);
        alert("Không thể tải thông tin sách!");
        router.push("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  //  Xử lý thay đổi input (ép kiểu số + fix dấu phẩy)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!sach) return;

    const { name, value, type } = e.target;

    let newValue: any = value;

    if (type === "number") {
      newValue = Number(value.replace(",", "."));
    }

    setSach({ ...sach, [name]: newValue });
  };

  //  Gửi PUT cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sach) return;

    setSaving(true);

    // Gửi đúng field backend yêu cầu
    const payload = {
      ten_sach: sach.ten_sach,
      ten_tac_gia: sach.ten_tac_gia,
      ten_NXB: sach.ten_NXB,
      gia_sach: sach.gia_sach,
      ton_kho_sach: sach.ton_kho_sach,
      gg_sach: sach.gg_sach,
      loai_bia: sach.loai_bia,
      mo_ta: sach.mo_ta,
    };

    try {
      const res = await fetch(`http://localhost:3003/sachs/${sach.sach_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại!");

      alert(" Cập nhật sách thành công!");
      router.push("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      alert("Đã xảy ra lỗi khi cập nhật sách!");
    } finally {
      setSaving(false);
    }
  };

  //  Loading UI
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-secondary">Đang tải thông tin sách...</p>
      </div>
    );

  if (!sach)
    return (
      <p className="text-center mt-5 text-muted">
        ❌ Không tìm thấy thông tin sách.
      </p>
    );

  // UI Form
  return (
    <div className="min-h-screen bg-light py-5">
      <div className="container">
        <Card
          className="shadow-lg border-0 rounded-4 p-4 mx-auto"
          style={{ maxWidth: "700px" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h3 className="fw-bold text-primary m-0">✏️ Cập nhật thông tin sách</h3>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => router.push("/admin/products")}
            >
              ← Quay lại
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Tên sách</Form.Label>
              <Form.Control
                type="text"
                name="ten_sach"
                value={sach.ten_sach}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tác giả</Form.Label>
                  <Form.Control
                    type="text"
                    name="ten_tac_gia"
                    value={sach.ten_tac_gia}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nhà xuất bản</Form.Label>
                  <Form.Control
                    type="text"
                    name="ten_NXB"
                    value={sach.ten_NXB}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Giá (₫)</Form.Label>
                  <Form.Control
                    type="number"
                    name="gia_sach"
                    value={sach.gia_sach}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Giảm giá (₫)</Form.Label>
                  <Form.Control
                    type="number"
                    name="gg_sach"
                    value={sach.gg_sach}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tồn kho</Form.Label>
                  <Form.Control
                    type="number"
                    name="ton_kho_sach"
                    value={sach.ton_kho_sach}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Loại bìa</Form.Label>
              <Form.Control
                type="text"
                name="loai_bia"
                value={sach.loai_bia}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="mo_ta"
                value={sach.mo_ta}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant="primary"
                className="fw-semibold px-4"
                disabled={saving}
              >
                {saving ? "💾 Đang lưu..." : "✅ Lưu thay đổi"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
