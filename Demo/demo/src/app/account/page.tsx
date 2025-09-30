// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";

interface User {
  name: string;
  username: string;
  email: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold text-gray-800">Tài khoản của tôi</h2>
        <p className="mt-3 text-gray-600">Chưa có thông tin tài khoản.</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Tài khoản của tôi
      </h2>
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Tên tài khoản</p>
            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-semibold text-gray-800">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
