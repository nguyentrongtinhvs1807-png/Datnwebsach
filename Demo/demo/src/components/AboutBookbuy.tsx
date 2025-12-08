"use client";
import React from "react";

export default function AboutBookbuy() {
  // Màu nhấn chính (Xanh Rêu Đậm)
  const primaryColor = "#065f46"; 
  // Màu nhấn phụ (Xanh Lục Vừa)
  const accentColor = "#059669"; 
  // Màu text chung
  const generalTextColor = "#374151";

  return (
    // Bỏ div bao ngoài (vì bạn đã set màu nền trang rồi)
    // Loại bỏ bg-white, shadow-md, và rounded-2xl
    <section className="max-w-5xl mx-auto mt-10 px-5 py-8">
      <h2 
        className="text-3xl font-extrabold mb-6 text-center tracking-wide"
        style={{ color: primaryColor }} // Tiêu đề chính dùng màu Xanh Rêu Đậm
      >
      NHÀ SÁCH TRỰC TUYẾN <span style={{ color: "#FF0000" }}>Pibook.vn</span>
      </h2>

      {/* Đổi text-gray-700 sang màu đậm hơn cho dễ đọc trên nền sáng */}
      <div className="space-y-5 leading-relaxed text-lg" style={{ color: generalTextColor }}>
        <p>
          <strong style={{ color: "#FF0000" }}>Mua sách online</strong> tại nhà sách
          trực tuyến <span className="font-semibold" style={{ color: "#FF0000" }}>Pibook.vn</span> để
          được cập nhật nhanh nhất các tựa sách đủ thể loại với mức giảm{" "}
          <strong>15 – 35%</strong> cùng nhiều ưu đãi, quà tặng hấp dẫn.
        </p>

        <p>
          Qua nhiều năm, Pibook không chỉ là địa chỉ tin cậy để bạn{" "}
          <strong style={{ color: "#FF0000" }}>mua sách trực tuyến</strong>, mà còn là nơi cung cấp
          quà tặng, văn phòng phẩm, vật dụng gia đình,… với chất lượng đảm bảo,
          chủng loại đa dạng và giá cả hợp lý từ hàng trăm thương hiệu uy tín.
        </p>

        <p>
          Đặc biệt, bạn có thể chọn những mẫu{" "}
          <a
            href="#"
            className="underline transition"
            style={{ color: "#FF0000", }}
          >
            sổ tay handmade
          </a>{" "}
          hay nhiều món{" "}
          <a
            href="#"
            className="underline transition"
            style={{ color: "#FF0000", }}
          >
            quà tặng sinh nhật
          </a>{" "}
          độc đáo chỉ có tại Pibook.vn.
        </p>

        <p>
          Khi <strong style={{ color: "#FF0000" }}>mua sách online</strong> tại Pibook, bạn được tận hưởng
          dịch vụ đổi trả hàng miễn phí, giao hàng nhanh tận nơi, thanh toán linh
          hoạt – an toàn, và còn được{" "}
          <strong style={{ color: "#FF0000" }}>giảm thêm khi sử dụng BBxu</strong> giúp bạn{" "}
          <strong style={{ color: "#FF0000" }}>mua sách giá 0đ!</strong>
        </p>

        {/* Hộp thông báo */}
        <div 
          className="p-4 rounded-xl border"
          style={{ 
              backgroundColor: "#ecfdf5", // Xanh Mint Rất Nhạt
              borderColor: "#d1fae5" // Xanh Mint Nhạt
          }}
        >
          <p className="font-medium" style={{ color: primaryColor }}>
            📘 Chỉ với 3 cú click chuột, trải nghiệm mua sách online tại{" "}
            <strong>Pibook.vn</strong> thật dễ chịu và nhẹ nhàng.  
            <span className="block mt-1">
              Còn chần chờ gì nữa? Đặt mua ngay những{" "}
              <a
                href="#"
                className="underline transition"
                style={{ color: primaryColor, textDecorationColor: accentColor }}
              >
                sách hay
              </a>{" "}
              cùng hàng ngàn sản phẩm chất lượng khác!
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}