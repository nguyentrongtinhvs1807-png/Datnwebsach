"use client";
import React from "react";

export default function AboutBookbuy() {
  return (
    <section className="max-w-5xl mx-auto mt-10 px-5 py-8 bg-white shadow-md rounded-2xl">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 tracking-wide">
        NHÀ SÁCH TRỰC TUYẾN <span className="text-orange-500">Pibook.vn</span>
      </h2>

      <div className="space-y-5 text-gray-700 leading-relaxed text-lg">
        <p>
          <strong className="text-blue-700">Mua sách online</strong> tại nhà sách
          trực tuyến <span className="font-semibold text-orange-600">Pibook.vn</span> để
          được cập nhật nhanh nhất các tựa sách đủ thể loại với mức giảm{" "}
          <strong>15 – 35%</strong> cùng nhiều ưu đãi, quà tặng hấp dẫn.
        </p>

        <p>
          Qua nhiều năm, Pibook không chỉ là địa chỉ tin cậy để bạn{" "}
          <strong className="text-blue-700">mua sách trực tuyến</strong>, mà còn là nơi cung cấp
          quà tặng, văn phòng phẩm, vật dụng gia đình,… với chất lượng đảm bảo,
          chủng loại đa dạng và giá cả hợp lý từ hàng trăm thương hiệu uy tín.
        </p>

        <p>
          Đặc biệt, bạn có thể chọn những mẫu{" "}
          <a
            href="#"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            sổ tay handmade
          </a>{" "}
          hay nhiều món{" "}
          <a
            href="#"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            quà tặng sinh nhật
          </a>{" "}
          độc đáo chỉ có tại Pibook.vn.
        </p>

        <p>
          Khi <strong className="text-blue-700">mua sách online</strong> tại Pibook, bạn được tận hưởng
          dịch vụ đổi trả hàng miễn phí, giao hàng nhanh tận nơi, thanh toán linh
          hoạt – an toàn, và còn được{" "}
          <strong className="text-green-600">giảm thêm khi sử dụng BBxu</strong> giúp bạn{" "}
          <strong className="text-orange-600">mua sách giá 0đ!</strong>
        </p>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="font-medium text-blue-800">
            📘 Chỉ với 3 cú click chuột, trải nghiệm mua sách online tại{" "}
            <strong>Pibook.vn</strong> thật dễ chịu và nhẹ nhàng.  
            <span className="block mt-1">
              Còn chần chờ gì nữa? Đặt mua ngay những{" "}
              <a
                href="#"
                className="text-blue-600 underline hover:text-blue-800 transition"
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
