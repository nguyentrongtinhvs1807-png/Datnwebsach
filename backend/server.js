const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("./database"); // Sequelize model (nếu dùng)

const app = express();

// ================== CẤU HÌNH CƠ BẢN ==================
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================== KẾT NỐI DATABASE ==================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // nếu MySQL có mật khẩu thì thêm vào
  database: "pibook_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối MySQL thất bại:", err);
  } else {
    console.log("✅ Đã kết nối MySQL thành công!");
  }
});

// ================== HÀM MAP SẢN PHẨM ==================
const mapProduct = (row) => ({
  id: row.id,
  name: row.ten_sp || "Không rõ tên",
  price: Number(row.gia) || 0,
  originalPrice: Number(row.gia_km) || 0,
  image: row.hinh || "",
  description: row.mo_ta || "Chưa có mô tả",
  hot: Number(row.hot) || 0,
  tac_gia: row.tac_gia || "Không rõ tác giả",
  book_type: row.book_type || "Không rõ loại bìa",
});

// ================== API: LẤY DANH SÁCH SÁCH ==================
app.get("/books", (req, res) => {
  const { category } = req.query;

  let sql = `
    SELECT 
      s.sach_id, s.ten_sach, s.ten_tac_gia, s.ten_NXB,
      s.gia_sach, s.ton_kho_sach, s.mo_ta, s.gg_sach, s.loai_bia, s.Loai_sach_id,
      h.URL AS image
    FROM sach s
    LEFT JOIN hinh h ON s.sach_id = h.sach_id
  `;
  const params = [];

  if (category) {
    sql += " WHERE s.Loai_sach_id = ?";
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn /books:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy danh sách sách" });
    }
    res.json(results);
  });
});

// ================== API: LẤY DANH SÁCH SẢN PHẨM ==================
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
      console.error("❌ Lỗi truy vấn /api/products:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy danh sách sản phẩm" });
    }

    // Chuẩn hóa dữ liệu trả về
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
      console.error("❌ Lỗi truy vấn /books/:id:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy chi tiết sách" });
    }
    if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy sách" });
    res.json(results[0]);
  });
});

// ================== API: LẤY BÌNH LUẬN THEO SÁCH ==================
app.get("/comments/:bookId", (req, res) => {
  const bookId = req.params.bookId;
  const sql = `
    SELECT c.id, c.book_id, c.content, c.created_at, u.ho_ten AS user
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.book_id = ?
    ORDER BY c.created_at DESC
  `;
  db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn /comments/:bookId:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy bình luận" });
    }
    res.json(results);
  });
});

// ================== API: THÊM BÌNH LUẬN MỚI ==================
app.post("/comments", (req, res) => {
  const { bookId, userId, content } = req.body;

  if (!bookId || !userId || !content.trim()) {
    return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
  }

  const sql = `
    INSERT INTO comments (book_id, user_id, content, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [bookId, userId, content], (err, result) => {
    if (err) {
      console.error("❌ Lỗi thêm bình luận:", err);
      return res.status(500).json({ error: "Không thể thêm bình luận" });
    }

    // Trả về bình luận mới
    db.query(
      `
      SELECT c.id, c.book_id, c.content, c.created_at, u.ho_ten AS user
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
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

// ================== API: ĐĂNG NHẬP ==================
app.post("/auth/login", async (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "❌ Thiếu email hoặc mật khẩu!" });
  }

  const sql = `SELECT * FROM nguoi_dung WHERE email = ? LIMIT 1`;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      return res.status(500).json({ message: "Lỗi server!" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "❌ Email không tồn tại!" });
    }

    const user = results[0];

    try {
      // ✅ So sánh mật khẩu nhập vào với mật khẩu hash trong DB
      const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

      if (!isMatch) {
        return res.status(401).json({ message: "❌ Sai mật khẩu!" });
      }

      // ✅ Tạo JWT token
      const token = jwt.sign(
        { id: user.nguoi_dung_id, role: user.role },
        "PIBOOK_SECRET_KEY",
        { expiresIn: "2h" }
      );

      // ✅ Trả về dữ liệu user
      res.json({
        message: "✅ Đăng nhập thành công!",
        token,
        user: {
          id: user.nguoi_dung_id,
          ten: user.ten, // nếu trong DB cột là 'ten' thì viết thường
          email: user.email,
          role: user.role,
        },
      });
    } catch (err2) {
      console.error("❌ Lỗi khi so sánh mật khẩu:", err2);
      res.status(500).json({ message: "Lỗi xác thực mật khẩu!" });
    }
  });
});

// ✅ API Đăng ký
app.post("/auth/register", async (req, res) => {
  const { ten, email, mat_khau, dia_chi, ngay_sinh, role } = req.body;

  if (!ten || !email || !mat_khau) {
    return res.status(400).json({ message: "❌ Thiếu thông tin bắt buộc!" });
  }

  db.query("SELECT * FROM nguoi_dung WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra email!" });
    if (result.length > 0) return res.status(400).json({ message: "❌ Email đã tồn tại!" });

    // Mã hóa mật khẩu
    const hash = await bcrypt.hash(mat_khau, 10);
    const sql =
      "INSERT INTO nguoi_dung (ten, mat_khau, ngay_sinh, email, dia_chi, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [ten, hash, ngay_sinh || null, email, dia_chi || "", role || "user"], (err2) => {
      if (err2) return res.status(500).json({ message: "Lỗi khi thêm người dùng!" });
      res.status(200).json({ message: "✅ Đăng ký thành công!" });
    });
  });
});

// ================== API: ĐỔI MẬT KHẨU ==================
app.post("/auth/doipass", (req, res) => {
  const { email, pass_old, pass_new1 } = req.body;

  if (!email || !pass_old || !pass_new1) {
    return res.status(400).json({ message: "❌ Thiếu thông tin bắt buộc!" });
  }

  const sql = "SELECT * FROM nguoi_dung WHERE email = ? LIMIT 1";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi truy vấn!" });
    if (results.length === 0) return res.status(404).json({ message: "❌ Email không tồn tại!" });

    const user = results[0];

    try {
      // 🔍 So sánh mật khẩu cũ
      const isMatch = await bcrypt.compare(pass_old, user.mat_khau);
      if (!isMatch) {
        return res.status(401).json({ message: "❌ Mật khẩu cũ không đúng!" });
      }

      // 🔐 Hash mật khẩu mới
      const newHash = await bcrypt.hash(pass_new1, 10);
      const updateSql = "UPDATE nguoi_dung SET mat_khau = ? WHERE email = ?";

      db.query(updateSql, [newHash, email], (err2) => {
        if (err2) return res.status(500).json({ message: "❌ Lỗi khi cập nhật mật khẩu!" });
        res.status(200).json({ message: "✅ Đổi mật khẩu thành công!" });
      });
    } catch (e) {
      console.error("Lỗi đổi mật khẩu:", e);
      res.status(500).json({ message: "❌ Lỗi xử lý mật khẩu!" });
    }
  });
});

// ================== CHẠY SERVER ==================
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
