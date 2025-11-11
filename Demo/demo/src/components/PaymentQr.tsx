"use client";

import React, { useEffect, useState } from "react";

type Props = {
  amount: number; // vnđ
  account: string; // số tài khoản
  beneficiary: string; // tên thụ hưởng
  bankName?: string;
  note?: string; // nội dung chuyển khoản (nội dung)
  onClose?: () => void;
};

export default function PaymentQr({
  amount,
  account,
  beneficiary,
  bankName = "",
  note = "",
  onClose,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Nội dung QR: bạn có thể thay định dạng này theo yêu cầu
  // Mình dùng JSON/Plain text để dễ đọc — nếu cần EMVCo hãy báo mình sẽ hỗ trợ.
  const buildPayload = () => {
    // Chuỗi payload cho QR (ở đây dùng JSON string để dễ parse)
    const payload = {
      type: "bank_transfer",
      beneficiary,
      account,
      bank: bankName,
      amount, // đơn vị VND
      note,
      createdAt: new Date().toISOString(),
    };
    return payload;
  };

  useEffect(() => {
    // Generate QR khi mount bằng API backend
    const gen = async () => {
      setGenerating(true);
      try {
        const payload = buildPayload();
        // Gọi API backend để generate QR
        const res = await fetch("http://localhost:3003/api/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });

        if (res.ok) {
          const data = await res.json();
          setQrDataUrl(data.dataUrl);
        } else {
          console.error("QR generation failed");
        }
      } catch (err) {
        console.error("QR generation error:", err);
      } finally {
        setGenerating(false);
      }
    };
    gen();
    // regenerate nếu props thay đổi
  }, [amount, account, beneficiary, bankName, note]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `pibook-payment-${Date.now()}.png`;
    a.click();
  };

  const handleCopyText = async () => {
    const payload = buildPayload();
    const text = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(text);
    alert("Đã copy nội dung chuyển khoản vào clipboard");
  };

  return (
    <div className="p-3">
      <h5>Thanh toán chuyển khoản</h5>
      <div className="mb-3">
        <strong>Người nhận:</strong> {beneficiary} <br />
        <strong>Số tài khoản:</strong> {account} <br />
        <strong>Ngân hàng:</strong> {bankName || "—"} <br />
        <strong>Số tiền:</strong> {amount.toLocaleString("vi-VN")} ₫ <br />
        <strong>Nội dung:</strong> {note || "(Không)"} <br />
      </div>

      <div className="mb-3">
        {generating ? (
          <div>Đang tạo mã QR…</div>
        ) : qrDataUrl ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <img
              src={qrDataUrl}
              alt="QR Payment"
              style={{ width: 260, height: 260, borderRadius: 8, background: "#fff" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 260 }}>
              <button 
                className="btn btn-primary w-100" 
                onClick={handleDownload}
                style={{ borderRadius: "8px", padding: "10px" }}
              >
                Tải mã QR
              </button>
              <button 
                className="btn btn-outline-secondary w-100" 
                onClick={handleCopyText}
                style={{ borderRadius: "8px", padding: "10px" }}
              >
                Copy nội dung chuyển khoản
              </button>
              {onClose && (
              <button
                  className="btn btn-sm btn-light w-100"
                  onClick={() => onClose()}
                  style={{ borderRadius: "8px" }}
              >
                Đóng
              </button>
              )}
            </div>
          </div>
        ) : (
          <div>Không thể tạo mã QR</div>
        )}
      </div>
      <small className="text-muted">
        Lưu ý: QR chứa thông tin chuyển khoản dạng văn bản. Người nhận cần nhập/sao chép nội
        dung/số tiền vào app ngân hàng nếu app đó không hỗ trợ parse tự động định dạng này.
      </small>
    </div>
  );
}
