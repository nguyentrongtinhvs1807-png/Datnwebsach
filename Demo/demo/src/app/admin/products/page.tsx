"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  description?: string;
  hot?: number;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sản phẩm
  useEffect(() => {
    fetch("http://localhost:3003/products")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi fetch API");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("❌ Lỗi:", err))
      .finally(() => setLoading(false));
  }, []);

  // Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

    try {
      const res = await fetch(`http://localhost:3003/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);

      // Cập nhật lại state sau khi xóa
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ Lỗi xóa:", err);
      alert("Xóa thất bại!");
    }
  };

  // Sửa sản phẩm (giả sử chuyển sang trang khác)
  const handleEdit = (id: number) => {
    window.location.href = `/admin/products/edit/${id}`;
  };

  if (loading) return <p className="p-6">⏳ Đang tải sản phẩm...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Quản lý sản phẩm</h1>

      {products.length === 0 ? (
        <p>Không có sản phẩm nào</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Tên sản phẩm</th>
                <th className="px-4 py-2 border">Giá</th>
                <th className="px-4 py-2 border">Ảnh</th>
                <th className="px-4 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{p.id}</td>
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border text-red-600 font-semibold">
                    {p.price.toLocaleString()}₫
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover mx-auto rounded"
                      />
                    ) : (
                      <span className="text-gray-400">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
