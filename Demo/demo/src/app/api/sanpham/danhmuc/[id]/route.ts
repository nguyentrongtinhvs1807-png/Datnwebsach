// src/app/api/sanpham/danhmuc/[id]/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Định nghĩa type rõ ràng – Next.js 15 yêu cầu nghiêm ngặt hơn
type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Thiếu ID danh mục" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM san_pham WHERE danh_muc_id = ?",
      [id]
    );

    // Nếu không có sản phẩm nào thì vẫn trả 200 + mảng rỗng (chuẩn REST)
    return NextResponse.json(rows.length > 0 ? rows : [], { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    return NextResponse.json(
      { error: "Lỗi server nội bộ" },
      { status: 500 }
    );
  }
}