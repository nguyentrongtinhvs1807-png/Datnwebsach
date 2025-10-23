const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    console.log("✅ Đã kết nối MySQL thành công!");
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
        console.error("❌ Lỗi thêm mã giảm giá:", err);
        return res.status(500).json({ message: "Lỗi khi thêm mã giảm giá" });
      }
      res.json({ message: "✅ Thêm mã giảm giá thành công!" });
    }
  );
});

app.delete("/api/ma-giam-gia/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM ma_giam_gia WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Lỗi xoá mã giảm giá:", err);
      return res.status(500).json({ message: "Không thể xoá mã giảm giá" });
    }
    res.json({ message: "✅ Đã xoá mã giảm giá" });
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
      console.error("❌ Lỗi truy vấn /api/products:", err);
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
      console.error("❌ Lỗi truy vấn /books/:id:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy chi tiết sách" });
    }
    if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy sách" });
    res.json(results[0]);
  });
});

/// ================== API COMMENT ==================
app.get("/comments/:bookId", (req, res) => {
  const bookId = req.params.bookId;
  const sql = `
    SELECT c.binh_luan_id AS id, 
           c.san_pham_id AS book_id, 
           c.nd_bl AS content, 
           c.ngay_bl AS created_at, 
           u.Ten AS user
    FROM binh_luan c
    LEFT JOIN nguoi_dung u ON c.nguoi_dung_id = u.nguoi_dung_id
    WHERE c.san_pham_id = ?
    ORDER BY c.ngay_bl DESC
  `;
  db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn /comments/:bookId:", err);
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

// 🧾 Đăng ký tài khoản
app.post("/auth/register", async (req, res) => {
  const { ho_ten, email, mat_khau } = req.body;

  if (!ho_ten || !email || !mat_khau) {
    return res.status(400).json({ message: "⚠️ Thiếu thông tin bắt buộc" });
  }

  const checkEmailSQL = "SELECT nguoi_dung_id FROM nguoi_dung WHERE email = ? LIMIT 1";
  db.query(checkEmailSQL, [email], async (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn email:", err);
      return res.status(500).json({ message: "❌ Lỗi máy chủ khi kiểm tra email" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "❌ Email đã tồn tại" });
    }

    try {
      const hashedPassword = await bcrypt.hash(mat_khau, 10);
      const insertSQL = `
        INSERT INTO nguoi_dung (Ten, email, mat_khau, role)
        VALUES (?, ?, ?, 'user')
      `;
      db.query(insertSQL, [ho_ten, email, hashedPassword], (err2, result) => {
        if (err2) {
          console.error("Lỗi khi thêm người dùng:", err2);
          return res.status(500).json({ message: "❌ Lỗi khi tạo tài khoản" });
        }

        res.json({
          message: "✅ Đăng ký thành công",
          userId: result.insertId,
        });
      });
    } catch (hashErr) {
      console.error("Lỗi mã hoá mật khẩu:", hashErr);
      res.status(500).json({ message: "❌ Lỗi xử lý mật khẩu" });
    }
  });
});

// 🔐 Đăng nhập tài khoản (phiên bản DEV - không mã hóa)
app.post("/auth/login", (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({ message: "⚠️ Thiếu email hoặc mật khẩu" });
  }

  const sql = "SELECT * FROM nguoi_dung WHERE email = ? LIMIT 1";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "❌ Email không tồn tại" });
    }

    const user = results[0];

    // ✅ So sánh trực tiếp mật khẩu (chưa mã hóa)
    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: "❌ Sai mật khẩu" });
    }

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { id: user.nguoi_dung_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ Trả kết quả về client
    res.json({
      message: "✅ Đăng nhập thành công",
      user: {
        id: user.nguoi_dung_id,
        ten: user.Ten,
        email: user.email,
        role: user.role,
      },
      token,
    });
  });
});

// 🔑 Đổi mật khẩu (YÊU CẦU TOKEN)
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

// ✅ Lấy tất cả loại sách
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM loai_sach";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    res.json(results);
  });
});

// ✅ Lấy sách theo loại
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

// 📘 Lấy tất cả bình luận kèm tên user + sản phẩm
app.get("/comments", (req, res) => {
  const sql = `
    SELECT b.*, 
           n.Ten AS ten_nguoi_dung, 
           s.ten_sach AS ten_san_pham
    FROM binh_luan b
    LEFT JOIN nguoi_dung n ON b.nguoi_dung_id = n.nguoi_dung_id
    LEFT JOIN sach s ON b.san_pham_id = s.sach_id
    ORDER BY b.ngay_bl DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi lấy bình luận:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
    res.json(results);
  });
});

// 🗑️ Xoá bình luận
app.delete("/comments/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM binh_luan WHERE binh_luan_id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Lỗi xoá bình luận:", err);
      return res.status(500).json({ message: "Lỗi khi xoá bình luận" });
    }
    res.json({ message: "✅ Đã xoá bình luận" });
  });
});

// ✅ API: Lấy toàn bộ danh sách sản phẩm
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM sach"; // ⚠️ nếu bảng bạn tên 'san_pham' thì sửa lại cho đúng

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(results);
  });
});

// ✅ API: Lấy danh sách sách
app.get("/sach", (req, res) => {
  const sql = `
    SELECT sach_id, Loai_sach_id, ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, mo_ta, gg_sach, loai_bia
    FROM sach
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách sách" });
    }
    console.log("✅ Dữ liệu sách:", results);
    res.json(results);
  });
});

app.put("/sachs/:id", (req, res) => {
  const id = req.params.id;
  const { ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, gg_sach, loai_bia, mo_ta } = req.body;

  const sql = `
    UPDATE sach SET 
      ten_sach = ?, ten_tac_gia = ?, ten_NXB = ?, gia_sach = ?, ton_kho_sach = ?, gg_sach = ?, loai_bia = ?, mo_ta = ?
    WHERE sach_id = ?`;
    
  db.query(sql, [ten_sach, ten_tac_gia, ten_NXB, gia_sach, ton_kho_sach, gg_sach, loai_bia, mo_ta, id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi update:", err);
      return res.status(500).json({ message: "Cập nhật thất bại!" });
    }
    res.json({ message: "✅ Cập nhật thành công!", result });
  });
});


// ✅ API: Xóa sách theo ID
app.delete("/sach/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM sach WHERE sach_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa:", err.sqlMessage);
      return res
        .status(500)
        .json({ message: "Lỗi khi xóa sách", error: err.sqlMessage });
    }
    res.json({ message: "✅ Đã xóa sách thành công!" });
  });
});

// 🔹 Lấy danh sách người dùng
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM nguoi_dung";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }
    res.json(results);
  });
});

// 🔹 Xóa người dùng
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM nguoi_dung WHERE nguoi_dung_id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xóa" });
    res.json({ message: "Xóa thành công" });
  });
});

// ✅ API: Lấy danh sách đơn hàng + tổng tiền
app.get("/orders", (req, res) => {
  const sql = `
    SELECT 
      dh.don_hang_id,
      dh.nguoi_dung_id,
      dh.giam_gia_id,
      dh.HT_Thanh_toan_id,
      dh.ngay_dat,
      dh.ngay_TT,
      dh.DC_GH,
      SUM(ct.gia * ct.So_luong) AS tong_tien
    FROM don_hang dh
    LEFT JOIN don_hang_ct ct ON dh.don_hang_id = ct.don_hang_id
    GROUP BY dh.don_hang_id
    ORDER BY dh.don_hang_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn đơn hàng:", err);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
    }
    res.json(results);
  });
});

// ================== API: Tạo đơn hàng ==================
app.post("/orders", (req, res) => {
  const { ho_ten, email, phone, address, payment, totalPrice, discount, voucher, products } = req.body;

  if (!address || !products || products.length === 0) {
    return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
  }

  // 🔹 Xác định phương thức thanh toán (giả định: 1 = COD, 2 = Chuyển khoản)
  const HT_Thanh_toan_id = payment === "cod" ? 1 : 2;
  const nguoi_dung_id = null; // Chưa đăng nhập
  const giam_gia_id = voucher ? 1 : null;

  // 🔹 Câu lệnh thêm đơn hàng (phù hợp với bảng bạn có)
  const sqlOrder = `
    INSERT INTO don_hang (nguoi_dung_id, giam_gia_id, HT_Thanh_toan_id, ngay_dat, DC_GH)
    VALUES (?, ?, ?, NOW(), ?)
  `;

  db.query(sqlOrder, [nguoi_dung_id, giam_gia_id, HT_Thanh_toan_id, address], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi thêm đơn hàng:", err.sqlMessage);
      return res.status(500).json({ error: "Không thể thêm đơn hàng" });
    }

    const don_hang_id = result.insertId;
    console.log("✅ Đã tạo đơn hàng ID:", don_hang_id);

    // 🔹 Chèn chi tiết đơn hàng
    const sqlDetail = `
      INSERT INTO don_hang_ct (don_hang_id, sach_id, So_luong, gia)
      VALUES ?
    `;

    const values = products.map((p) => [don_hang_id, p.id, p.quantity, p.price]);

    db.query(sqlDetail, [values], (err2) => {
      if (err2) {
        console.error("❌ Lỗi khi thêm chi tiết đơn hàng:", err2.sqlMessage);
        return res.status(500).json({ error: "Không thể lưu chi tiết đơn hàng" });
      }

      console.log("✅ Đã lưu chi tiết đơn hàng cho ID:", don_hang_id);
      res.json({ message: "🎉 Đặt hàng thành công!", orderId: don_hang_id });
    });
  });
});

// 🔹 Xoá đơn hàng
app.delete("/orders/:id", (req, res) => {
  const id = req.params.id;
  const orders = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  orders.splice(index, 1);
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
  res.json({ message: "Xoá đơn hàng thành công" });
});

// 🔹 Cập nhật trạng thái đơn hàng
app.patch("/orders/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const orders = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  order.status = status;
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));

  res.json({ message: "Cập nhật trạng thái thành công", order });
});


// 🟢 Lấy tất cả voucher
app.get("/api/voucher", (req, res) => {
  const sql = "SELECT * FROM ma_giam_gia ORDER BY giam_gia_id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi truy vấn voucher:", err);
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

// 🟡 Thêm voucher mới
app.post("/api/voucher", (req, res) => {
  const { code, discount, min_order, max_discount, start_date, end_date, description } = req.body;

  if (!code || !discount) {
    return res.status(400).json({ error: "Thiếu mã voucher hoặc giá trị giảm" });
  }

  const sql = `
    INSERT INTO ma_giam_gia 
    (ma_gg, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, ngay_bd, ngay_kt, gioi_han_sd, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, ?, 100, 1)
  `;

  db.query(
    sql,
    [code, description || "fixed", discount, max_discount, min_order, start_date, end_date],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi thêm voucher:", err);
        return res.status(500).json({ error: "Không thể thêm voucher" });
      }
      res.json({ message: "✅ Thêm voucher thành công", id: result.insertId });
    }
  );
});

// 🔵 Cập nhật voucher
app.put("/api/voucher", (req, res) => {
  const { id, code, discount, min_order, max_discount, start_date, end_date, description } = req.body;

  if (!id) return res.status(400).json({ error: "Thiếu ID voucher cần cập nhật" });

  const sql = `
    UPDATE ma_giam_gia 
    SET ma_gg=?, loai_giam=?, gia_tri_giam=?, giam_toi_da=?, don_toi_thieu=?, ngay_bd=?, ngay_kt=? 
    WHERE giam_gia_id=?
  `;

  db.query(
    sql,
    [code, description || "fixed", discount, max_discount, min_order, start_date, end_date, id],
    (err) => {
      if (err) {
        console.error("❌ Lỗi khi cập nhật voucher:", err);
        return res.status(500).json({ error: "Không thể cập nhật voucher" });
      }
      res.json({ message: "✅ Cập nhật voucher thành công" });
    }
  );
});

// 🔴 Xoá voucher
app.delete("/api/voucher", (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Thiếu ID voucher cần xóa" });

  const sql = "DELETE FROM ma_giam_gia WHERE giam_gia_id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Lỗi khi xoá voucher:", err);
      return res.status(500).json({ error: "Không thể xoá voucher" });
    }
    res.json({ message: "🗑️ Xoá voucher thành công" });
  });
});

// 📸 API lấy hình ảnh theo sách_id
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


// ================== CHẠY SERVER ==================
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
