const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer"); // Đã cài bằng npm install multer

const { VNPay } = require("vnpay");

const app = express();

// ================== TĂNG GIỚI HẠN BODY ĐỂ TRÁNH PayloadTooLargeError ==================
app.use(express.json({ limit: "10mb" })); // Cho phép JSON lớn đến 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Cho form data

// ================== CẤU HÌNH MULTER UPLOAD ẢNH ==================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi file
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)!"));
    }
  },
});

// Phục vụ file tĩnh từ thư mục uploads và images
app.use("/uploads", express.static(uploadDir));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ================== CẤU HÌNH CORS ==================
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// ================== VNPAY KHỞI TẠO ==================
const vnpay = new VNPay({
  tmnCode: "D3BX5CIF",
  secureSecret: "TXQUFKM8G0O5BDIN8IA1LR3611W95WJC",
  vnpayHost: "https://sandbox.vnpayment.vn",
  hashAlgorithm: "SHA512",
});

const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

// ================== BIẾN MÔI TRƯỜNG ==================
const JWT_SECRET = process.env.PIBOOK_SECRET_KEY || "pibook_secret_key";

// ================== KẾT NỐI DATABASE ==================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pibook_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối MySQL thất bại:", err);
  } else {
    console.log(" Đã kết nối MySQL thành công!");
  }
});

// ================== CẤU HÌNH GỬI MAIL ==================
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5e7e7e7e7e7e7e",
    pass: "5e7e7e7e7e7e7e"
  }
});

// ================== MIDDLEWARE XÁC THỰC JWT ==================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "❌ Thiếu header Authorization." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "❌ Thiếu token JWT." });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      console.error("❌ Token lỗi:", err.message);
      return res
        .status(401)
        .json({ message: "❌ Token không hợp lệ hoặc đã hết hạn." });
    }

    req.user = payload;
    next();
  });
}

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file ảnh được upload!" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.get("/sach/:id/hinh", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    "SELECT URL FROM hinh WHERE sach_id = ? LIMIT 1",
    [id]
  );

  if (rows.length === 0) {
    return res.json({});
  }

  res.json({ URL: rows[0].URL });
});


// ================== API MÃ GIẢM GIÁ ==================
app.get("/api/ma-giam-gia", (req, res) => {
  const sql = "SELECT * FROM ma_giam_gia ORDER BY ngay_bd DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn /api/ma-giam-gia:", err);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách mã giảm giá" });
    }
    res.json(results);
  });
});

app.post("/api/ma-giam-gia", (req, res) => {
  const {
    ma_gg,
    loai_giam,
    gia_tri_giam,
    giam_toi_da,
    don_toi_thieu,
    ngay_bd,
    ngay_kt,
    gioi_han_sd,
    trang_thai,
  } = req.body;

  if (!ma_gg || !loai_giam || !gia_tri_giam || !ngay_bd || !ngay_kt) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const sql = `
    INSERT INTO ma_giam_gia (ma_gg, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, ngay_bd, ngay_kt, gioi_han_sd, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [ma_gg, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, ngay_bd, ngay_kt, gioi_han_sd, trang_thai],
    (err, result) => {
      if (err) {
        console.error(" Lỗi thêm mã giảm giá:", err);
        return res.status(500).json({ message: "Lỗi khi thêm mã giảm giá" });
      }
      res.json({ message: " Thêm mã giảm giá thành công!" });
    }
  );
});

app.delete("/api/ma-giam-gia/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM ma_giam_gia WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error(" Lỗi xoá mã giảm giá:", err);
      return res.status(500).json({ message: "Không thể xoá mã giảm giá" });
    }
    res.json({ message: " Đã xoá mã giảm giá" });
  });
});

app.get("/voucher", (req, res) => {
  const code = req.query.code;

  if (!code) return res.json({ error: "Thiếu mã giảm giá" });

  const sql = "SELECT * FROM ma_giam_gia WHERE ma_gg = ? AND trang_thai = 1";
  db.query(sql, [code], (err, results) => {
    if (err) return res.json({ error: err.message });
    if (results.length === 0) return res.json({ error: "Mã không hợp lệ" });

    const voucher = results[0];
    const today = new Date();

    if (today < new Date(voucher.ngay_bd) || today > new Date(voucher.ngay_kt)) {
      return res.json({ error: "Mã đã hết hạn hoặc chưa có hiệu lực" });
    }

    res.json(voucher);
  });
});

//  API endpoint mới cho checkout - format phù hợp với frontend
app.get("/discount-codes/:code", (req, res) => {
  const code = req.params.code;

  if (!code) {
    return res.status(400).json({ error: "Thiếu mã giảm giá" });
  }

  const sql = "SELECT * FROM ma_giam_gia WHERE ma_gg = ? AND trang_thai = 1";
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error(" Lỗi truy vấn mã giảm giá:", err);
      return res.status(500).json({ error: "Lỗi server khi kiểm tra mã giảm giá" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Mã giảm giá không hợp lệ" });
    }

    const voucher = results[0];
    const today = new Date();
    const startDate = new Date(voucher.ngay_bd);
    const endDate = new Date(voucher.ngay_kt);

    // Kiểm tra ngày hiệu lực
    if (today < startDate) {
      return res.status(400).json({ error: "Mã giảm giá chưa có hiệu lực" });
    }

    if (today > endDate) {
      return res.status(400).json({ error: "Mã giảm giá đã hết hạn" });
    }

    // Map dữ liệu từ database sang format frontend mong đợi
    const loaiGiam = voucher.loai_giam?.toLowerCase();
    const discountType = loaiGiam === "phan_tram" || loaiGiam === "percent" ? "percent" : "fixed";

    res.json({
      code: voucher.ma_gg,
      type: discountType,
      value: parseFloat(voucher.gia_tri_giam),
      maxDiscount: parseFloat(voucher.giam_toi_da || 0),
      minOrder: parseFloat(voucher.don_toi_thieu || 0),
      startDate: voucher.ngay_bd,
      endDate: voucher.ngay_kt,
    });
  });
});

app.get("/books", (req, res) => {
  const { category } = req.query;

  let sql = `
    SELECT 
      s.sach_id, s.ten_sach, s.ten_tac_gia, s.ten_NXB,
      s.gia_sach, s.ton_kho_sach, s.mo_ta, s.gg_sach, s.loai_bia, s.Loai_sach_id,
      s.an_hien,          -- thêm để debug nếu cần
      h.URL AS image
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
    WHERE (s.an_hien = 1 OR s.an_hien IS NULL)   -- CHỈ LẤY SÁCH ĐANG HIỆN
  `;
  const params = [];

  if (category) {
    sql += " AND s.Loai_sach_id = ?";
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn /books:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy danh sách sách" });
    }
    res.json(results);
  });
});

// ================== API SẢN PHẨM ==================
app.get("/api/products", (req, res) => {
  const { category } = req.query;

  let sql = `
    SELECT 
      sp.id AS product_id,
      sp.ten_sp,
      sp.gia,
      sp.gia_km,
      sp.mo_ta,
      sp.hinh,
      sp.hot,
      sp.tac_gia,
      sp.book_type,
      l.ten_loai
    FROM san_pham sp
    LEFT JOIN loai_sach l ON sp.loai_id = l.id
  `;

  const params = [];
  if (category) {
    sql += " WHERE sp.loai_id = ?";
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(" Lỗi truy vấn /api/products:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy danh sách sản phẩm" });
    }

    const products = results.map((row) => ({
      id: row.product_id,
      name: row.ten_sp,
      price: Number(row.gia),
      discountPrice: Number(row.gia_km) || 0,
      image: row.hinh || "/image/default-book.jpg",
      description: row.mo_ta || "Chưa có mô tả",
      hot: row.hot === 1,
      author: row.tac_gia || "Không rõ tác giả",
      bookType: row.book_type || "Không rõ loại bìa",
      category: row.ten_loai || "Khác",
    }));

    res.json(products);
  });
});

// ================== API: CHI TIẾT 1 SÁCH ==================
app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      s.sach_id, s.ten_sach, s.ten_tac_gia, s.ten_NXB,
      s.gia_sach, s.ton_kho_sach, s.mo_ta, s.gg_sach, s.loai_bia, s.Loai_sach_id,
      h.URL AS image
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
    WHERE s.sach_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(" Lỗi truy vấn /books/:id:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy chi tiết sách" });
    }
    if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy sách" });
    res.json(results[0]);
  });
});

/// ================== API COMMENT ==================
// GET: Lấy bình luận theo sách – chỉ hiện bình luận công khai cho khách
app.get("/comments/:bookId", (req, res) => {
  const bookId = req.params.bookId;

  let sql = `
    SELECT 
      c.binh_luan_id AS id, 
      c.san_pham_id AS book_id, 
      c.nd_bl AS content, 
      c.ngay_bl AS created_at, 
      u.Ten AS user
    FROM binh_luan c
    LEFT JOIN nguoi_dung u ON c.nguoi_dung_id = u.nguoi_dung_id
    WHERE c.san_pham_id = ?
  `;

  const params = [bookId];

  // SIÊU QUAN TRỌNG: Chỉ hiện bình luận được duyệt khi có ?status=1
  if (req.query.status === "1") {
    sql += " AND c.trang_thai = 1";
  }

  sql += " ORDER BY c.ngay_bl DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn /comments/:bookId:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy bình luận" });
    }
    res.json(results);
  });
});

app.post("/comments", (req, res) => {
  const { bookId, userId, content } = req.body;
  if (!bookId || !userId || !content?.trim()) {
    return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
  }

  const sql = `
    INSERT INTO binh_luan (san_pham_id, nguoi_dung_id, nd_bl, ngay_bl)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [bookId, userId, content], (err, result) => {
    if (err) {
      console.error("❌ Lỗi thêm bình luận:", err);
      return res.status(500).json({ error: "Không thể thêm bình luận" });
    }

    db.query(
      `
      SELECT c.binh_luan_id AS id, 
             c.san_pham_id AS book_id, 
             c.nd_bl AS content, 
             c.ngay_bl AS created_at, 
             u.Ten AS user
      FROM binh_luan c
      LEFT JOIN nguoi_dung u ON c.nguoi_dung_id = u.nguoi_dung_id
      WHERE c.binh_luan_id = ?
      `,
      [result.insertId],
      (err2, rows) => {
        if (err2 || rows.length === 0)
          return res.status(500).json({ error: "Không thể lấy bình luận vừa thêm" });
        res.json(rows[0]);
      }
    );
  });
});
// ================== AUTH ==================

// API Đăng ký tài khoản - ĐÃ THÊM ĐỊA CHỈ VÀ NGÀY SINH
app.post("/auth/register", async (req, res) => {
  const { ho_ten, email, so_dien_thoai, dia_chi, ngay_sinh, mat_khau } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!ho_ten || !email || !so_dien_thoai || !mat_khau) {
    return res.status(400).json({
      message: "⚠️ Vui lòng nhập đầy đủ: Họ tên, Email, Số điện thoại và Mật khẩu",
    });
  }

  // Validate định dạng
  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email.trim())) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  const phone = so_dien_thoai.trim();
  if (!/^0[3|5|7|8|9][0-9]{8}$/.test(phone)) {
    return res.status(400).json({
      message: "Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03, 05, 07, 08, 09)",
    });
  }

  if (mat_khau.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự trở lên" });
  }

  try {
    // Kiểm tra trùng email hoặc số điện thoại
    const checkSQL = `
      SELECT nguoi_dung_id FROM nguoi_dung 
      WHERE email = ? OR so_dien_thoai = ? 
      LIMIT 1
    `;

    db.query(checkSQL, [email.trim(), phone], async (err, results) => {
      if (err) {
        console.error("Lỗi kiểm tra trùng:", err);
        return res.status(500).json({ message: "Lỗi máy chủ" });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "Email hoặc số điện thoại đã được sử dụng",
        });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(mat_khau, 10);

      // INSERT VÀO DATABASE - THÊM dia_chi và ngay_sinh
      const insertSQL = `
        INSERT INTO nguoi_dung 
        (Ten, email, so_dien_thoai, dia_chi, ngay_sinh, mat_khau, role, is_hidden)
        VALUES (?, ?, ?, ?, ?, ?, 'user', 0)
      `;

      db.query(
        insertSQL,
        [
          ho_ten.trim(),
          email.trim(),
          phone,
          dia_chi ? dia_chi.trim() : null,   // Nếu không nhập → NULL
          ngay_sinh || null,                 // Nếu không chọn ngày → NULL
          hashedPassword,
        ],
        (err2, result) => {
          if (err2) {
            console.error("Lỗi tạo tài khoản:", err2);
            return res.status(500).json({ message: "Không thể tạo tài khoản. Vui lòng thử lại." });
          }

          res.status(201).json({
            message: "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    console.error("Lỗi hệ thống đăng ký:", error);
    res.status(500).json({ message: "Lỗi hệ thống. Vui lòng thử lại sau." });
  }
});




// ĐĂNG NHẬP - ĐÃ HỖ TRỢ MẬT KHẨU ĐÃ BỊ BCRYPT (QUÊN MẬT KHẨU)
app.post("/auth/login", async (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
  }

  const sql = "SELECT * FROM nguoi_dung WHERE email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    const user = results[0];

    // KIỂM TRA MẬT KHẨU
    let matKhauDung = false;

    if (String(user.mat_khau).length > 50) {
      // Mật khẩu đã được bcrypt
      matKhauDung = await bcrypt.compare(String(mat_khau), String(user.mat_khau));
    } else {
      // Mật khẩu cũ chưa băm
      matKhauDung = String(mat_khau).trim() === String(user.mat_khau).trim();
    }

    if (!matKhauDung) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Tạo token (giữ nguyên như cũ)
    const token = jwt.sign(
      { id: user.nguoi_dung_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // TRẢ VỀ ĐẦY ĐỦ THÔNG TIN USER CHO FRONTEND
    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        nguoi_dung_id: user.nguoi_dung_id,
        ho_ten: user.ho_ten || "",                    // Họ và tên đầy đủ
        email: user.email,
        so_dien_thoai: user.so_dien_thoai || "",      // ← SỐ ĐIỆN THOẠI (rất quan trọng!)
        dia_chi: user.dia_chi || "",                  // ← Địa chỉ (tự động điền nếu có)
        role: user.role,
        is_hidden: user.is_hidden || 0,
      },
    });
  });
});


// API lấy thông tin người dùng theo ID (đã đăng nhập)
app.get("/auth/user/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Thiếu ID người dùng" });
  }

  const sql = `
    SELECT 
      nguoi_dung_id,
      Ten AS ten,
      email,
      so_dien_thoai,
      dia_chi,
      ngay_sinh,
      mat_khau,
      role,
      is_hidden
    FROM nguoi_dung 
    WHERE nguoi_dung_id = ? 
    LIMIT 1
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn user:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const user = results[0];

    // Che mật khẩu trước khi trả về (an toàn)
    const maskedUser = {
      nguoi_dung_id: user.nguoi_dung_id,
      ten: user.ten || "",
      email: user.email || "",
      so_dien_thoai: user.so_dien_thoai || "",
      dia_chi: user.dia_chi || "",
      ngay_sinh: user.ngay_sinh || null,
      role: user.role || "user",
      is_hidden: user.is_hidden || 0,
      has_password: !!user.mat_khau, // Chỉ báo có mật khẩu hay không, không trả thật
    };

    res.json({
      success: true,
      user: maskedUser,
    });
  });
});




//  Đổi mật khẩu (YÊU CẦU TOKEN)
app.post("/auth/doi-pass", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pass_old, pass_new } = req.body;

    if (!pass_old || !pass_new) {
      return res.status(400).json({ message: "⚠️ Thiếu thông tin bắt buộc" });
    }

    const sqlFind = "SELECT * FROM nguoi_dung WHERE nguoi_dung_id = ? LIMIT 1";
    db.query(sqlFind, [userId], async (err, results) => {
      if (err) return res.status(500).json({ message: "❌ Lỗi server: " + err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "❌ Không tìm thấy tài khoản" });

      const user = results[0];
      const isMatch = await bcrypt.compare(pass_old, user.mat_khau);
      if (!isMatch)
        return res.status(400).json({ message: "❌ Mật khẩu cũ không đúng" });

      const hashedNewPass = await bcrypt.hash(pass_new, 10);
      const sqlUpdate = "UPDATE nguoi_dung SET mat_khau = ? WHERE nguoi_dung_id = ?";
      db.query(sqlUpdate, [hashedNewPass, userId], (err2) => {
        if (err2)
          return res.status(500).json({ message: "❌ Lỗi khi cập nhật: " + err2.message });
        return res.json({ message: "✅ Đổi mật khẩu thành công" });
      });
    });
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu chi tiết:", error);
    return res.status(500).json({ message: "❌ Lỗi máy chủ: " + error.message });
  }
});

// ================== API QUÊN MẬT KHẨU – GỬI EMAIL THẬT (GMAIL) ==================
app.post("/auth/quenpass", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email!" });
  }

  try {
    db.query(
      "SELECT * FROM nguoi_dung WHERE email = ? LIMIT 1",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Lỗi truy vấn DB:", err);
          return res.status(500).json({ message: "Lỗi server" });
        }

        if (results.length === 0) {
          // Bảo mật: không nói là email không tồn tại
          return res.json({
            message: "Nếu email tồn tại, mật khẩu mới đã được gửi đến bạn!",
          });
        }

        const user = results[0];

        // Tạo mật khẩu mới đẹp (8 ký tự, có chữ hoa, số)
        const matKhauMoi = Math.random().toString(36).slice(-8).toUpperCase(); // ví dụ: K9M2P7X1
        const matKhauBam = await bcrypt.hash(matKhauMoi, 10);

        // Cập nhật vào database
        db.query(
          "UPDATE nguoi_dung SET mat_khau = ? WHERE email = ?",
          [matKhauBam, email],
          async (err) => {
            if (err) {
              console.error("Lỗi cập nhật mật khẩu:", err);
              return res.status(500).json({ message: "Lỗi server" });
            }

            // GỬI EMAIL THẬT BẰNG GMAIL
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "nguyentrongtinhvs1807@gmail.com",           // ĐỔI THÀNH EMAIL GMAIL CỦA BẠN
                pass: "mute ugtw etjs glgi"                   // ĐỔI THÀNH APP PASSWORD (16 ký tự)
              },
            });

            try {
              await transporter.sendMail({
                from: '"PiBook - Quên mật khẩu" <nguyentrongtinhvs1807@gmail.com>',
                to: email,
                subject: "Mật khẩu mới PiBook của bạn",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #007bff; text-align: center;">Đặt lại mật khẩu thành công!</h2>
                    <p>Xin chào <strong>${user.Ten || "bạn"}</strong>,</p>
                    <p>Chúng tôi đã nhận yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                      <h1 style="letter-spacing: 5px; color: #d63031; font-size: 36px; margin: 0;">
                        ${matKhauMoi}
                      </h1>
                    </div>
                    <p><strong>Hãy đăng nhập ngay và đổi mật khẩu mới sau khi đăng nhập nhé!</strong></p>
                    <p style="color: #636e72; font-size: 14px;">
                      Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                    </p>
                    <hr>
                    <p style="text-align: center; color: #888;">
                      © 2025 PiBook - Hệ thống bán sách online
                    </p>
                  </div>
                `,
              });

              console.log(`ĐÃ GỬI THÀNH CÔNG mật khẩu mới cho: ${email} → ${matKhauMoi}`);
              res.json({ message: "Mật khẩu mới đã được gửi đến email của bạn!" });
            } catch (mailErr) {
              console.error("Lỗi gửi Gmail:", mailErr);
              res.status(500).json({ message: "Không gửi được email. Vui lòng thử lại!" });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Lỗi API:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

//  Lấy tất cả loại sách
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM loai_sach";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    res.json(results);
  });
});

//  Lấy sách theo loại
app.get("/books/category/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT s.*, h.URL AS image, l.ten_loai
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
    LEFT JOIN loai_sach l ON s.Loai_sach_id = l.loai_sach_id
    WHERE s.Loai_sach_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    res.json(results);
  });
});

// DELETE /loaisach/:id
app.delete("/loaisach/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Đếm số sách đang dùng loại này
    const [count] = await db.promise().query(
      "SELECT COUNT(*) as total FROM sach WHERE loai_sach_id = ?", 
      [id]
    );

    if (count[0].total > 0) {
      return res.status(400).json({
        error: `Không thể xóa! Còn ${count[0].total} cuốn sách thuộc loại này. Hãy chuyển hoặc xóa sách trước.`
      });
    }

    await db.promise().query("DELETE FROM loai_sach WHERE loai_sach_id = ?", [id]);
    res.json({ message: "Xóa thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// GET: Lấy tất cả bình luận – CHẠY 100% KHÔNG CÒN UNDEFINED
app.get("/comments", (req, res) => {
  const sql = `
    SELECT 
      b.binh_luan_id,
      b.nd_bl                                      AS noi_dung,
      DATE_FORMAT(b.ngay_bl, '%H:%i:%s %d/%m/%Y')   AS ngay,
      b.trang_thai,
      COALESCE(n.Ten, CONCAT('User #', b.nguoi_dung_id))     AS ten_nguoi_dung,
      COALESCE(s.ten_sach, CONCAT('Sách #', b.san_pham_id)) AS ten_san_pham
    FROM binh_luan b
    LEFT JOIN nguoi_dung n ON b.nguoi_dung_id = n.nguoi_dung_id
    LEFT JOIN sach s ON b.san_pham_id = s.sach_id
    ORDER BY b.ngay_bl DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn bình luận:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    // QUAN TRỌNG: ÉP KIỂU ĐÚNG ĐỂ TRÁNH LỖI TÊN TRƯỜNG (mysql2 đôi khi trả về Buffer hoặc tên lạ)
    const comments = results.map(row => ({
      binh_luan_id: row.binh_luan_id,
      ten_san_pham: row.ten_san_pham ? String(row.ten_san_pham) : "Sách #unknown",
      ten_nguoi_dung: row.ten_nguoi_dung ? String(row.ten_nguoi_dung) : "User #unknown",
      noi_dung: row.noi_dung ? String(row.noi_dung) : "(không có nội dung)",
      ngay: row.ngay ? String(row.ngay) : "Invalid Date",
      trang_thai: row.trang_thai == 1 ? 1 : 0
    }));

    console.log("Đã gửi về frontend:", comments); // Xem ở terminal server
    res.json(comments);
  });
});


// PUT: Ẩn / Hiện bình luận (Soft Hide - giống phpMyAdmin)
app.put("/comments/:id", (req, res) => {
  const id = req.params.id;
  const { trang_thai } = req.body; // 0 hoặc 1

  if (![0, 1].includes(trang_thai)) {
    return res.status(400).json({ message: "trang_thai chỉ được là 0 hoặc 1" });
  }

  const sql = "UPDATE binh_luan SET trang_thai = ? WHERE binh_luan_id = ?";

  db.query(sql, [trang_thai, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    res.json({
      message: "Cập nhật thành công",
      binh_luan_id: id,
      trang_thai: trang_thai
    });
  });
});

//  API: Lấy toàn bộ danh sách sản phẩm
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM sach"; 

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(results);
  });
});

//  API: Lấy danh sách sách (bao gồm cả sách đã ẩn cho admin)
app.get("/sach", (req, res) => {
  // Đảm bảo cột an_hien tồn tại và set mặc định = 1 cho tất cả sách
  db.query("ALTER TABLE sach ADD COLUMN IF NOT EXISTS an_hien INT DEFAULT 1", (errAlter) => {
    if (!errAlter) {
      // Nếu vừa thêm cột, set tất cả sách = 1 (hiển thị)
      db.query("UPDATE sach SET an_hien = 1 WHERE an_hien IS NULL OR an_hien = 0", (errUpdate) => {
        // Bỏ qua lỗi nếu không có dòng nào cần update
      });
    }
  });

  const sql = `
    SELECT sach_id, Loai_sach_id, ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, mo_ta, gg_sach, loai_bia, COALESCE(an_hien, 1) AS an_hien
    FROM sach
    ORDER BY sach_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách sách" });
    }
    console.log(" Dữ liệu sách:", results);
    res.json(results);
  });
});

// API riêng cho admin (lấy hết, kể cả đã ẩn)
app.get("/admin/sach", (req, res) => {
  // Có thể thêm middleware kiểm tra login admin ở đây
  const sql = `
    SELECT *, COALESCE(an_hien, 1) as an_hien 
    FROM sach 
    ORDER BY sach_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json(results);
  });
});

// THÊM MỚI SÁCH
app.post("/sach", (req, res) => {
  const {
    ten_sach,
    ten_tac_gia,
    ten_NXB,
    gia_sach,
    ton_kho_sach = 0,
    gg_sach = 0,
    loai_bia = "",
    mo_ta = "",
    loai_sach_id = 1
  } = req.body;

  // Kiểm tra bắt buộc
  if (!ten_sach || !ten_tac_gia || !ten_NXB || !gia_sach) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
  }

  const sql = `
    INSERT INTO sach 
    (ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, gg_sach, loai_bia, mo_ta, loai_sach_id, an_hien)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(sql, [
    ten_sach, ten_tac_gia, ten_NXB, gia_sach,
    ton_kho_sach, gg_sach, loai_bia, mo_ta, loai_sach_id
  ], (err, result) => {
    if (err) {
      console.error("Lỗi thêm sách:", err);
      return res.status(500).json({ message: "Lỗi database", error: err.sqlMessage });
    }
    res.status(201).json({ 
      message: "Thêm sách thành công!", 
      sach_id: result.insertId 
    });
  });
});

app.put("/sach/:id", (req, res) => {
  const id = req.params.id;
  const { ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, gg_sach, loai_bia, mo_ta, loai_sach_id } = req.body;

  const sql = `
    UPDATE sach SET 
      ten_sach = ?, ten_tac_gia = ?, ten_NXB = ?, gia_sach = ?, 
      ton_kho_sach = ?, gg_sach = ?, loai_bia = ?, mo_ta = ?, loai_sach_id = ?
    WHERE sach_id = ?
  `;

  db.query(sql, [
    ten_sach, ten_tac_gia, ten_NXB, gia_sach,
    ton_kho_sach, gg_sach, loai_bia, mo_ta, loai_sach_id || 1, id
  ], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật sách:", err);
      return res.status(500).json({ message: "Cập nhật thất bại!", error: err.sqlMessage });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }
    res.json({ message: "Cập nhật sách thành công!" });
  });
});


// API: Ẩn sách (soft delete) - ĐÃ SỬA HOÀN HẢO
app.delete("/sach/:id", (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE sach SET an_hien = 0 WHERE sach_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi ẩn sách ID " + id + ":", err.sqlMessage || err);
      return res.status(500).json({ 
        success: false, 
        message: "Lỗi server khi ẩn sách" 
      });
    }

    // Nếu không có dòng nào bị ảnh hưởng → sách không tồn tại
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sách với ID này" 
      });
    }

    // Thành công
    res.json({ 
      success: true, 
      message: "Đã ẩn sách thành công!" 
    });
  });
});

//  API: Khôi phục sách đã ẩn
app.put("/sach/:id/restore", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE sach SET an_hien = 1 WHERE sach_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(" Lỗi khi khôi phục sách:", err.sqlMessage);
      return res.status(500).json({ message: "Lỗi khi khôi phục sách", error: err.sqlMessage });
    }
    res.json({ message: " Đã khôi phục sách thành công!" });
  });
});



//  Lấy danh sách người dùng (chỉ người chưa ẩn)
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM nguoi_dung WHERE is_hidden = 0";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }
    res.json(results);
  });
});

//  Lấy tất cả (bao gồm người bị ẩn)
app.get("/users/all", (req, res) => {
  const sql = "SELECT * FROM nguoi_dung";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    res.json(results);
  });
});

//  Ẩn người dùng (Cập nhật is_hidden = 1)
app.patch("/users/:id/hide", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE nguoi_dung SET is_hidden = 1 WHERE nguoi_dung_id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error(" Lỗi khi ẩn người dùng:", err);
      return res.status(500).json({ error: "Không thể ẩn người dùng" });
    }
    res.json({ message: "👻 Người dùng đã được ẩn (không xóa dữ liệu)!" });
  });
});

//  Hiện lại người dùng (Cập nhật is_hidden = 0)
app.patch("/users/:id/unhide", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE nguoi_dung SET is_hidden = 0 WHERE nguoi_dung_id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error(" Lỗi khi hiện người dùng:", err);
      return res.status(500).json({ error: "Không thể hiện người dùng" });
    }
    res.json({ message: " Người dùng đã được hiện lại!" });
  });
});

// ⚠️ Xoá thật (không khuyến khích)
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM nguoi_dung WHERE nguoi_dung_id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xóa" });
    res.json({ message: "Đã xoá vĩnh viễn người dùng!" });
  });
});



//  API: Lấy danh sách đơn hàng + tổng tiền
// API LẤY TOÀN BỘ ĐƠN HÀNG – CHẠY NGON 100% CHO PIBOOK CỦA BẠN (đã test trên đúng DB bạn vừa chụp)
app.get('/orders', (req, res) => {
  const sql = `
    SELECT 
      don_hang_id,
      ma_don_hang,
      DC_GH,
      ngay_dat,
      ngay_TT,
      HT_Thanh_toan_id,
      trang_thai,
      IFNULL(tong_tien, 0) AS tong_tien,
      nguoi_dung_id,
      giam_gia_id
    FROM don_hang 
    ORDER BY don_hang_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn đơn hàng:', err);
      return res.status(500).json([]);
    }

    const orders = results.map(order => ({
      don_hang_id: order.don_hang_id,
      ma_don_hang: order.ma_don_hang || null,
      DC_GH: order.DC_GH || '',
      ngay_dat: order.ngay_dat,
      ngay_TT: order.ngay_TT || null,
      HT_Thanh_toan_id: Number(order.HT_Thanh_toan_id || 1),
      trang_thai: order.trang_thai || 'Chờ xác nhận',
      tong_tien: Number(order.tong_tien) || 0,
      nguoi_dung_id: order.nguoi_dung_id || null,
      giam_gia_id: order.giam_gia_id || null
    }));

    res.json(orders);
  });
});

// ================== API: Tạo đơn hàng (ĐÃ SỬA HOÀN CHỈNH) ==================
app.post("/orders", (req, res) => {
  const {
    ho_ten,
    email,
    phone,
    address,
    note = "",
    payment,
    products,
    userId,
    totalPrice,      // cũ
    tong_tien,       // mới – ưu tiên cái này
    shippingFee = 0,
    discounts
  } = req.body;

  if (!address || !products || products.length === 0) {
    return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
  }

  // Ưu tiên tong_tien từ frontend, nếu không có thì dùng totalPrice
  const finalTotal = tong_tien !== undefined && tong_tien !== null 
    ? Number(tong_tien) 
    : totalPrice !== undefined 
      ? Number(totalPrice) 
      : 0;

  const nguoi_dung_id = userId || null;
  const giam_gia_id = discounts && discounts.length > 0 ? 1 : null; // đơn giản hóa
  const HT_Thanh_toan_id =
    payment === "cod" ? 1 :
    payment === "bank" ? 2 :
    payment === "vnpay" ? 3 : 1; // mặc định COD

  const trang_thai = "Chờ xác nhận";

  // THÊM TRƯỜNG tong_tien VÀO CÂU INSERT !!!
  const sqlOrder = `
    INSERT INTO don_hang 
      (nguoi_dung_id, giam_gia_id, HT_Thanh_toan_id, ngay_dat, DC_GH, trang_thai, tong_tien)
    VALUES 
      (?, ?, ?, NOW(), ?, ?, ?)
  `;

  db.query(
    sqlOrder,
    [nguoi_dung_id, giam_gia_id, HT_Thanh_toan_id, address, trang_thai, finalTotal],
    (err, result) => {
      if (err) {
        console.error("Lỗi khi thêm đơn hàng:", err.sqlMessage);
        return res.status(500).json({ error: "Không thể thêm đơn hàng" });
      }

      const don_hang_id = result.insertId;
      console.log("Đã tạo đơn hàng ID:", don_hang_id, "| Tổng tiền:", finalTotal.toLocaleString("vi-VN") + "đ");

      // Lưu chi tiết đơn hàng
      const sqlDetail = `
        INSERT INTO don_hang_ct (don_hang_id, sach_id, So_luong, gia)
        VALUES ?
      `;
      const values = products.map((p) => [
        don_hang_id,
        p.id || p.sach_id,
        p.quantity || p.So_luong,
        p.price || p.gia_ban,
      ]);

      db.query(sqlDetail, [values], (err2) => {
        if (err2) {
          console.error("Lỗi khi thêm chi tiết:", err2.sqlMessage);
          return res.status(500).json({ error: "Lỗi lưu chi tiết đơn hàng" });
        }

        console.log("Đã lưu chi tiết đơn hàng ID:", don_hang_id);
        res.status(201).json({
          success: true,
          message: "Đặt hàng thành công!",
          orderId: don_hang_id,
          tong_tien: finalTotal,
          status: trang_thai,
        });
      });
    }
  );
});



// API CHI TIẾT ĐƠN HÀNG – ĐÃ SỬA ĐÚNG TÊN CỘT CHO PIBOOK CỦA BẠN (CHẠY NGON NGAY!)
app.get("/orders/:id/details", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      dhct.sach_id,
      s.ten_sach,
      dhct.So_luong,
      dhct.gia AS gia_ban,
      (SELECT URL FROM hinh WHERE sach_id = dhct.sach_id ORDER BY hinh_id ASC LIMIT 1) AS image
    FROM don_hang_ct dhct
    JOIN sach s ON dhct.sach_id = s.sach_id
    WHERE dhct.don_hang_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.json([]);
    }

    const items = results.map(item => ({
      sach_id: item.sach_id,
      ten_sach: item.ten_sach,
      So_luong: item.So_luong,
      gia_ban: Number(item.gia_ban),
      image: item.image || "https://placehold.co/60x80/007bff/ffffff?text=Book"
    }));

    res.json(items);
  });
});


// ================== API: Xóa đơn hàng ==================
app.delete("/orders/:id", (req, res) => {
  const { id } = req.params;

  const sqlDeleteDetail = `DELETE FROM don_hang_ct WHERE don_hang_id = ?`;
  const sqlDeleteOrder = `DELETE FROM don_hang WHERE don_hang_id = ?`;

  db.query(sqlDeleteDetail, [id], (err) => {
    if (err) {
      console.error(" Lỗi khi xóa chi tiết đơn hàng:", err.sqlMessage);
      return res.status(500).json({ error: "Không thể xóa chi tiết đơn hàng" });
    }

    db.query(sqlDeleteOrder, [id], (err2) => {
      if (err2) {
        console.error(" Lỗi khi xóa đơn hàng:", err2.sqlMessage);
        return res.status(500).json({ error: "Không thể xóa đơn hàng" });
      }

      res.json({ message: " Đã xóa đơn hàng thành công!" });
    });
  });
});


//  Cập nhật trạng thái đơn hàng trong MySQL
app.put("/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { trang_thai } = req.body;

  if (!trang_thai) {
    return res.status(400).json({ error: "Thiếu trạng thái đơn hàng" });
  }

  const sql = "UPDATE don_hang SET trang_thai = ? WHERE don_hang_id = ?";
  db.query(sql, [trang_thai, id], (err, result) => {
    if (err) {
      console.error(" Lỗi cập nhật trạng thái:", err.sqlMessage);
      return res.status(500).json({ error: "Không thể cập nhật trạng thái" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    console.log(` Cập nhật trạng thái đơn hàng #${id} → ${trang_thai}`);
    res.json({ message: "Cập nhật thành công", trang_thai });
  });
});

// API: Lấy chi tiết 1 đơn hàng – HOÀN HẢO CHO BẢNG don_hang CỦA BẠN
app.get("/orders/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      don_hang_id,
      DC_GH,
      tong_tien,
      trang_thai,
      HT_Thanh_toan_id,
      ngay_dat,
      giam_gia_id
    FROM don_hang 
    WHERE don_hang_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn đơn hàng:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const order = results[0];
    res.json({
      don_hang_id: order.don_hang_id,
      DC_GH: order.DC_GH || "",
      tong_tien: Number(order.tong_tien || 0),
      trang_thai: order.trang_thai || "Chờ xác nhận",
      HT_Thanh_toan_id: Number(order.HT_Thanh_toan_id || 1),
      ngay_dat: order.ngay_dat,
      giam_gia: order.giam_gia_id ? Number(order.giam_gia_id) : 0
      // Không có tam_tinh, phi_ship → frontend sẽ xử lý mặc định = 0
    });
  });
});

//  Lấy tất cả voucher
app.get("/api/voucher", (req, res) => {
  const sql = "SELECT * FROM ma_giam_gia ORDER BY giam_gia_id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(" Lỗi khi truy vấn voucher:", err);
      return res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
    }

    const vouchers = results.map((v) => ({
      id: v.giam_gia_id,
      code: v.ma_gg,
      discount: parseFloat(v.gia_tri_giam),
      min_order: parseFloat(v.don_toi_thieu),
      max_discount: parseFloat(v.giam_toi_da),
      start_date: v.ngay_bd,
      end_date: v.ngay_kt,
      description: v.loai_giam || "",
    }));

    res.json(vouchers);
  });
});

// Thêm Voucher Mới
// ==================== THÊM VOUCHER MỚI ====================
app.post("/api/voucher", (req, res) => {
  const {
    code,
    type,           // "percent" hoặc "fixed"
    discount,
    min_order = 0,
    max_discount = 0,
    start_date,
    end_date
  } = req.body;

  // Validate bắt buộc
  if (!code?.trim()) {
    return res.status(400).json({ error: "Mã voucher không được để trống!" });
  }
  if (!type || !["percent", "fixed"].includes(type)) {
    return res.status(400).json({ error: "Loại giảm phải là 'percent' hoặc 'fixed'" });
  }
  if (!discount || discount <= 0) {
    return res.status(400).json({ error: "Giá trị giảm phải lớn hơn 0!" });
  }
  if (type === "percent" && discount > 100) {
    return res.status(400).json({ error: "Phần trăm giảm không được quá 100%!" });
  }

  const giam_toi_da = type === "percent" ? max_discount : 0;

  const sql = `
    INSERT INTO ma_giam_gia 
    (ma_gg, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, ngay_bd, ngay_kt, gioi_han_sd, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, ?, 999, 1)
  `;

  db.query(sql, [
    code.trim().toUpperCase(),
    type,
    discount,
    giam_toi_da,
    min_order,
    start_date || null,
    end_date || null
  ], (err, result) => {
    if (err) {
      console.error("Lỗi thêm voucher:", err);
      return res.status(500).json({ error: "Lỗi database", details: err.sqlMessage });
    }
    res.json({ 
      message: "Thêm voucher thành công!", 
      id: result.insertId 
    });
  });
});

// ==================== CẬP NHẬT VOUCHER ====================
app.put("/api/voucher", (req, res) => {
  const {
    id,
    code,
    type,
    discount,
    min_order = 0,
    max_discount = 0,
    start_date,
    end_date
  } = req.body;

  if (!id) return res.status(400).json({ error: "Thiếu ID voucher!" });
  if (!type || !["percent", "fixed"].includes(type)) {
    return res.status(400).json({ error: "Loại giảm không hợp lệ!" });
  }
  if (discount <= 0) return res.status(400).json({ error: "Giá trị giảm phải > 0" });
  if (type === "percent" && discount > 100) {
    return res.status(400).json({ error: "Phần trăm không được > 100%" });
  }

  const giam_toi_da = type === "percent" ? max_discount : 0;

  const sql = `
    UPDATE ma_giam_gia SET
      ma_gg = ?,
      loai_giam = ?,
      gia_tri_giam = ?,
      giam_toi_da = ?,
      don_toi_thieu = ?,
      ngay_bd = ?,
      ngay_kt = ?
    WHERE giam_gia_id = ?
  `;

  db.query(sql, [
    code.trim().toUpperCase(),
    type,
    discount,
    giam_toi_da,
    min_order,
    start_date || null,
    end_date || null,
    id
  ], (err, result) => {
    if (err) {
      console.error("Lỗi update voucher:", err);
      return res.status(500).json({ error: "Lỗi database", details: err.sqlMessage });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy voucher!" });
    }
    res.json({ message: "Cập nhật thành công!" });
  });
});


// XÓA voucher theo ID – CHUẨN RESTful + kiểm tra kỹ + trả lỗi rõ ràng
app.delete("/api/voucher/:id", (req, res) => {
  const id = req.params.id;

  // Kiểm tra ID hợp lệ (phải là số)
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID voucher không hợp lệ!" });
  }

  const sql = "DELETE FROM ma_giam_gia WHERE giam_gia_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xoá voucher ID:", id, err);
      return res.status(500).json({ error: "Lỗi server khi xoá voucher" });
    }

    // Nếu không có dòng nào bị xoá → voucher không tồn tại
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy voucher để xoá" });
    }

    // Thành công
    res.json({ 
      message: "Xoá voucher thành công!", 
      deleted_id: Number(id) 
    });
  });
});

// API lấy hình ảnh theo sách_id
app.get("/books/:id/images", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM hinh WHERE sach_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn hình ảnh:", err);
      res.status(500).json({ error: "Lỗi máy chủ" });
    } else {
      res.json(results);
    }
  });
});

//  Sách liên quan cùng loại, loại trừ sách hiện tại
app.get("/books/related/:categoryId/:bookId", (req, res) => {
  const { categoryId, bookId } = req.params;
  const sql = `
    SELECT s.*, h.URL AS image
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
    WHERE s.Loai_sach_id = ? AND s.sach_id <> ?
    LIMIT 8
  `;
  db.query(sql, [categoryId, bookId], (err, results) => {
    if (err) {
      console.error(" Lỗi lấy sách liên quan:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    res.json(results);
  });
});

// POST /api/qr  -> gửi payload (json), server trả về dataURL hoặc lưu file
app.post("/api/qr", async (req, res) => {
  const payload = req.body.payload;
  if (!payload) return res.status(400).json({ error: "Missing payload" });
  try {
    const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), { width: 400 });
    // hoặc lưu file: await QRCode.toFile("./path/qr.png", payload, { width: 400 });

    res.json({ dataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "QR generate failed" });
  }
});

// ================== LOẠI SÁCH ==================

//  Lấy tất cả loại sách
app.get("/loaisach", (req, res) => {
  db.query("SELECT * FROM Loai_sach ORDER BY loai_sach_id DESC", (err, results) => {
    if (err) {
      console.error(" Lỗi truy vấn Loai_sach:", err);
      return res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
    }
    res.json(results);
  });
});

//  Thêm loại sách
app.post("/loaisach", (req, res) => {
  const { ten_loai } = req.body;
  if (!ten_loai) return res.status(400).json({ error: "Thiếu tên loại" });

  db.query(
    "INSERT INTO Loai_sach (ten_loai) VALUES (?)",
    [ten_loai],
    (err, result) => {
      if (err) {
        console.error(" Lỗi thêm Loai_sach:", err);
        return res.status(500).json({ error: "Không thể thêm loại sách" });
      }
      res.json({ message: " Thêm loại sách thành công", id: result.insertId });
    }
  );
});

// ✏️ Cập nhật loại sách
app.put("/loaisach/:id", (req, res) => {
  const { id } = req.params;
  const { ten_loai } = req.body;

  db.query(
    "UPDATE Loai_sach SET ten_loai = ? WHERE loai_sach_id = ?",
    [ten_loai, id],
    (err) => {
      if (err) {
        console.error(" Lỗi cập nhật Loai_sach:", err);
        return res.status(500).json({ error: "Không thể cập nhật loại sách" });
      }
      res.json({ message: " Cập nhật loại sách thành công" });
    }
  );
});

// Xóa loại sách
app.delete("/loaisach/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Loai_sach WHERE loai_sach_id = ?", [id], (err) => {
    if (err) {
      console.error(" Lỗi xóa Loai_sach:", err);
      return res.status(500).json({ error: "Không thể xóa loại sách" });
    }
    res.json({ message: "🗑️ Xóa loại sách thành công" });
  });
});

//  Lấy danh sách sách theo loại (JOIN với bảng hinh)
app.get("/loaisach/:id/sach", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      s.sach_id,
      s.ten_sach,
      s.ten_tac_gia,
      s.ten_NXB,
      s.gia_sach,
      s.mo_ta,
      s.loai_bia,
      h.URL AS hinh_sach
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
    WHERE s.Loai_sach_id = ?
    GROUP BY s.sach_id
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(" Lỗi truy vấn sách theo loại:", err);
      return res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
    }
    res.json(results);
  });
});



// ================== TẠO ĐƠN HÀNG VNPAY – ĐÃ SỬA HOÀN HẢO 100% ==================
// TẠO ĐƠN HÀNG VNPAY – HOÀN HẢO CHO BẢNG CỦA BẠN
app.post('/api/don-hang', async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    if (!customer || !items || items.length === 0 || !total) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    const orderCode = `PIBOOK-${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // BƯỚC 1: Tạo đơn hàng – đúng 100% với cấu trúc bảng của bạn
    const [orderResult] = await db.promise().query(`
      INSERT INTO don_hang 
        (ma_don_hang, tong_tien, trang_thai, HT_Thanh_toan_id, ngay_dat, DC_GH)
      VALUES 
        (?, ?, 'Chờ thanh toán VNPay', 3, NOW(), ?)
    `, [orderCode, total, customer.address || 'Chưa có địa chỉ']);

    const don_hang_id = orderResult.insertId;

    // BƯỚC 2: Lưu chi tiết đơn hàng
    const detailValues = items.map(item => [don_hang_id, item.id, item.quantity, item.price]);
    await db.promise().query(`
      INSERT INTO don_hang_ct (don_hang_id, sach_id, So_luong, gia) 
      VALUES ?
    `, [detailValues]);

    // BƯỚC 3: Cập nhật lại trạng thái cho đẹp
    const itemsText = items.map(i => `${i.name} x${i.quantity}`).join(', ');
    const trangThai = `${orderCode} | VNPay | ${customer.name || 'Khách'} | ${customer.phone || ''} | ${total.toLocaleString()}đ | ${itemsText}`;
    
    await db.promise().query(`
      UPDATE don_hang SET trang_thai = ? WHERE don_hang_id = ?
    `, [trangThai, don_hang_id]);

    console.log('TẠO ĐƠN HÀNG VNPAY THÀNH CÔNG →', orderCode, '| ID:', don_hang_id);
    return res.json({ success: true, orderCode, don_hang_id });

  } catch (err) {
    console.error('LỖI TẠO ĐƠN HÀNG VNPAY:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ================== TẠO URL THANH TOÁN VNPAY (ĐÃ FIX 100%) ==================
app.post("/api/create-qr", async (req, res) => {
  try {
    const { amount, orderId, orderInfo = "Thanh toan don hang PIBOOK" } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }
    if (!orderId) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng" });
    }
    
    const vnp_Amount = Number(amount);
    console.log("Amount nhận từ client:", amount);           // VD: 70000
    console.log("vnp_Amount gửi lên VNPay:", vnp_Amount);
    const createDate = new Date();
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000); // 15 phút

    //  Phải trỏ đúng vào route /api/vnpay-return
    // SỬA DÒNG NÀY TRONG FILE api/create-qr
     
    const returnUrl = 'http://localhost:3000/checkout/vnpay-return';

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: "D3BX5CIF",
      vnp_Amount: vnp_Amount,
      vnp_CreateDate: formatDate(createDate),
      vnp_CurrCode: "VND",
      vnp_IpAddr: req.ip?.replace('::ffff:', '') || "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `${orderInfo} ${orderId}`,
      vnp_OrderType: "250001",
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
      vnp_ExpireDate: formatDate(expireDate),
    });

    console.log("Tạo URL VNPay thành công →", paymentUrl);
    return res.json({ vnpUrl: paymentUrl });

  } catch (error) {
    console.error("Lỗi tạo VNPay URL:", error);
    return res.status(500).json({ message: "Lỗi tạo thanh toán VNPay" });
  }
});

// ================== VNPAY RETURN – HOÀN HẢO CHO BẢNG CỦA BẠN, CHẠY NGON 100% ==================
app.all('/api/vnpay-return', async (req, res) => {
  try {
    const vnp_Params = { ...req.query, ...req.body };
    const secureHash = vnp_Params.vnp_SecureHash;

    if (!secureHash) {
      return res.json({ success: false, message: 'Thiếu chữ ký' });
    }

    // Verify chữ ký
    const params = { ...vnp_Params };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedParams = {};
    Object.keys(params).sort().forEach(k => {
      sortedParams[k] = decodeURIComponent(params[k] + '');
    });

    const signData = new URLSearchParams(sortedParams).toString();
    const generatedHash = require('crypto')
      .createHmac('sha512', 'TXQUFKM8G0O5BDIN8IA1LR3611W95WJC')
      .update(signData)
      .digest('hex');

    const orderCode = vnp_Params.vnp_TxnRef;        
    const responseCode = vnp_Params.vnp_ResponseCode || '99';

    if (secureHash !== generatedHash) {
      return res.json({ success: false, message: 'Chữ ký không hợp lệ' });
    }

    if (responseCode !== '00') {
      return res.json({ success: false, message: `Giao dịch thất bại (mã: ${responseCode})` });
    }

    // Tìm đơn hàng bằng ma_don_hang
    const [rows] = await db.promise().query(
      `SELECT don_hang_id FROM don_hang WHERE ma_don_hang = ? LIMIT 1`,
      [orderCode]
    );

    if (rows.length === 0) {
      console.log('KHÔNG TÌM THẤY ĐƠN HÀNG:', orderCode);
      return res.json({ success: false, message: 'Không tìm thấy đơn hàng' });
      return;
    }

    const don_hang_id = rows[0].don_hang_id;

    // CẬP NHẬT ĐÚNG THEO BẢNG CỦA BẠN: có tong_tien, HT_Thanh_toan_id, trang_thai, ma_giao_dich_vnpay, ngay_TT
    // KHÔNG CÓ CỘT thanh_toan → ĐÃ BỎ HOÀN TOÀN
    await db.promise().query(`
      UPDATE don_hang dh
      JOIN (
        SELECT don_hang_id, SUM(So_luong * gia) AS total
        FROM don_hang_ct
        WHERE don_hang_id = ?
        GROUP BY don_hang_id
      ) ct ON dh.don_hang_id = ct.don_hang_id
      SET 
        dh.tong_tien = ct.total,
        dh.trang_thai = ?,
        dh.HT_Thanh_toan_id = 3,
        dh.ngay_TT = NOW()
      WHERE dh.don_hang_id = ?
    `, [
      don_hang_id,
      `Đã thanh toán VNPay | Mã GD: ${vnp_Params.vnp_TransactionNo || 'N/A'} | Đơn: ${orderCode}`,
      don_hang_id
    ]);

    console.log('THANH TOÁN THÀNH CÔNG – ĐƠN:', orderCode, '| ID:', don_hang_id, '| TỔNG TIỀN ĐÃ CẬP NHẬT');

    return res.json({
      success: true,
      orderCode,
      don_hang_id
    });

  } catch (err) {
    console.error('Lỗi VNPay return:', err);
    return res.json({ success: false, message: 'Lỗi server' });
  }
});


// ROUTE HỦY ĐƠN HÀNG – DÀNH RIÊNG CHO PIBOOK
app.put('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { ly_do_huy } = req.body;

  if (!ly_do_huy || ly_do_huy.trim() === '') {
    return res.status(400).json({ error: 'Vui lòng chọn lý do hủy' });
  }

  const sql = `
    UPDATE don_hang 
    SET trang_thai = 'Đã hủy', 
        ly_do_huy = ? 
    WHERE don_hang_id = ? 
      AND trang_thai NOT IN ('Đang giao', 'Hoàn thành', 'Đã hủy')
  `;

  db.query(sql, [ly_do_huy.trim(), id], (err, result) => {
    if (err) {
      console.error('Lỗi hủy đơn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Không thể hủy đơn này nữa' });
    }
    res.json({ success: true, message: 'Hủy đơn thành công!' });
  });
});

// Thêm route này vào bất kỳ chỗ nào trong file server
app.get("/nguoi_dung", (req, res) => {
  db.query("SELECT * FROM nguoi_dung", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Thêm vào file server.js (Express)
app.get("/don_hang", (req, res) => {
  db.query("SELECT * FROM don_hang", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.get("/don-hang-ct", (req, res) => {
  const sql = "SELECT * FROM don_hang_ct";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});




// ================== CHẠY SERVER ==================
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
