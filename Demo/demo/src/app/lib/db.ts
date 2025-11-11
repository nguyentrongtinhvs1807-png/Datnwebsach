import mysql from "mysql2/promise";

// ⚙️ Tạo connection pool để tái sử dụng kết nối
export const pool = mysql.createPool({
  host: "localhost",      
  user: "root",            //  sửa theo tài khoản MySQL 
  password: "",            // thêm nếu có mật khẩu
  database: "pibook_db", //  Đặt đúng tên DB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
