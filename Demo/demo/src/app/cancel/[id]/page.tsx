"use client";
import React, { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";

const CancelOrder: React.FC = () => {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const cancelReasons = [
    "Tôi đã đặt nhầm sản phẩm",
    "Tôi tìm được giá rẻ hơn ở nơi khác",
    "Thời gian giao hàng quá lâu",
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi không còn nhu cầu mua nữa",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reasonToSend = customReason || selectedReason;

    if (!reasonToSend) {
      alert("Vui lòng chọn hoặc nhập lý do huỷ đơn.");
      return;
    }

    // 🚀 Gửi API huỷ đơn ở đây
    console.log("Lý do huỷ:", reasonToSend);

    alert("Đơn hàng đã được huỷ thành công!");
    router.push("/orders"); // Quay lại trang danh sách đơn hàng
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "700px" }}>
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <h3 className="text-center mb-4 fw-bold" style={{ color: "#ff5722" }}>
          Huỷ đơn hàng
        </h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Chọn lý do huỷ:</Form.Label>
            {cancelReasons.map((reason, idx) => (
              <Form.Check
                key={idx}
                type="radio"
                id={`reason-${idx}`}
                name="cancelReason"
                label={reason}
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="mb-2"
              />
            ))}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Lý do khác (tùy chọn):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập lý do khác..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="secondary"
              type="button"
              className="px-4"
              onClick={() => router.push("/orders")}
            >
              Quay lại
            </Button>

            <Button
              variant="danger"
              type="submit"
              className="px-4"
              style={{
                backgroundColor: "#ff5722",
                border: "none",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e64a19")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff5722")}
            >
              Xác nhận huỷ
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default CancelOrder;
