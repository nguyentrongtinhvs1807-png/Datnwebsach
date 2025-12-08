const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 mt-5 small">
      <div className="container">
        {/* --- Logo + 4 cột nội dung --- */}
        <div className="d-flex flex-wrap align-items-start">
          {/* Logo cột đầu */}
          <div className="mb-3" style={{ flex: "0 0 200px" }}>
            <img
              src="/image/logo chinh.jpg"
              alt="Pibook"
              style={{ height: "150px", width: "auto", objectFit: "contain" }}
              className="mb-2"
            />
            <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
              Pibook – Đồng hành cùng bạn trên hành trình tri thức.
            </p>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div className="mb-3" style={{ flex: "0 0 250px", marginLeft: "20px" }}>
            <h6 className="fw-bold text-uppercase text-warning">Hỗ trợ khách hàng</h6>
            <p className="mb-1">Sản phẩm & Đơn hàng: 0857 226 757</p>
            <p className="mb-1">Kỹ thuật & Bảo hành: 0941 807 184</p>
            <p className="mb-1">(028) 3820 7153 (giờ hành chính)</p>
            <p className="mb-1">Email: nguyentrongtinhvs1807@gmail.com</p>
            <p className="mb-0">180 Nguyễn Tất Thành, Quận 4, TPHCM</p>
          </div>

          {/* Trợ giúp */}
          <div className="mb-3" style={{ flex: "0 0 250px", marginLeft: "20px" }}>
            <h6 className="fw-bold text-uppercase text-warning">Trợ giúp</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Hướng dẫn mua hàng</a></li>
              <li><a href="checkout" className="text-light text-decoration-none">Phương thức thanh toán</a></li>
              <li><a href="#" className="text-light text-decoration-none">Phương thức vận chuyển</a></li>
              <li><a href="#" className="text-light text-decoration-none">Chính sách đổi - trả</a></li>
              <li><a href="#" className="text-light text-decoration-none">Chính sách bồi hoàn</a></li>
              <li><a href="#" className="text-light text-decoration-none">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Tài khoản */}
          <div className="mb-3" style={{ flex: "0 0 250px", marginLeft: "20px" }}>
            <h6 className="fw-bold text-uppercase text-warning">Tài khoản của bạn</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Cập nhật tài khoản</a></li>
              <li><a href="#" className="text-light text-decoration-none">Giỏ hàng</a></li>
              <li><a href="#" className="text-light text-decoration-none">Lịch sử giao dịch</a></li>
              <li><a href="#" className="text-light text-decoration-none">Sản phẩm yêu thích</a></li>
             <li><a href="orders" className="text-light text-decoration-none">Kiểm tra đơn hàng</a></li>
            </ul>
          </div>

          {/* Về Pibook */}
          <div className="mb-3" style={{ flex: "0 0 250px", marginLeft: "20px" }}>
            <h6 className="fw-bold text-uppercase text-warning">Về Pibook</h6>
            <ul className="list-unstyled">
              <li><a href="about" className="text-light text-decoration-none">Giới thiệu</a></li>
              <li><a href="#" className="text-light text-decoration-none">Facebook</a></li>
              <li><a href="contact" className="text-light text-decoration-none">Liên hệ</a></li>
              <li><a href="#" className="text-light text-decoration-none">Đặt hàng theo yêu cầu</a></li>
              <li><a href="policy" className="text-light text-decoration-none">Chính sách khách hàng</a></li>
              <li><a href="#" className="text-light text-decoration-none">Blog sách hay</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary mt-3" />

        {/* --- Dòng cuối cùng --- */}
        <div className="text-center text-secondary py-3" style={{ fontSize: "0.9rem" }}>
          © {new Date().getFullYear()}{" "}
          <span className="text-warning fw-semibold">Pibook.vn</span> — Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;