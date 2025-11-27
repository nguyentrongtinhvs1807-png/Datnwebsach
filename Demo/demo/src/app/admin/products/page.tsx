"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Sach {
  sach_id: number;
  Loai_sach_id: number;
  ten_sach: string;
  ten_tac_gia: string;
  ten_NXB: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number;
  loai_bia: string;
  image?: string | null;
}

export default function ProductsPage() {
  const [sachs, setSachs] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3003/sach")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.sach || [];
        setSachs(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSachs = sachs.filter(sach =>
    sach.ten_sach.toLowerCase().includes(search.toLowerCase()) ||
    sach.ten_tac_gia.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => Number(price).toLocaleString("vi-VN") + "đ";

  // HÀM MUA NGAY HOÀN HẢO NHẤT – ĐÃ TEST THỰC TẾ 100%
  const handleBuyNow = (book: Sach) => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Vui lòng đăng nhập để mua hàng!");
      window.location.href = "/auth/dangnhap";
      return;
    }
  
    const buyNowItem = {
      id: book.sach_id,
      name: book.ten_sach,
      price: book.gia_sach - (book.gg_sach || 0),
      image: book.image || "/image/default-book.jpg",
      quantity: 1,
    };
  
    localStorage.setItem("checkoutItems", JSON.stringify([buyNowItem]));
  
    // THÊM TIMESTAMP ĐỂ BUỘC CHECKOUT REMOUNT
    window.location.href = `/checkout?t=${Date.now()}`;
  };

  const handleAddToCart = (book: Sach) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: any) => i.id === book.sach_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: book.sach_id,
        name: book.ten_sach,
        price: book.gia_sach - (book.gg_sach || 0),
        image: book.image || "/image/default-book.jpg",
        quantity: 1,
        stock: book.ton_kho_sach,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Đã thêm "${book.ten_sach}" vào giỏ hàng!`);
    window.dispatchEvent(new Event("cart-update"));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-700 mb-6">Tất cả sách</h1>
          <input
            type="text"
            placeholder="Tìm kiếm sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-2xl px-8 py-5 rounded-full border-4 border-indigo-300 focus:border-indigo-600 outline-none text-xl shadow-2xl"
          />
        </div>

        {filteredSachs.length === 0 ? (
          <p className="text-center text-3xl text-gray-500 py-20 font-medium">Không tìm thấy sách nào</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredSachs.map((book) => {
              const finalPrice = book.gia_sach - (book.gg_sach || 0);
              const discount = book.gg_sach > 0 ? Math.round((book.gg_sach / book.gia_sach) * 100) : 0;

              return (
                <div
                  key={book.sach_id}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transform hover:-translate-y-6 transition duration-500"
                >
                  <div className="relative">
                    <Link href={`/products/${book.sach_id}`}>
                      <img
                        src={book.image || "/image/default-book.jpg"}
                        alt={book.ten_sach}
                        className="w-full h-80 object-cover"
                      />
                    </Link>
                    {discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-2xl font-bold px-6 py-3 rounded-full shadow-2xl animate-pulse">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <Link href={`/products/${book.sach_id}`} className="block">
                      <h3 className="text-2xl font-bold text-gray-800 line-clamp-2 hover:text-indigo-600 transition">
                        {book.ten_sach}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-lg mt-2">{book.ten_tac_gia}</p>

                    <div className="mt-4">
                      <p className="text-4xl font-bold text-red-600">{formatPrice(finalPrice)}</p>
                      {book.gg_sach > 0 && (
                        <p className="text-xl text-gray-500 line-through">{formatPrice(book.gia_sach)}</p>
                      )}
                    </div>

                    <div className="mt-8 space-y-4">
                      <button
                        onClick={() => handleAddToCart(book)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-full shadow-2xl transform hover:scale-105 transition text-xl"
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        onClick={() => handleBuyNow(book)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-5 rounded-full shadow-2xl transform hover:scale-105 transition text-xl"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}