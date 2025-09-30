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
    }
  }, []);

  async function handleDoiPass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (pass_new1 !== pass_new2) {
      setThongbao('❌ Hai mật khẩu mới không khớp');
      return;
    }

    try {
      const res = await fetch('http://localhost:3003/auth/doipass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pass_old, pass_new1, pass_new2 }),
      });

      const data = await res.json();
      setThongbao(data.message || "❌ Có lỗi xảy ra");

      if (res.ok) {
        // Nếu đổi pass thành công thì logout luôn
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        alert("✅ Đổi mật khẩu thành công, vui lòng đăng nhập lại");
        router.push('/auth/dangnhap');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setThongbao("❌ Lỗi: " + err.message);
      } else {
        setThongbao("❌ Lỗi không xác định");
      }
    }
  }

  return (
    <form onSubmit={handleDoiPass} className='w-[75%] m-auto border rounded p-4 shadow'>
      <h2 className='bg-emerald-500 p-2 font-bold text-center text-white'>Đổi mật khẩu</h2>

      <div className='m-3'>
        Mật khẩu cũ:
        <input
          type="password"
          className='w-full border p-1'
          value={pass_old}
          onChange={(e) => setPassOld(e.target.value)}
        />
        {pass_old === "" && <i className='text-red-400'>Mời nhập mật khẩu cũ</i>}
      </div>

      <div className='m-3'>
        Mật khẩu mới:
        <input
          type="password"
          className='w-full border p-1'
          value={pass_new1}
          onChange={(e) => setPass1(e.target.value)}
        />
        {pass_new1.length < 6 && <i className='text-red-400'>Mật khẩu phải từ 6 ký tự</i>}
      </div>

      <div className='m-3'>
        Nhập lại mật khẩu mới:
        <input
          type="password"
          className='w-full border p-1'
          value={pass_new2}
          onChange={(e) => setPass2(e.target.value)}
        />
        {pass_new1 !== pass_new2 && <i className='text-red-400'>Hai mật khẩu chưa giống nhau</i>}
      </div>

      <div className='m-3 flex items-center gap-3'>
        <button className='bg-emerald-400 px-4 py-2 text-white rounded' type="submit">
          Đổi mật khẩu
        </button>
        {thong_bao && <p className="text-rose-500 font-bold">{thong_bao}</p>}
      </div>
    </form>
  );
}
