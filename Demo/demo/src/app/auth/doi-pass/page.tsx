'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoiPass() {
  const [email, setEmail] = useState('');
  const [pass_old, setPassOld] = useState('');
  const [pass_new1, setPass1] = useState('');
  const [pass_new2, setPass2] = useState('');
  const [thong_bao, setThongbao] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
    if (storedToken && storedEmail) {
      setToken(storedToken);
      setEmail(storedEmail);
    } else {
      router.push('/auth/dangnhap');
    }
  }, [router]);

  async function handleDoiPass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongbao('');

    if (pass_new1.length < 6)
      return setThongbao('❌ Mật khẩu mới phải từ 6 ký tự');

    if (pass_new1 !== pass_new2)
      return setThongbao('❌ Hai mật khẩu mới không trùng nhau');

    try {
      const res = await fetch('http://localhost:3003/auth/doipass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, pass_old, pass_new1 }),
      });

      const data = await res.json();
      setThongbao(data.message || "❌ Có lỗi xảy ra");

      if (res.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("✅ Đổi mật khẩu thành công, vui lòng đăng nhập lại");
        router.push('/auth/dangnhap');
      }
    } catch (err: any) {
      setThongbao("⚠️ Lỗi kết nối server: " + err.message);
    }
  }

  return (
    <form onSubmit={handleDoiPass} className='w-[75%] m-auto border rounded p-4 shadow mt-10'>
      <h2 className='bg-emerald-500 p-3 font-bold text-center text-white rounded'>
        🔒 Đổi mật khẩu
      </h2>

      <div className='m-3'>
        <label>Mật khẩu cũ:</label>
        <input
          type="password"
          className='w-full border p-2 rounded mt-1'
          value={pass_old}
          onChange={(e) => setPassOld(e.target.value)}
        />
      </div>

      <div className='m-3'>
        <label>Mật khẩu mới:</label>
        <input
          type="password"
          className='w-full border p-2 rounded mt-1'
          value={pass_new1}
          onChange={(e) => setPass1(e.target.value)}
        />
      </div>

      <div className='m-3'>
        <label>Nhập lại mật khẩu mới:</label>
        <input
          type="password"
          className='w-full border p-2 rounded mt-1'
          value={pass_new2}
          onChange={(e) => setPass2(e.target.value)}
        />
      </div>

      {thong_bao && (
        <p className={`text-center font-semibold mb-2 ${
          thong_bao.includes('✅') ? 'text-green-600' : 'text-red-600'
        }`}>
          {thong_bao}
        </p>
      )}

      <div className='flex justify-center'>
        <button className='bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded text-white font-semibold'>
          Đổi mật khẩu
        </button>
      </div>
    </form>
  );
}
