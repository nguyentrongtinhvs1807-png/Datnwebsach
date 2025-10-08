import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM danh_muc_sach ORDER BY id ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi API danh mục:", error);
    return NextResponse.json({ message: "Lỗi truy vấn database" }, { status: 500 });
  }
}
