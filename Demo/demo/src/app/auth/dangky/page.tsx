'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DangKy() {
  const [form, setForm] = useState({
    ho_ten: '',
    email: '',
    dien_thoai: '',
    mat_khau: '',
    nhap_lai_mat_khau: ''
  });
  const [loading, setLoading] = useState(false);
  const [thong_bao, setThongbao] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleDangKy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThongbao('');

    // 🔎 Kiểm tra hợp lệ
    if (form.ho_ten.trim().length < 3)
      return setThongbao('❌ Họ tên phải có ít nhất 3 ký tự');
    if (!form.email.includes('@'))
      return setThongbao('❌ Email không hợp lệ');
    if (form.dien_thoai.trim().length < 9)
      return setThongbao('❌ Số điện thoại không hợp lệ');
    if (form.mat_khau.length < 6)
      return setThongbao('❌ Mật khẩu phải từ 6 ký tự trở lên');
    if (form.mat_khau !== form.nhap_lai_mat_khau)
      return setThongbao('❌ Hai mật khẩu không trùng khớp');

    try {
      setLoading(true);

      // ✅ Gửi đúng key backend mong đợi
      const res = await fetch('http://localhost:3003/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ho_ten: form.ho_ten,
          email: form.email,
          dien_thoai: form.dien_thoai,
          mat_khau: form.mat_khau
        })
      });

      const data = await res.json();
      setThongbao(data.message || '❌ Đăng ký thất bại');

      if (res.ok) {
        setThongbao('✅ Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => router.push('/auth/dangnhap'), 1200);
      }
    } catch (err: any) {
      setThongbao('⚠️ Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-100 to-yellow-200 p-6">
      <form
        onSubmit={handleDangKy}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border"
      >
        <h2 className="text-center text-2xl font-bold text-yellow-600 mb-6">
          ✨ Đăng ký thành viên
        </h2>

        {/* Input fields */}
        {['ho_ten', 'email', 'dien_thoai', 'mat_khau', 'nhap_lai_mat_khau'].map((field) => (
          <div className="mb-4" key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === 'ho_ten'
                ? 'Họ tên'
                : field === 'email'
                ? 'Email'
                : field === 'dien_thoai'
                ? 'Số điện thoại'
                : field === 'mat_khau'
                ? 'Mật khẩu'
                : 'Nhập lại mật khẩu'}
            </label>
            <input
              type={field.includes('mat_khau') ? 'password' : 'text'}
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder={
                field === 'ho_ten'
                  ? 'Nhập họ tên...'
                  : field === 'email'
                  ? 'Nhập email...'
                  : field === 'dien_thoai'
                  ? 'Nhập số điện thoại...'
                  : field === 'mat_khau'
                  ? 'Nhập mật khẩu...'
                  : 'Nhập lại mật khẩu...'
              }
            />
          </div>
        ))}

        {/* Hiển thị thông báo */}
        {thong_bao && (
          <p
            className={`text-center font-semibold mb-3 ${
              thong_bao.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {thong_bao}
          </p>
        )}

        {/* Nút submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-full text-white font-semibold transition-all duration-300 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          {loading ? '⏳ Đang xử lý...' : 'Đăng ký'}
        </button>

        <p className="text-center text-sm mt-4">
          Đã có tài khoản?{' '}
          <span
            onClick={() => router.push('/auth/dangnhap')}
            className="text-yellow-600 font-semibold hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </span>
        </p>
      </form>
    </div>
  );
}
