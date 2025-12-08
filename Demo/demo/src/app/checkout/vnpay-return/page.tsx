'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Home, Package, Sparkles } from 'lucide-react';

export default function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Đang kiểm tra kết quả thanh toán...');

  useEffect(() => {
    if (!searchParams) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch('http://localhost:3003/api/vnpay-return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(searchParams.entries())),
        });

        const data = await res.json();

        if (data.success) {
          const don_hang_id = data.don_hang_id;     // ← ID số thật từ backend
          const orderCode = data.orderCode;         // ← Mã đơn PIBOOK-xxx để hiển thị

          if (!don_hang_id) {
            console.error('Backend không trả về don_hang_id!');
            setStatus('failed');
            setMessage('Lỗi hệ thống: Không lấy được ID đơn hàng.');
            return;
          }

          // CẬP NHẬT TỔNG TIỀN – BẮT BUỘC DÙNG ID SỐ!!!
          await fetch('http://localhost:3003/api/update-order-total', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: don_hang_id }),
          });

          setStatus('success');
          setMessage(`Thanh toán thành công đơn hàng #${orderCode}!`);

          // Xóa giỏ hàng sau khi thanh toán thành công
          localStorage.removeItem('cart');
          localStorage.removeItem('checkoutItems');
          localStorage.removeItem('appliedDiscount');
          window.dispatchEvent(new Event('cart-update'));
          window.dispatchEvent(new Event('checkoutSuccess'));
        } else {
          setStatus('failed');
          setMessage(data.message || 'Thanh toán không thành công. Vui lòng thử lại.');
        }
      } catch (err) {
        console.error('Lỗi verify VNPay:', err);
        setStatus('failed');
        setMessage('Lỗi kết nối server. Vui lòng thử lại sau.');
      }
    };

    const code = searchParams.get('vnp_ResponseCode');

    if (code === '00') {
      verifyPayment();
    } else if (code) {
      setStatus('failed');
      const errors: Record<string, string> = {
        '24': 'Bạn đã hủy giao dịch',
        '75': 'Ngân hàng đang bảo trì',
        '79': 'Sai OTP hoặc thông tin thẻ',
      };
      setMessage(errors[code] || `Thanh toán thất bại (mã lỗi: ${code})`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* LOADING */}
        {status === 'loading' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center animate-pulse">
            <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center animate-spin">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-xl text-gray-600">{message}</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-16 text-center transform transition-all duration-1000 scale-100 hover:scale-[1.02]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 blur-3xl opacity-50 animate-pulse"></div>
              <div className="relative w-40 h-40 mx-auto mb-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <CheckCircle2 className="w-28 h-28 text-white drop-shadow-2xl" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
              THANH TOÁN THÀNH CÔNG!
            </h1>

            <p className="text-2xl font-semibold text-gray-800 mb-4">{message}</p>
            <p className="text-lg text-gray-600 mb-10">
              Cảm ơn bạn đã tin tưởng <span className="font-bold text-emerald-600">PIBOOK</span>
              <br />
              <span className="text-sm text-gray-500">Đơn hàng sẽ được xử lý ngay lập tức!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link
                href="/orders"
                className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <Package className="w-6 h-6 mr-3" />
                Xem đơn hàng
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></span>
              </Link>

              <Link
                href="/"
                className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Home className="w-6 h-6 mr-3" />
                Về trang chủ
              </Link>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                Chúc bạn đọc sách vui vẻ
              </p>
            </div>
          </div>
        )}

        {/* FAILED */}
        {status === 'failed' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-8xl">Lỗi</span>
            </div>
            <h1 className="text-5xl font-bold text-red-600 mb-6">Thanh toán thất bại</h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">{message}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/cart"
                className="px-12 py-5 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transform hover:scale-105 transition"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}