import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM category WHERE active = 1");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
