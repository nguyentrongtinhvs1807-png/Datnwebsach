import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // đổi nếu có mật khẩu
  database: "laptop_node",
});
