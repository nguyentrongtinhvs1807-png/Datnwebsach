import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const role = req.cookies.get("role")?.value || "user"; // user | admin

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
