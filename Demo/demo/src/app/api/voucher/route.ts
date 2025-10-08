import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");


    if (code) {
      const [rows]: any = await pool.query("SELECT * FROM voucher WHERE code = ?", [code]);
      return NextResponse.json(rows);
    }

    const [rows]: any = await pool.query("SELECT * FROM voucher WHERE active = 1");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Lỗi API voucher:", error);
    return NextResponse.json(
      { message: "Lỗi truy vấn database", error },
      { status: 500 }
    );
  }
}
