// app/cancel/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

const REASONS = [
  "Tôi đã đặt nhầm sản phẩm",
  "Tôi tìm được giá rẻ hơn ở nơi khác",
  "Thời gian giao hàng quá lâu",
  "Tôi muốn thay đổi địa chỉ giao hàng",
  "Tôi không còn nhu cầu mua nữa",
];

export default function CancelOrderPage() {
  const router = useRouter();
  const params = useParams();
const id = params?.id as string; // ép kiểu an toàn
// hoặc nếu id có thể là mảng (rất hiếm): 
// const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleCancel = async () => {
    if (!selectedReason && !otherReason.trim()) {
      toast.error("Vui lòng chọn hoặc nhập lý do hủy đơn!");
      return;
    }

    const reason = selectedReason === "other" ? otherReason.trim() : selectedReason;

    try {
      const res = await fetch(`http://localhost:3003/orders/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ly_do_huy: reason }),
      });

      if (res.ok) {
        toast.success("Hủy đơn hàng thành công! Admin sẽ sớm xử lý.");
        setTimeout(() => router.push("/orders"), 2000);
      } else {
        toast.error("Hủy đơn thất bại, vui lòng thử lại!");
      }
    } catch {
      toast.error("Lỗi kết nối, vui lòng thử lại!");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h2 className="text-center fw-bold mb-4" style={{ color: "#e74c3c" }}>
                Hủy đơn hàng
              </h2>
              <p className="text-center text-muted mb-5">
                Đơn hàng <strong className="text-primary">#PIBOOK-{id}</strong>
              </p>

              <div className="mb-4">
                <label className="form-label fw-bold">Chọn lý do hủy:</label>
                {REASONS.map((reason) => (
                  <div key={reason} className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="reason"
                      id={reason}
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label" htmlFor={reason} style={{ cursor: "pointer" }}>
                      {reason}
                    </label>
                  </div>
                ))}

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="reason"
                    id="other"
                    value="other"
                    checked={selectedReason === "other"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="other">
                    Lý do khác
                  </label>
                </div>

                {selectedReason === "other" && (
                  <textarea
                    className="form-control mt-3"
                    rows={4}
                    placeholder="Nhập lý do khác..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                  />
                )}
              </div>

              <div className="d-flex gap-3 justify-content-center mt-5">
                <button
                  className="btn btn-secondary btn-lg px-5 rounded-pill"
                  onClick={() => router.push("/orders")}
                >
                  Quay lại
                </button>
                <button
                  className="btn btn-danger btn-lg px-5 rounded-pill shadow"
                  onClick={handleCancel}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}