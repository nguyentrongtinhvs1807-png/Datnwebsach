"use client";

import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Policy() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  return (
    <div className="py-5 min-vh-100 d-flex align-items-center justify-content-center policy-bg">
      <div className="container">
        {/* Tiêu đề chính */}
        <h1 className="text-center fw-bold mb-5 text-gradient display-5">
          <i className="bi bi-shield-check me-2"></i> Chính Sách{" "}
          <span className="text-danger"></span>
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
                  <h2 className="fw-bold text-dark mb-3 h4 d-flex align-items-center">
                    <span className="icon-circle bg-warning bg-opacity-25 me-2">
                      <i className="bi bi-truck text-warning fs-4"></i>
                    </span>
                    Vận Chuyển
                  </h2>
                  <p className="text-muted mb-0">
                  Pibook cam kết giao hàng trong{" "}
                    <span className="fw-bold text-dark">2-5 ngày làm việc</span>.
                    Các khu vực xa trung tâm có thể mất thêm thời gian.
                  </p>
                </div>

                {/* Chính sách đổi trả */}
                <div className="mb-5 policy-box border-start border-4 border-success">
                  <h2 className="fw-bold text-dark mb-3 h4 d-flex align-items-center">
                    <span className="icon-circle bg-success bg-opacity-25 me-2">
                      <i className="bi bi-arrow-repeat text-success fs-4"></i>
                    </span>
                    Đổi Trả
                  </h2>
                  <ul className="text-muted ps-3 mb-0">
                    <li>
                      Đổi trả trong vòng{" "}
                      <span className="fw-bold text-dark">7 ngày</span> kể từ
                      ngày nhận hàng.
                    </li>
                    <li>
                      Sản phẩm phải{" "}
                      <span className="fw-bold text-dark">
                        nguyên vẹn, chưa qua sử dụng
                      </span>
                      .
                    </li>
                    <li>Khách hàng chịu phí vận chuyển khi đổi hàng.</li>
                  </ul>
                </div>

                {/* Chính sách bảo mật */}
                <div className="policy-box border-start border-4 border-danger">
                  <h2 className="fw-bold text-dark mb-3 h4 d-flex align-items-center">
                    <span className="icon-circle bg-danger bg-opacity-25 me-2">
                      <i className="bi bi-shield-lock-fill text-danger fs-4"></i>
                    </span>
                    Bảo Mật
                  </h2>
                  <p className="text-muted mb-0">
                  Pibook cam kết{" "}
                    <span className="fw-bold text-dark">
                      bảo vệ thông tin cá nhân
                    </span>{" "}
                    của khách hàng và không chia sẻ dữ liệu với bên thứ ba.
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
          background: linear-gradient(135deg, #f0f7ff, #fffafc);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-radius: 20px;
        }
        .text-gradient {
          background: linear-gradient(90deg, #007bff, #6610f2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .opacity-0 {
          opacity: 0;
          transform: translateY(20px);
        }
        .policy-box {
          padding: 20px 15px;
          border-radius: 12px;
          background: #fff;
          transition: all 0.3s ease;
        }
        .policy-box:hover {
          background: #f8f9fa;
          transform: translateX(4px);
        }
        .icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
        }

        /* Responsive */
        @media (max-width: 768px) {
          h1 {
            font-size: 1.8rem;
          }
          .policy-box {
            padding: 16px 12px;
          }
          .policy-box h2 {
            font-size: 1.1rem;
          }
          .policy-box p,
          .policy-box li {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
