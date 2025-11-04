const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 mt-5 small">
      <div className="container">
        {/* --- Đăng ký nhận bản tin --- */}
        <div className="text-center mb-4">
          <img
            src="/image/Grace.png"
            alt="Pibook"
            className="mx-auto my-4"
            style={{ height: "60px", width: "auto", objectFit: "contain" }}
          />

          <h6 className="fw-bold text-warning">Đăng ký nhận bản tin</h6>
          <p className="text-secondary">
            Đừng bỏ lỡ những ưu đãi độc quyền dành riêng cho bạn
          </p>
          <form className="row justify-content-center g-2">
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Tên của bạn" />
            </div>
            <div className="col-md-4">
              <input type="email" className="form-control" placeholder="Email của bạn" />
            </div>
            <div className="col-md-3 d-flex justify-content-center flex-wrap">
              {["NAM", "NỮ"].map((g) => (
                <button key={g} type="button" className="btn btn-warning mx-1 text-dark fw-bold">
                  {g}
                </button>
              ))}
            </div>
          </form>
        </div>

        <hr className="border-secondary" />

        {/* --- Phần 4 cột --- */}
        <div className="row">
          {/* Hỗ trợ khách hàng */}
          <div className="col-md-3 mb-3">
            <h6 className="fw-bold text-uppercase text-warning">Hỗ trợ khách hàng</h6>
            <p className="mb-1">Sản phẩm & Đơn hàng: 0857 226 757</p>
            <p className="mb-1">Kỹ thuật & Bảo hành: 0941 807 184</p>
            <p className="mb-1">(028) 3820 7153 (giờ hành chính)</p>
            <p className="mb-1">Email: nguyentrongtinhvs1807@gmail.com</p>
            <p className="mb-0">180 Nguyễn Tất Thành, Quận 4, TPHCM</p>
          </div>

          {/* Trợ giúp */}
          <div className="col-md-3 mb-3">
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
          <div className="col-md-3 mb-3">
            <h6 className="fw-bold text-uppercase text-warning">Tài khoản của bạn</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Cập nhật tài khoản</a></li>
              <li><a href="#" className="text-light text-decoration-none">Giỏ hàng</a></li>
              <li><a href="#" className="text-light text-decoration-none">Lịch sử giao dịch</a></li>
              <li><a href="#" className="text-light text-decoration-none">Sản phẩm yêu thích</a></li>
              <li><a href="orders" className="text-light text-decoration-none">Kiểm tra đơn hàng</a></li>
            </ul>
          </div>

          {/* Luonvuituoi */}
          <div className="col-md-3 mb-3">
            cậy để bạn <strong>mua sách trực tuyến</strong>,  còn có quà
            <h6 className="fw-bold text-uppercase text-warning">Pibook</h6>
            <ul className="list-unstyled">
              <li><a href="about" className="text-light text-decoration-none">Giới thiệu</a></li>
              <li><a href="#" className="text-light text-decoration-none">Facebook</a></li>
              <li><a href="contact" className="text-light text-decoration-none">Liên hệ</a></li>
              <li><a href="#" className="text-light text-decoration-none">Đặt hàng theo yêu cầu</a></li>
              <li><a href="policy" className="text-light text-decoration-none">Chính sách khách hàng</a></li>
              <li><a href="#" className="text-light text-decoration-none">Blog thời trang</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary" />

        {/* --- Thanh cuối --- */}
        <div className="d-flex justify-content-between align-items-center pb-3 flex-wrap">
          <div className="mb-2 d-flex align-items-center flex-wrap">
            <span className="me-2">Chấp nhận thanh toán:</span>
            <div className="d-flex flex-wrap">
              {[
                "https://vudigital.co/wp-content/uploads/2022/04/8.webp",
                "https://vudigital.co/wp-content/uploads/2022/12/logo-mastercard-da-thay-doi-nhu-the-nao-trong-hon-50-nam-3.webp",
                "https://png.pngtree.com/thumb_back/fh260/background/20220821/pngtree-payment-icon-salary-success-cash-photo-image_19623380.jpg",
                "https://cdn.tgdd.vn/2020/03/GameApp/Untitled-2-200x200.jpg",
                "https://binhminhdigital.com/storedata/images/pagedata/Thumbnail%20thanh%20toan%20qua%20ngan%20hang.jpg"
              ].map((src, i) => (
                <img key={i} src={src} alt="payment" style={{ height: "28px", objectFit: "contain" }} className="img-fluid me-2" />
              ))}
            </div>
          </div>

          <div>
            <span>Kết nối: </span>
            <a href="#" className="ms-2 text-light"><i className="bi bi-facebook fs-5"></i></a>
            <a href="#" className="ms-2 text-light"><i className="bi bi-youtube fs-5"></i></a>
            <a href="#" className="ms-2 text-light"><i className="bi bi-tiktok fs-5"></i></a>
            <a href="#" className="ms-2 text-light"><i className="bi bi-instagram fs-5"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
