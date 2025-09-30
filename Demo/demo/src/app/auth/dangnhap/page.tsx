'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const matkhauRef = useRef<HTMLInputElement>(null);
  const thongbaoRef = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let email = emailRef.current?.value || "";
    let mat_khau = matkhauRef.current?.value || "";

    if (email.trim() === "") {
      if (thongbaoRef.current) thongbaoRef.current.innerHTML = "⚠️ Chưa nhập email";
      emailRef.current?.focus();
      return;
    }

    try {
      let opt = {
        method: "POST",
        body: JSON.stringify({ email, mat_khau }),
        headers: { "Content-Type": "application/json" },
      };

      const res = await fetch("http://localhost:3003/auth/login", opt);
      const data = await res.json();

      if (!res.ok) {
        if (thongbaoRef.current) thongbaoRef.current.innerHTML = `❌ Có lỗi: ${data.message}`;
        return;
      }

      if (thongbaoRef.current) thongbaoRef.current.innerHTML = data.message || "";

      if (data.user) {
        // ✅ Lưu user, token, vai_tro
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("email", data.user.email);
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // báo cho Header cập nhật
        window.dispatchEvent(new Event("login"));

        // ✅ điều hướng
        if (Number(data.user.vai_tro) === 1) {
          router.push("/admin"); // admin dashboard
        } else {
          router.push("/home"); // user thường
        }
      }
    } catch (err: unknown) {
      if (thongbaoRef.current) {
        if (err instanceof Error) {
          thongbaoRef.current.innerHTML = "❌ Có lỗi: " + err.message;
        } else {
          thongbaoRef.current.innerHTML = "❌ Có lỗi không xác định";
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-[90%] md:w-[45%] m-auto border rounded-2xl p-6 shadow-lg bg-white"
    >
      <h2 className="bg-yellow-500 p-3 font-bold text-center text-white rounded-md text-lg">
        🔑 Đăng nhập thành viên
      </h2>

      <div className="m-3">
        <label className="block font-semibold mb-1">Email:</label>
        <input
          type="email"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          ref={emailRef}
        />
      </div>

      <div className="m-3">
        <label className="block font-semibold mb-1">Mật khẩu:</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          ref={matkhauRef}
        />
      </div>

      <div className="m-3 flex items-center gap-3">
        <button
          className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 text-white rounded-full font-semibold shadow-md transition-all duration-300"
          type="submit"
        >
          Đăng nhập
        </button>
        <div ref={thongbaoRef} className="text-rose-600 font-bold"></div>
      </div>

      <div className="m-3 text-sm text-gray-600 text-center">
        Chưa có tài khoản?{" "}
        <Link
          href="/auth/dangky"
          className="text-yellow-600 font-semibold hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
}
