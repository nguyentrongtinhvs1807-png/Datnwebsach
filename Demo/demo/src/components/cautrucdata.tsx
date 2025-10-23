// ✅ Định nghĩa cấu trúc dữ liệu cho Loại Sách
export interface ILoaiSach {
  loai_sach_id: number;
  ten_loai: string;
}

// ✅ Định nghĩa cấu trúc dữ liệu cho Sách
export interface ISach {
  sach_id: number;
  loai_sach_id: number;
  ten_tac_gia: string;
  ten_NXB: string;
  ten_sach: string;
  gia_sach: number;
  ton_kho_sach: number;
  mo_ta: string;
  gg_sach: number; // 👉 gg có thể là “giảm giá” → nên ghi chú rõ
  loai_bia: string;
  image?: string; // 👉 thêm ảnh vì anh đang dùng `book.image` bên UI
  created_at?: string; // 👉 nếu sau này cần hiển thị “new” theo ngày
}
