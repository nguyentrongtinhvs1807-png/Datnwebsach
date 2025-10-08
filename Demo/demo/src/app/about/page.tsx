"use client";
import { motion } from "framer-motion";
import { BookOpen, Star, Truck, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl bg-white shadow-2xl rounded-3xl p-10 text-center"
      >
        {/* Tiêu đề */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          📚 Chào mừng đến với{" "}
          <span className="text-blue-600">Nhà Sách Pibook</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-3xl mx-auto">
        Pibook là điểm đến lý tưởng cho những ai yêu sách. 
          Chúng tôi mang đến hàng ngàn tựa sách đa dạng từ văn học, kỹ năng sống, kinh tế 
          cho đến truyện thiếu nhi. Sứ mệnh của chúng tôi là{" "}
          <strong className="text-blue-600">lan tỏa tri thức</strong> 
          và đồng hành cùng bạn trên hành trình khám phá tri thức vô tận.
        </p>

        {/* Banner */}
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          src="/image/b9690ac7ec4b7c94d44d9e519b6c30e7.jpg"
          alt="Nhà sách Luonvuituoi Banner"
          className="w-full rounded-xl shadow-lg mb-12"
        />

        {/* Sứ mệnh */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🎯 Sứ mệnh của chúng tôi
        </h2>
        <p className="text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          Xây dựng một cộng đồng yêu sách, nơi mọi người có thể tìm thấy niềm cảm hứng, 
          tri thức và sự sáng tạo. Chúng tôi luôn nỗ lực mang lại{" "}
          <span className="font-semibold text-gray-800">sản phẩm chất lượng</span>,{" "}
          <span className="font-semibold text-gray-800">dịch vụ tận tâm</span> 
          và những trải nghiệm mua sắm tuyệt vời.
        </p>

        {/* Lý do chọn */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          ✨ Tại sao nên chọn Pibook?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="flex items-start gap-4 p-5 rounded-xl shadow bg-blue-50 hover:shadow-lg transition">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <p className="text-left text-gray-700">
              <strong>Kho sách khổng lồ:</strong> Hàng ngàn đầu sách thuộc nhiều thể loại phong phú.
            </p>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-xl shadow bg-blue-50 hover:shadow-lg transition">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <p className="text-left text-gray-700">
              <strong>Sách chính hãng:</strong> Đảm bảo chất lượng in ấn, giấy tốt, bền đẹp.
            </p>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-xl shadow bg-blue-50 hover:shadow-lg transition">
            <Star className="w-8 h-8 text-yellow-500" />
            <p className="text-left text-gray-700">
              <strong>Giá cả hợp lý:</strong> Thường xuyên có chương trình khuyến mãi hấp dẫn.
            </p>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-xl shadow bg-blue-50 hover:shadow-lg transition">
            <Truck className="w-8 h-8 text-red-500" />
            <p className="text-left text-gray-700">
              <strong>Dịch vụ chuyên nghiệp:</strong> Giao hàng nhanh chóng, hỗ trợ khách hàng tận tình.
            </p>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <a
            href="/products"
            className="bg-blue-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all text-lg font-semibold"
          >
            🔎 Khám phá ngay
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
