"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Container, Card, Alert, Spinner } from "react-bootstrap";

export default function DoiPass() {
  const [email, setEmail] = useState("");
  const [passOld, setPassOld] = useState("");
  const [passNew1, setPassNew1] = useState("");
  const [passNew2, setPassNew2] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Kiểm tra đăng nhập trước khi vào trang
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      alert("⚠️ Bạn cần đăng nhập trước khi đổi mật khẩu!");
      router.push("/auth/dangnhap");
      return;
    }

    try {
      const user = JSON.parse(userData);
      setEmail(user.email || "");
    } catch {
      alert("❌ Dữ liệu người dùng không hợp lệ, vui lòng đăng nhập lại.");
      localStorage.clear();
      router.push("/auth/dangnhap");
    }
  }, [router]);

  // ✅ Xử lý đổi mật khẩu
  async function handleDoiPass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // tránh trình duyện reloaad trang
    setMessage("");

    if (!passOld || !passNew1 || !passNew2)
      return setMessage("⚠️ Vui lòng nhập đầy đủ thông tin.");
    if (passNew1.length < 6)
      return setMessage("❌ Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (passNew1 !== passNew2)
      return setMessage("❌ Hai mật khẩu mới không trùng nhau.");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        router.push("/auth/dangnhap");
        return;
      }

      const res = await fetch("http://localhost:3003/auth/doi-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pass_old: passOld,
          pass_new: passNew1,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server trả về không phải JSON: " + text.slice(0, 80));
      }

      if (!res.ok) {
        if (data.message?.includes("Token")) {
          setMessage("⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
          localStorage.clear();
          setTimeout(() => router.push("/auth/dangnhap"), 1500);
        } else {
          setMessage(data.message || "❌ Lỗi đổi mật khẩu.");
        }
        return;
      }

      setMessage("✅ Đổi mật khẩu thành công!");
      localStorage.clear();
      setTimeout(() => {
        alert("✅ Đổi mật khẩu thành công, vui lòng đăng nhập lại.");
        router.push("/auth/dangnhap");
      }, 1000);
    } catch (err: any) {
      console.error("⚠️ Lỗi kết nối server:", err);
      setMessage("⚠️ Lỗi kết nối server: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #d4fc79, #96e6a1)",
      }}
    >
      <Card className="shadow-lg border-0 rounded-4 p-4" style={{ width: "450px" }}>
        <Card.Body>
          <h3 className="text-center text-success fw-bold mb-3">
            🔒 Đổi mật khẩu
          </h3>

          {email && (
            <p className="text-center text-muted mb-4">
              Tài khoản: <span className="fw-semibold text-dark">{email}</span>
            </p>
          )}

          <Form onSubmit={handleDoiPass}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mật khẩu cũ</Form.Label>
              <Form.Control
                type="password"
                value={passOld}
                onChange={(e) => setPassOld(e.target.value)}
                placeholder="Nhập mật khẩu cũ..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={passNew1}
                onChange={(e) => setPassNew1(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Nhập lại mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={passNew2}
                onChange={(e) => setPassNew2(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
              />
            </Form.Group>

            {message && (
              <Alert
                variant={
                  message.includes("✅")
                    ? "success"
                    : message.includes("⚠️")
                    ? "warning"
                    : "danger"
                }
                className="text-center py-2"
              >
                {message}
              </Alert>
            )}

            <div className="d-grid">
              <Button
                type="submit"
                variant="success"
                disabled={loading}
                className="fw-semibold"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> &nbsp;Đang xử lý...
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
