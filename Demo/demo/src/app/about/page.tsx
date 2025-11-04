"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function About() {
  return (
    <div
      style={{
        background: "linear-gradient(115deg,#eef6ff 50%,#fff6e1 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "60px 0",
      }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
        >
          {/* Tiêu đề */}
          <div className="text-center mb-5">
            <h1 className="fw-bold display-4 text-dark" style={{letterSpacing: ".01em"}}>
              Chào mừng đến với{" "}
              <span className="text-primary" style={{textShadow: "0 2px 18px #cbeeff74"}}>
                Nhà Sách Pibook
              </span>
            </h1>
            <p className="text-muted fs-5 mt-3 mx-auto" style={{ maxWidth: "760px", lineHeight: 1.65, fontSize: "1.22rem" }}>
              <strong className="text-primary-emphasis">Pibook</strong> là nơi lưu giữ tri thức và cảm hứng đọc sách, mang đến hàng nghìn đầu sách chất lượng cao cho cộng đồng yêu đọc.<br />
              Sứ mệnh của chúng tôi là{" "}
              <span className="fw-semibold text-warning">lan tỏa tri thức & kết nối đam mê</span>
              {" "}— đồng hành cùng bạn trên hành trình phát triển bản thân.
            </p>
          </div>

          {/* Banner lớn */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <div className="rounded-4 shadow-lg p-0 overflow-hidden mx-auto" style={{
              maxHeight: 370,
              maxWidth: 990,
              border: "5px solid #fffbe9",
              boxShadow: "0 6px 42px #d8e7ff13"
            }}>
              <img
                src="/image/b9690ac7ec4b7c94d44d9e519b6c30e7.jpg"
                alt="Banner Nhà sách Pibook"
                className="img-fluid w-100"
                style={{objectFit: "cover", height: "360px", borderRadius: "2.1rem"}}
              />
            </div>
          </motion.div>

          {/* Sứ mệnh */}
          <Row className="align-items-center mb-5">
            <Col xs={12} md={4} className="mb-4 mb-md-0 text-center">
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.07 }}
                className="d-inline-flex flex-column gap-2 align-items-center"
              >
                <div
                  className="bg-white shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                  style={{width: 94, height: 94, marginBottom: 8, border: "3.5px solid #ffeab6"}}
                >
                  <BookOpen color="#29b492" size={55} />
                </div>
                <div className="fw-bold fs-5 text-success-emphasis" style={{letterSpacing: ".03em"}}>
                  Sứ mệnh Pibook
                </div>
              </motion.div>
            </Col>
            <Col xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.07 }}
              >
                <Card className="border-0 shadow rounded-4 p-3" style={{background: "linear-gradient(100deg,#fffbe7 70%,#e7f2ff 100%)"}}>
                  <Card.Body>
                    <p className="fs-5 text-secondary mb-0" style={{lineHeight: 1.7}}>
                      <strong className="text-dark">Xây dựng cộng đồng yêu sách</strong> — nơi ai cũng tìm thấy cảm hứng, tri thức mới và động lực sáng tạo.<br />
                      Chúng tôi cam kết mang lại <span className="text-warning fw-semibold">sản phẩm chất lượng</span>,{" "}
                      <span className="text-primary fw-semibold">dịch vụ tận tâm</span> và{" "}
                      <span className="text-success fw-semibold">trải nghiệm mua sắm tuyệt vời nhất</span>.
                    </p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Lý do nên chọn Pibook */}
          <div className="text-center mb-5">
            <h2
              className="fw-bolder mb-4"
              style={{
                color: "#085b9a",
                letterSpacing: ".02em",
                textShadow: "0 2px 13px #b1cfff35"
              }}
            >
              Vì sao nên chọn Pibook?
            </h2>
          </div>
          <Row className="g-4 justify-content-center">
            {[
              {
                title: "Kho sách phong phú",
                desc: "Hơn 5.000+ đầu sách đa thể loại: thiếu nhi, kỹ năng, kinh tế, tiểu thuyết...",
                bg: "linear-gradient(120deg,#fdf6e3,#f3f9ff 90%)",
                border: "#ffe0b2"
              },
              {
                title: "Chất lượng & Uy tín",
                desc: "Cam kết sách chính hãng, kiểm duyệt kỹ càng từng bìa sách, trang giấy trước khi tới tay bạn.",
                bg: "linear-gradient(98deg,#f7fedb 60%,#fcf4e9 100%)",
                border: "#daf9c7"
              },
              {
                title: "Giá ưu đãi hợp lý",
                desc: "Khuyến mãi thường xuyên, freeship cho nhiều đơn hàng, tích điểm nhận voucher.",
                bg: "linear-gradient(130deg,#fffedf 70%,#ffe7f2 100%)",
                border: "#ffe5ec"
              },
              {
                title: "Giao hàng tận nơi nhanh",
                desc: "Hỗ trợ đổi trả - giao nhanh toàn quốc, đóng gói đẹp, an toàn.",
                bg: "linear-gradient(138deg,#edfff4 70%,#e7f5fc 100%)",
                border: "#cdf3e9"
              }
            ].map((item, i) => (
              <Col md={6} lg={3} key={i}>
                <Card
                  className="border-0 shadow-md h-100 rounded-4 p-3 custom-blur-card"
                  style={{
                    background: item.bg,
                    borderLeft: `6px solid ${item.border}`,
                    boxShadow: "0 6px 28px #6eaaf61d,0 2px 7px #ffe08a16"
                  }}
                >
                  <Card.Body>
                    <h5 className="fw-bold mb-2 text-dark" style={{
                      fontSize: "1.16rem",
                      letterSpacing: ".01em"
                    }}>{item.title}</h5>
                    <p className="text-secondary mb-0" style={{fontSize: ".99rem", lineHeight: 1.6}}>{item.desc}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {/* CTA */}
          <motion.div
            className="text-center mt-5"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              href="/products"
              variant="warning"
              size="lg"
              className="px-5 py-3 rounded-4 shadow fw-bold"
              style={{
                fontSize: "1.12rem",
                letterSpacing: ".005em",
                background: "linear-gradient(87deg, #ffc21c 75%, #ffe8aa 100%)",
                color: "#574208",
                border: "none",
                boxShadow: "0 4px 18px #ffda8850, 0 2px 9px #fffbe0ba"
              }}
            >
              Khám phá sách ngay →
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
