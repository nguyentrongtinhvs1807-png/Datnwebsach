'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoiPass() {
  const [email, setEmail] = useState('');
  const [passOld, setPassOld] = useState('');
  const [passNew1, setPassNew1] = useState('');
  const [passNew2, setPassNew2] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // ✅ Kiểm tra đăng nhập trước khi vào trang
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      alert('⚠️ Bạn cần đăng nhập trước khi đổi mật khẩu!');
      router.push('/auth/dangnhap');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setEmail(user.email || '');
    } catch {
      alert('❌ Dữ liệu người dùng không hợp lệ, vui lòng đăng nhập lại.');
      localStorage.clear();
      router.push('/auth/dangnhap');
    }
  }, [router]);

  // ✅ Xử lý đổi mật khẩu
  async function handleDoiPass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');

    if (!passOld || !passNew1 || !passNew2) {
      return setMessage('⚠️ Vui lòng nhập đầy đủ thông tin.');
    }

    if (passNew1.length < 6) {
      return setMessage('❌ Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    if (passNew1 !== passNew2) {
      return setMessage('❌ Hai mật khẩu mới không trùng nhau.');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
        router.push('/auth/dangnhap');
        return;
      }

      const res = await fetch('http://localhost:3003/auth/doi-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error('Server trả về không phải JSON: ' + text.slice(0, 80));
      }

      if (!res.ok) {
        if (data.message?.includes('Token')) {
          setMessage('⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
          localStorage.clear();
          setTimeout(() => router.push('/auth/dangnhap'), 1500);
        } else {
          setMessage(data.message || '❌ Lỗi đổi mật khẩu.');
        }
        return;
      }

      setMessage('✅ Đổi mật khẩu thành công!');
      localStorage.clear();
      setTimeout(() => {
        alert('✅ Đổi mật khẩu thành công, vui lòng đăng nhập lại.');
        router.push('/auth/dangnhap');
      }, 1000);
    } catch (err: any) {
      console.error('⚠️ Lỗi kết nối server:', err);
      setMessage('⚠️ Lỗi kết nối server: ' + err.message);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <form
        onSubmit={handleDoiPass}
        className="w-full max-w-md border rounded-2xl p-8 shadow-lg bg-white transition-all hover:shadow-2xl"
      >
        <h2 className="bg-emerald-600 text-white p-3 text-center font-bold text-lg rounded">
          🔒 Đổi mật khẩu
        </h2>

        {email && (
          <p className="text-center text-gray-500 text-sm mt-2">
            Tài khoản: <span className="font-semibold">{email}</span>
          </p>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="font-semibold">Mật khẩu cũ:</label>
            <input
              type="password"
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              value={passOld}
              onChange={(e) => setPassOld(e.target.value)}
              placeholder="Nhập mật khẩu cũ..."
            />
          </div>

          <div>
            <label className="font-semibold">Mật khẩu mới:</label>
            <input
              type="password"
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              value={passNew1}
              onChange={(e) => setPassNew1(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
            />
          </div>

          <div>
            <label className="font-semibold">Nhập lại mật khẩu mới:</label>
            <input
              type="password"
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              value={passNew2}
              onChange={(e) => setPassNew2(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
            />
          </div>
        </div>

        {message && (
          <p
            className={`text-center font-semibold mt-4 transition-all ${
              message.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all active:scale-95"
          >
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
}
