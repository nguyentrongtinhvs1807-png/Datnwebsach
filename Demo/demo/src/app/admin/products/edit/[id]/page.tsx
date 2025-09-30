"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";  // 👈 thêm useParams

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  hot?: number;
}

export default function EditProductClient() {
  const router = useRouter();
  const params = useParams();             // 👈 lấy params từ URL
  const id = params?.id as string;        // 👈 ép kiểu string
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  console.log("🌍 process.env.NEXT_PUBLIC_API_URL:", API_URL);
  console.log("🆔 ID từ URL:", id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.log("⚠️ Không có id");
      return;
    }

    const url = `${API_URL}/products/${id}`;
    console.log("🔎 Gọi API:", url);

    fetch(url)
      .then((res) => {
        console.log("📡 Response status:", res.status);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        return res.json();
      })
      .then((data) => {
        console.log("📦 Dữ liệu sản phẩm:", data);
        setProduct({
          id: data.id || data.id_sp,
          name: data.ten_sp || data.name,
          price: data.gia || data.price,
          originalPrice: data.gia_km || data.originalPrice,
          image: data.hinh || data.image,
          description: data.mo_ta || data.description,
          hot: data.hot,
        });
      })
      .catch((err) => {
        console.error("❌ Lỗi khi fetch sản phẩm:", err);
        router.push("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [id, API_URL, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!product) return;
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      alert("✅ Sửa sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra khi cập nhật sản phẩm!");
    }
  };

  if (loading) return <p className="text-center p-4">⏳ Đang tải...</p>;
  if (!product) return <p className="text-center p-4">❌ Không tìm thấy sản phẩm</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-xl">
      <h1 className="text-2xl font-bold mb-4">✏️ Chỉnh sửa sản phẩm</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Tên sản phẩm"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Giá"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="originalPrice"
          value={product.originalPrice ?? ""}
          onChange={handleChange}
          placeholder="Giá khuyến mãi"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="image"
          value={product.image}
          onChange={handleChange}
          placeholder="Link hình ảnh"
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Mô tả sản phẩm"
          className="w-full p-2 border rounded"
          rows={4}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
