'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DangKy() {
  const [ho_ten, setHT] = useState('');
  const [email, setEmail] = useState('');
  const [dien_thoai, setDienThoai] = useState('');
  const [mat_khau, setPass1] = useState('');
  const [go_lai_mat_khau, setPass2] = useState('');
  const [thong_bao, setThongbao] = useState("");
  const router = useRouter();

  async function handleDangKy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mat_khau !== go_lai_mat_khau) {
      setThongbao('❌ 2 mật khẩu không giống nhau');
      return;
    }

    try {
      const res = await fetch("http://localhost:3003/auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho_ten, email, dien_thoai, mat_khau }),
      });

      const data = await res.json();
      setThongbao(data.message || "Có lỗi xảy ra");

      if (res.status === 200) {
        router.push('/auth/dangnhap'); // đăng ký thành công → quay lại đăng nhập
      }
    } catch (err: any) {
      setThongbao("Lỗi kết nối server: " + err.message);
    }
  }

  return (
    <form
      onSubmit={handleDangKy}
      className="w-[90%] md:w-[50%] m-auto border rounded-2xl p-6 shadow-lg bg-white"
    >
      <h2 className="bg-yellow-500 p-3 font-bold text-center text-white rounded-md text-lg">
        ✨ Đăng ký thành viên
      </h2>

      <div className="m-3">
        <label className="block font-semibold mb-1">Họ tên:</label>
        <input
          type="text"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={ho_ten}
          onChange={(e) => setHT(e.target.value)}
        />
        {ho_ten.length > 0 && ho_ten.length < 10 && (
          <i className="text-red-500 text-sm">Họ tên nhập từ 10 ký tự</i>
        )}
      </div>

      <div className="m-3">
        <label className="block font-semibold mb-1">Email:</label>
        <input
          type="email"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="m-3">
        <label className="block font-semibold mb-1">Số điện thoại:</label>
        <input
          type="text"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={dien_thoai}
          onChange={(e) => setDienThoai(e.target.value)}
        />
      </div>

      <div className="m-3">
        <label className="block font-semibold mb-1">Mật khẩu:</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={mat_khau}
          onChange={(e) => setPass1(e.target.value)}
        />
        {mat_khau.length > 0 && mat_khau.length < 6 && (
          <i className="text-red-500 text-sm">Mật khẩu từ 6 ký tự</i>
        )}
      </div>

      <div className="m-3">
        <label className="block font-semibold mb-1">Nhập lại mật khẩu:</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          value={go_lai_mat_khau}
          onChange={(e) => setPass2(e.target.value)}
        />
        {mat_khau !== go_lai_mat_khau && go_lai_mat_khau.length > 0 && (
          <i className="text-red-500 text-sm">Hai mật khẩu chưa giống</i>
        )}
      </div>

      <div className="m-3 flex items-center gap-3">
        <button
          className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 text-white rounded-full font-semibold shadow-md transition-all duration-300"
          type="submit"
        >
          Đăng ký
        </button>
        {thong_bao && <p className="text-red-600 font-semibold">{thong_bao}</p>}
      </div>
    </form>
  );
}
