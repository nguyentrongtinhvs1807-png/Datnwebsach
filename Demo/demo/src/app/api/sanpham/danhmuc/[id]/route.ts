import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; // ✅ đúng cú pháp import

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params; // ✅ dùng context.params thay vì destructuring trực tiếp
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID danh mục" }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM san_pham WHERE danh_muc_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json([], { status: 200 }); // Trả mảng rỗng nếu không có sản phẩm
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Lỗi lấy sản phẩm theo danh mục:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
