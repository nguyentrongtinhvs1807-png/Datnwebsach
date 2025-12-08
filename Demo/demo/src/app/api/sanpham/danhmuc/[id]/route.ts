import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID danh mục" }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM san_pham WHERE danh_muc_id = ?",
      [id]
    );

    return NextResponse.json(rows.length > 0 ? rows : [], { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}