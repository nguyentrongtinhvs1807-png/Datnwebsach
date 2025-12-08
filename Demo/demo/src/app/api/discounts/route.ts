// app/api/discounts/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ← ĐỔI TỪ giam_gia → ma_giam_gia
    const res = await fetch("http://localhost:3003/ma_giam_gia", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không lấy được dữ liệu mã giảm giá");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi lấy mã giảm giá:", error);
    return NextResponse.json(
      { error: "Không kết nối được server giảm giá" },
      { status: 500 }
    );
  }
}