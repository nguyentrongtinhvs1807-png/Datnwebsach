"use client";

import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Policy() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 150);
  }, []);

  return (
    <div className="py-5 min-vh-100 d-flex align-items-center justify-content-center policy-bg">
      <div className="container">
        {/* Tiêu đề chính */}
        <h1
          className="text-center fw-bold mb-5 policy-gradient-heading display-5"
          style={{
            letterSpacing: ".025em",
            textShadow: "0 6px 26px #3b16fe1a"
          }}
        >
          Chính Sách Cửa Hàng
        </h1>

        {/* Nội dung fade-in */}
        <div
          className={`row justify-content-center ${
            isVisible ? "fade-in" : "opacity-0"
          }`}
        >
          <div className="col-lg-9 col-md-11">
            <div className="card glass-card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                {/* Chính sách vận chuyển */}
                <div className="mb-5 policy-box border-start border-4 border-warning">
                  <h2 className="fw-bold text-dark mb-3 h4">
                    Vận chuyển đơn hàng
                  </h2>
                  <div className="mb-2 mt-3">
                    <div className="progress" style={{height: 8, background: "#fff7c8"}}>
                      <div className="progress-bar bg-warning" role="progressbar" style={{width: "80%"}}></div>
                    </div>
                  </div>
                  <p className="text-muted mb-0" style={{fontSize: "1.08rem"}}>
                    Pibook cam kết giao hàng trong&nbsp;
                    <span className="fw-bold text-dark">2-5 ngày làm việc</span>.
                    <br />
                    Các khu vực xa trung tâm có thể mất thêm thời gian.
                  </p>
                </div>

                {/* Chính sách đổi trả */}
                <div className="mb-5 policy-box border-start border-4 border-success">
                  <h2 className="fw-bold text-dark mb-3 h4">
                    Đổi trả & hoàn tiền
                  </h2>
                  <ul className="policy-list text-muted ps-1 ps-md-3 mb-0">
                    <li>
                      Đổi trả trong vòng&nbsp;
                      <span className="fw-bold text-dark">7 ngày</span> kể từ ngày nhận hàng.
                    </li>
                    <li>
                      Sản phẩm cần đảm bảo{" "}
                      <span className="fw-bold text-dark">
                        nguyên vẹn, chưa qua sử dụng
                      </span>
                      .
                    </li>
                    <li>
                      Vận chuyển đổi/trả: khách hàng chịu phí, trừ khi sản phẩm bị lỗi/khiếm khuyết từ nhà sách.
                    </li>
                  </ul>
                </div>

                {/* Chính sách bảo mật */}
                <div className="policy-box border-start border-4 border-danger">
                  <h2 className="fw-bold text-dark mb-3 h4">
                    An toàn & bảo mật
                  </h2>
                  <div className="mb-2 mt-1" style={{height: 18}}>
                    {/* Chỉ một icon bảo mật lớn duy nhất cho toàn mục này */}
                    <span className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                          style={{width:32, height:32}}>
                      <i className="bi bi-shield-lock-fill text-danger fs-5"></i>
                    </span>
                  </div>
                  <p className="text-muted mb-0" style={{fontSize: "1.07rem"}}>
                    Pibook tuyệt đối&nbsp;
                    <span className="fw-bold text-dark">
                      bảo vệ an toàn thông tin khách hàng
                    </span>
                    . Không chia sẻ dữ liệu cá nhân với bên thứ ba. Thông tin mua hàng chỉ dùng cho việc xử lý và chăm sóc khách hàng tốt nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .policy-bg {
          background: linear-gradient(112deg, #f0f8ff 55%, #fff8ef 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.67);
          backdrop-filter: blur(10px);
          border-radius: 22px;
          box-shadow: 0 6px 42px #d6d8ff18, 0 1px 7px #ffd08d50;
        }
        .policy-gradient-heading {
          background: linear-gradient(93deg, #2e82ff, #fd8a08 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.85s cubic-bezier(.24,.94,.34,1), transform 0.85s cubic-bezier(.24,.94,.34,1);
        }
        .opacity-0 {
          opacity: 0;
          transform: translateY(28px);
        }
        .policy-box {
          padding: 28px 18px 22px 22px;
          border-radius: 1.08rem;
          background: linear-gradient(95deg, #fcfcfd 80%, #f8effd11 100%);
          box-shadow: 0 2px 13px #f7be8820;
          margin-bottom: 2.6rem;
          transition: all 0.35s cubic-bezier(.32,1.4,.42,1);
        }
        .policy-box:hover {
          background: #f9fafb;
          box-shadow: 0 4px 24px #ffebbb1a, 0 2px 7px #ffe9db10, 0 1px 10px #eff5fd07;
          transform: scale(1.012) translateX(5px);
        }

        .policy-list {
          font-size: 1.06rem;
          line-height: 1.7;
        }
        .policy-list li {
          margin-bottom: 0.5em;
        }

        /* Responsive */
        @media (max-width: 768px) {
          h1,
          .policy-gradient-heading {
            font-size: 1.65rem !important;
          }
          .policy-box {
            padding: 15px 8px 12px 12px;
            margin-bottom: 1.3rem;
          }
          .policy-box h2 {
            font-size: 1.08rem !important;
            margin-bottom: 0.89rem !important;
          }
          .policy-list,
          .policy-box p {
            font-size: 0.97rem !important;
          }
        }
      `}</style>
    </div>
  );
}
