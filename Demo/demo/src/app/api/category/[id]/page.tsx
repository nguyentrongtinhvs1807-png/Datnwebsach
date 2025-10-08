'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface SanPham {
  id: number;
  ten_sp: string;
  gia: number;
  hinh: string;
  mo_ta: string;
}

export default function CategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [sanPham, setSanPham] = useState<SanPham[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/sanpham/danhmuc/${id}`);
        const data = await res.json();
        console.log('📦 Dữ liệu API:', data);
        setSanPham(data);
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-5">⏳ Đang tải sản phẩm...</p>;
  if (sanPham.length === 0)
    return <p className="text-center mt-5">Không có sản phẩm nào trong danh mục này.</p>;

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4 text-center">🛍️ Danh mục {id}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sanPham.map((sp) => (
          <div
            key={sp.id}
            className="border rounded-xl shadow hover:shadow-lg transition p-3 text-center bg-white"
          >
            <Image
              src={sp.hinh || '/next.svg'}
              alt={sp.ten_sp}
              width={200}
              height={200}
              className="mx-auto rounded-lg mb-2"
            />
            <h2 className="font-semibold text-sm line-clamp-2">{sp.ten_sp}</h2>
            <p className="text-red-600 font-bold">{sp.gia.toLocaleString()} ₫</p>
            <p className="text-gray-500 text-xs line-clamp-2">{sp.mo_ta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
