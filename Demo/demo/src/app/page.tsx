"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-6 drop-shadow-lg animate-fade-in">
        Xin chào, Nguyễn Trọng Tín 
      </h1>

      <p className="text-lg text-gray-700 mb-10 max-w-md">
        Chào mừng anh đến với trang chính. Chọn một mục bên dưới để bắt đầu nhé 
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/products"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-xl transition duration-200"
        >
          🛒 Sản phẩm
        </Link>

        <Link
          href="/policy"
          className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-xl transition duration-200"
        >
          📜 Chính sách
        </Link>

        <Link
          href="/ui"
          className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-xl transition duration-200"
        >
          🧑‍💻 Đăng ký
        </Link>

        {/* Thêm nút quay lại trang Home */}
        <Link
          href="/home"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-xl transition duration-200"
        >
          🏠 Quay về trang Home
        </Link>
      </div>

      <footer className="mt-16 text-sm text-gray-600">
        © {new Date().getFullYear()} - Made with ❤️ by Tín
      </footer>
    </div>
  );
}
