export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl bg-white shadow-2xl rounded-2xl p-10 text-center">
        
        {/* Tiêu đề */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          📚 Chào mừng đến với <span className="text-blue-600">Nhà Sách Bookstore</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        Bookstore là điểm đến lý tưởng cho những ai yêu sách. 
          Chúng tôi mang đến hàng ngàn tựa sách đa dạng từ văn học, kỹ năng sống, kinh tế 
          cho đến truyện thiếu nhi. Sứ mệnh của chúng tôi là <strong>lan tỏa tri thức</strong> 
          và đồng hành cùng bạn trên hành trình khám phá tri thức vô tận.
        </p>

        {/* Banner */}
        <img
          src="https://cdn.pixabay.com/photo/2016/11/29/01/12/adult-1867744_1280.jpg"
          alt="Nhà sách Luonvuituoi Banner"
          className="w-full rounded-xl shadow-lg mb-8"
        />

        {/* Sứ mệnh */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Sứ mệnh của chúng tôi</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Xây dựng một cộng đồng yêu sách, nơi mọi người có thể tìm thấy niềm cảm hứng, 
          tri thức và sự sáng tạo. Chúng tôi luôn nỗ lực mang lại <strong>sản phẩm chất lượng</strong>, 
          <strong>dịch vụ tận tâm</strong> và những trải nghiệm mua sắm tuyệt vời.
        </p>

        {/* Lý do chọn */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">✨ Tại sao nên chọn Bookstore?</h2>
        <ul className="list-disc text-left text-gray-700 space-y-3 max-w-3xl mx-auto pl-6">
          <li><strong>Kho sách khổng lồ:</strong> Hàng ngàn đầu sách thuộc nhiều thể loại phong phú.</li>
          <li><strong>Sách chính hãng:</strong> Đảm bảo chất lượng in ấn, giấy tốt, bền đẹp.</li>
          <li><strong>Giá cả hợp lý:</strong> Thường xuyên có chương trình khuyến mãi, giảm giá hấp dẫn.</li>
          <li><strong>Dịch vụ chuyên nghiệp:</strong> Giao hàng nhanh chóng, hỗ trợ khách hàng tận tình.</li>
        </ul>

        {/* CTA */}
        <div className="mt-10">
          <a
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all text-lg font-semibold"
          >
            🔎 Khám phá ngay
          </a>
        </div>
      </div>
    </div>
  );
}
