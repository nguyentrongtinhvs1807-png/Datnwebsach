const { Sequelize, DataTypes } = require("sequelize");

// Kết nối database
const sequelize = new Sequelize("laptop_node", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// Model loai
const LoaiModel = sequelize.define(
  "loai",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ten_loai: { type: DataTypes.STRING, allowNull: false },
    thu_tu: { type: DataTypes.INTEGER, defaultValue: 0 },
    an_hien: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: false, tableName: "loai" }
);

// Model san_pham
const SanPhamModel = sequelize.define(
  "san_pham",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ten_sp: { type: DataTypes.STRING },
    ngay: { type: DataTypes.DATE },
    gia: { type: DataTypes.INTEGER },
    gia_km: { type: DataTypes.INTEGER },
    id_loai: { type: DataTypes.INTEGER },
    hot: { type: DataTypes.INTEGER },
    an_hien: { type: DataTypes.INTEGER },
    hinh: { type: DataTypes.STRING },
    tinh_chat: { type: DataTypes.INTEGER, defaultValue: 0 },
    luot_xem: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: false, tableName: "san_pham" }
);

// Model tin_tuc
const TinTucModel = sequelize.define(
  "tin_tuc",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tieu_de: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING },
    mo_ta: { type: DataTypes.TEXT },
    hinh: { type: DataTypes.STRING },
    ngay: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    noi_dung: { type: DataTypes.TEXT },
    id_loai: { type: DataTypes.INTEGER },
    luot_xem: { type: DataTypes.INTEGER, defaultValue: 0 },
    hot: { type: DataTypes.INTEGER, defaultValue: 0 },
    an_hien: { type: DataTypes.INTEGER, defaultValue: 1 },
    tags: { type: DataTypes.STRING },
  },
  { timestamps: false, tableName: "tin_tuc" }
);

// Kiểm tra kết nối
sequelize
  .authenticate()
  .then(() => console.log("✅ Kết nối MySQL thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MySQL:", err));

// Xuất các model
module.exports = { sequelize, SanPhamModel, LoaiModel, TinTucModel };
