// components/ZaloChat.tsx
"use client";
import { useState, useEffect } from "react";
import styles from "./Zalo.module.css"; // ĐÚNG ĐƯỜNG DẪN RỒI ĐÂY!

export default function ZaloChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const zaloNumber = "0857226757";

  useEffect(() => {
    const saved = sessionStorage.getItem("zaloChatOpen");
    if (saved === "true") setOpen(true);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("zaloChatOpen", String(open));
  }, [open]);

  const send = () => {
    if (!message.trim()) return;
    window.open(`https://zalo.me/${zaloNumber}?text=${encodeURIComponent(message.trim())}`, "_blank");
    setMessage("");
    setOpen(false);
  };

  return (
    <div className={styles.chatWidget}>
      {/* Nút tròn */}
      <button onClick={() => setOpen(!open)} className={styles.floatingButton}>
        <img src="https://i.pinimg.com/1200x/35/b0/e7/35b0e7f4986056b70c8a070e64830243.jpg" alt="Zalo" />
        <div className={styles.onlineDot} />
        <div className={styles.onlinePulse} />
      </button>

      {/* Hộp chat */}
      {open && (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <h3>Pibook</h3>
            <p>Chuyên sách hay – Giao hàng nhanh</p>
            <div className={styles.status}>
              <span></span> Đang online – Trả lời ngay
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.welcomeMsg}>
              <strong>Chào anh/chị!</strong><br />
              Mình là <strong>Pibook</strong> – chuyên sách hay, giá cực tốt<br />
              Anh/chị đang tìm sách gì hay cần hỗ trợ đơn hàng ạ?
            </div>

            <textarea
              rows={4}
              className={styles.textarea}
              placeholder="Nhập tin nhắn của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            />

            <button onClick={send} className={styles.sendBtn}>
              Gửi qua Zalo ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}