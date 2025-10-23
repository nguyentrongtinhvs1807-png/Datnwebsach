// const jsonServer = require("json-server");
// const server = jsonServer.create();
// const router = jsonServer.router("db.json"); 
// const middlewares = jsonServer.defaults();

// server.use(middlewares);
// server.use(jsonServer.bodyParser);

// // Middleware xử lý đơn hàng (tạo mới)
// server.post("/orders", (req, res) => {
//   const db = router.db; // Lấy dữ liệu từ db.json
//   const orders = db.get("orders").value(); // Lấy danh sách đơn hàng

//   const newOrder = {
//     id: Date.now(),
//     userId: req.body.userId || "guest", // Mặc định là khách nếu chưa có user
//     products: req.body.products,
//     totalPrice: req.body.totalPrice,
//     status: "Chờ xác nhận", // Trạng thái mặc định
//     createdAt: new Date().toISOString()
//   };

//   db.get("orders").push(newOrder).write(); // Lưu vào db.json
//   res.status(201).json(newOrder);
// });

// server.use(router);

// const PORT = 3003
// ;
// server.listen(PORT, () => {
//   console.log(`🚀 JSON Server đang chạy tại http://localhost:${PORT}`);
// });

const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const fs = require("fs");

server.use(middlewares);
server.use(jsonServer.bodyParser);

//  Đăng ký tài khoản
server.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const db = router.db; // Lấy dữ liệu từ db.json
  const users = db.get("users").value() || [];

  // Kiểm tra email đã tồn tại chưa
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: "Email đã tồn tại!" });
  }

  // Tạo user mới
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: "user" // Mặc định user
  };

  db.get("users").push(newUser).write(); // Lưu vào db.json
  res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
});

// Đăng nhập
server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const users = db.get("users").value() || [];

  const user = users.find((user) => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
  }

  res.status(200).json({ message: "Đăng nhập thành công!", user });
});

//  Xử lý đơn hàng (tạo mới)
server.post("/orders", (req, res) => {
  const db = router.db;
  const orders = db.get("orders").value() || [];

  const newOrder = {
    id: Date.now(),
    userId: req.body.userId || "guest",
    products: req.body.products,
    totalPrice: req.body.totalPrice,
    status: "Chờ xác nhận",
    createdAt: new Date().toISOString()
  };

  db.get("orders").push(newOrder).write();
  res.status(201).json(newOrder);
});

server.use(router);

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`JSON Server đang chạy tại http://localhost:${PORT}`);
});
