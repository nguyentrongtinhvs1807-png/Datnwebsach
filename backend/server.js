const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("./database"); // Sequelize model

const app = express();

// Cấu hình CORS cho frontend (localhost:3000)
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // 👈 thêm PATCH
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());

// Kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // đổi nếu MySQL có mật khẩu
  database: "laptop_node",
});

// ================== MAP SẢN PHẨM ==================
const mapProduct = (row) => ({
  id: row.id,
  name: row.ten_sp || "Không rõ tên",
  price: Number(row?.gia) || 0,               // ép về số
  originalPrice: Number(row?.gia_km) || 0,
  image: row.hinh || "",
  description: row.mo_ta || "Chưa có mô tả",
  hot: Number(row?.hot) || 0,
  tac_gia: row.tac_gia || "Không rõ tác giả",
    book_type: row.book_type || "Không rõ loại bìa"
});

// ================== API SẢN PHẨM ==================
app.get("/products", (req, res) => {
  const sql = `
    SELECT id, ten_sp, gia, gia_km, hinh, mo_ta, hot, an_hien, tac_gia, book_type
    FROM san_pham
    WHERE an_hien = 1
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(mapProduct));
  });
});

app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id, ten_sp, gia, gia_km, hinh, mo_ta, hot, an_hien, tac_gia, book_type FROM san_pham WHERE id = ? LIMIT 1`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(mapProduct(results[0]));
  });
});

app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, originalPrice, image, description, hot, tac_gia } = req.body;

  const sql = `
    UPDATE san_pham
    SET ten_sp = ?, gia = ?, gia_km = ?, hinh = ?, mo_ta = ?, hot = ?, tac_gia = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, price, originalPrice, image, description, hot ?? 0, tac_gia, id],
    (err, results) => {
      if (err) {
        console.error("❌ SQL Error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm để cập nhật" });
      }

      res.json({ success: true, message: "✅ Cập nhật sản phẩm thành công!" });
    }
  );
});

app.get("/hotProducts", (req, res) => {
  const sql = `
    SELECT 
      id, 
      ten_sp, 
      gia, 
      gia_km, 
      hinh, 
      mo_ta, 
      hot, 
      tac_gia,
      book_type
    FROM san_pham
    WHERE hot = 1 AND an_hien = 1
    ORDER BY id DESC
    LIMIT 12
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(mapProduct));
  });
});

app.get("/saleProducts", (req, res) => {
  const sql = `
    SELECT id, ten_sp, gia, gia_km, hinh, mo_ta, hot, tac_gia, book_type
    FROM san_pham
    WHERE gia_km > 0 AND (hot IS NULL OR hot = 0) AND an_hien = 1
    ORDER BY id DESC
    LIMIT 12
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(mapProduct));
  });
});

app.get("/newProducts", (req, res) => {
  const sql = `
    SELECT id, ten_sp, gia, gia_km, hinh, mo_ta, hot, ngay, tac_gia
    FROM san_pham
    WHERE an_hien = 1
    ORDER BY ngay DESC
    LIMIT 12
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(mapProduct));
  });
});

// ================== API COMMENTS ==================
app.get("/comments/:productId", (req, res) => {
  const { productId } = req.params;
  const sql = `
    SELECT c.id,
           c.product_id AS productId,
           u.ho_ten AS user,
           c.noi_dung AS content,
           c.ngay AS createdAt
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.product_id = ?
    ORDER BY c.ngay DESC
  `;
  db.query(sql, [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/comments", (req, res) => {
  const { productId, userId, content } = req.body;
  if (!productId || !userId || !content) {
    return res.status(400).json({ error: "Thiếu dữ liệu!" });
  }

  const sql =
    "INSERT INTO comments (product_id, user_id, noi_dung, ngay) VALUES (?, ?, ?, NOW())";
  db.query(sql, [productId, userId, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const getUserSql = "SELECT ho_ten FROM users WHERE id = ? LIMIT 1";
    db.query(getUserSql, [userId], (err2, userRes) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        id: result.insertId,
        productId,
        user: userRes.length > 0 ? userRes[0].ho_ten : "Khách",
        content,
        createdAt: new Date(),
      });
    });
  });
});

app.get("/comments", (req, res) => {
  const sql = `
    SELECT c.id,
           c.product_id AS productId,
           u.ho_ten AS user,
           c.noi_dung AS content,
           c.ngay AS createdAt
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    ORDER BY c.ngay DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/comments/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM comments WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Xoá thành công!" });
  });
});

// ================== API USER ==================
app.get("/users", (req, res) => {
  let sql = "SELECT id, ho_ten AS name, email, vai_tro AS role FROM users";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json(result);
  });
});

app.delete("/users/:id", (req, res) => {
  let sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi khi xóa" });
    res.json({ message: "Xóa thành công" });
  });
});

// ================== API ĐƠN HÀNG ==================
app.get("/orders", (req, res) => {
  const query = `
    SELECT dh.id_dh, dh.ho_ten, dh.email, dh.sdt, dh.dia_chi, dh.phuong_thuc, dh.tong_tien, dh.thoi_diem_mua,
           sp.id AS product_id, sp.ten_sp, sp.gia, sp.hinh, ct.so_luong
    FROM don_hang dh
    LEFT JOIN don_hang_chi_tiet ct ON dh.id_dh = ct.id_dh
    LEFT JOIN san_pham sp ON sp.id = ct.id_sp
    ORDER BY dh.id_dh DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Lỗi SQL:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ================== HÀM HỖ TRỢ ==================
// Hàm convert ISO → MySQL DATETIME
function formatDateToMySQL(dateString) {
  const date = new Date(dateString);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

// 📌 API thêm đơn hàng mới
app.post("/orders", (req, res) => {
  console.log("📦 FE gửi lên:", req.body);

  // Lấy data FE gửi
  const {
    ho_ten,
    email,
    phone,
    address,
    payment,
    products,
    totalPrice,
    discount,
    status,
    createdAt
  } = req.body;

  // Map sang field đúng trong DB
  const sdt = phone;
  const dia_chi = address;
  const phuong_thuc = payment;
  const tong_tien = totalPrice;
  const cart = products;

  // Kiểm tra dữ liệu
  if (!ho_ten || !email || !sdt || !dia_chi || !phuong_thuc || !tong_tien || !cart || cart.length === 0) {
    console.log("❌ Dữ liệu thiếu:", { ho_ten, email, sdt, dia_chi, phuong_thuc, tong_tien, cart });
    return res.status(400).json({ error: "Thiếu dữ liệu đầu vào" });
  }

  // ✅ Thêm vào bảng don_hang
  const insertDonHang = `
    INSERT INTO don_hang (ho_ten, email, sdt, dia_chi, phuong_thuc, tong_tien, trang_thai, thoi_diem_mua)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 👉 Convert createdAt sang DATETIME MySQL
  const thoi_diem_mua = createdAt ? formatDateToMySQL(createdAt) : formatDateToMySQL(new Date());

  db.query(
    insertDonHang,
    [ho_ten, email, sdt, dia_chi, phuong_thuc, tong_tien, status || "Đang xử lý", thoi_diem_mua],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi thêm đơn hàng:", err);
        return res.status(500).json({ error: "Lỗi khi thêm đơn hàng" });
      }

      const id_dh = result.insertId;
      console.log("✅ Đã thêm đơn hàng, id:", id_dh);

      // ✅ Thêm chi tiết đơn hàng
      const values = cart.map(item => [id_dh, item.id, item.quantity]);
      console.log("🛒 Chi tiết giỏ hàng:", values);

      const insertChiTiet = `
        INSERT INTO don_hang_chi_tiet (id_dh, id_sp, so_luong)
        VALUES ?
      `;

      db.query(insertChiTiet, [values], (err2, result2) => {
        if (err2) {
          console.error("❌ Lỗi khi thêm chi tiết:", err2);
          return res.status(500).json({ error: "Lỗi khi thêm chi tiết đơn hàng" });
        }

        console.log("✅ Đã thêm", result2.affectedRows, "sản phẩm vào chi tiết đơn hàng");

        res.json({
          message: "✅ Đặt hàng thành công",
          id_dh,
          ho_ten,
          email,
          sdt,
          dia_chi,
          phuong_thuc,
          tong_tien,
          cart,
          thoi_diem_mua
        });
      });
    }
  );
});



// Cập nhật trạng thái đơn hàng
app.patch("/orders/:id", (req, res) => {
  const { id } = req.params;                 // lấy id từ URL
  const { trang_thai, status } = req.body;   // lấy từ body
  const finalStatus = trang_thai || status;  // ưu tiên cột nào có

  if (!finalStatus) {
    return res.status(400).json({ error: "Thiếu trạng thái" });
  }

  const sql = "UPDATE don_hang SET trang_thai = ? WHERE id_dh = ?";
  db.query(sql, [finalStatus, id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi SQL:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, message: "✅ Cập nhật trạng thái thành công!" });
  });
});


// ================== API AUTH (Sequelize) ==================
app.post(`/api/dangnhap`, async (req, res) => {
  let { email, mat_khau } = req.body;
  const user = await UserModel.findOne({ where: { email } });
  if (!user) return res.status(401).json({ thong_bao: "Email không tồn tại" });

  const kq = bcrypt.compareSync(mat_khau, user.mat_khau);
  if (!kq) return res.json({ thong_bao: "Mật khẩu không đúng" });
  if (user.khoa) return res.json({ thong_bao: "Tài khoản bị khóa" });

  let PRIVATE_KEY = fs.readFileSync("private-key.txt");
  const payload = { id: user.id, email: user.email };
  const maxAge = "1h";
  const bearToken = jwt.sign(payload, PRIVATE_KEY, {
    expiresIn: maxAge,
    subject: user.id + "",
  });
  res.status(200).json({
    token: bearToken,
    expiresIn: maxAge,
    thong_bao: "Đăng nhập thành công",
    info: {
      id: user.id,
      ho_ten: user.ho_ten,
      email: user.email,
      vai_tro: user.vai_tro,
    },
  });
});

app.post('/api/dangky', async (req, res) => {
  try {
    let { ho_ten, email, mat_khau, go_lai_mat_khau } = req.body;

    const user = await UserModel.findOne({ where: { email } });
    if (user) return res.status(409).json({ thong_bao: 'Email đã tồn tại' });

    if (!mat_khau || mat_khau.length < 6)
      return res.status(400).json({ thong_bao: 'Mật khẩu phải >=6 ký tự' });

    if (mat_khau !== go_lai_mat_khau)
      return res.status(400).json({ thong_bao: 'Hai mật khẩu không giống' });

    const mk_mahoa = await bcrypt.hash(mat_khau, 10);
    await UserModel.create({ ho_ten, email, mat_khau: mk_mahoa, vai_tro: 0 });

    return res.status(200).json({ thong_bao: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ thong_bao: 'Lỗi server nội bộ' });
  }
});

// ================== API AUTH (MySQL thuần) ==================
app.post("/auth/register", async (req, res) => {
  const { ho_ten, email, dien_thoai, mat_khau } = req.body;
  if (!ho_ten || !email || !dien_thoai || !mat_khau) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const checkSql = "SELECT id FROM users WHERE email = ? LIMIT 1";
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    try {
      const hashedPassword = await bcrypt.hash(mat_khau, 10);
      const sql = `
        INSERT INTO users (ho_ten, email, dien_thoai, mat_khau, vai_tro) 
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(sql, [ho_ten, email, dien_thoai, hashedPassword, 0], (err2, result) => {
        if (err2) return res.status(500).json({ message: err2.message });
        return res.status(200).json({ message: "Đăng ký thành công", userId: result.insertId });
      });
    } catch (e) {
      return res.status(500).json({ message: "Lỗi server", error: e.message });
    }
  });
});

app.post("/auth/login", (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau)
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });

  const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Email không tồn tại" });

    const user = results[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const role = user.vai_tro === 1 ? "admin" : "user";

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        vai_tro: role,
      },
    });
  });
});

// ================== API XÓA SẢN PHẨM ==================
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM san_pham WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Xóa sản phẩm thành công!" });
  });
});
// ================== API STATS (gộp 1 endpoint) ==================
app.get("/stats", (req, res) => {
  const queries = {
    products: "SELECT COUNT(*) AS total FROM san_pham",
    users: "SELECT COUNT(*) AS total FROM users",
    orders: "SELECT COUNT(*) AS total FROM don_hang",
    revenue: `
      SELECT DATE_FORMAT(thoi_diem_mua, "%Y-%m") AS month, 
             SUM(tong_tien) AS total
      FROM don_hang
      GROUP BY month
      ORDER BY month
    `
  };

  let results = {};
  let done = 0;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // revenue là danh sách → giữ nguyên, còn lại chỉ lấy số
      results[key] = key === "revenue" ? rows : rows[0].total;

      done++;
      if (done === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// ================== START SERVER ==================
app.listen(3003, () => {
  console.log("🚀 Server chạy tại http://localhost:3003");
});